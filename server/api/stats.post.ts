import { TelemetryEvent } from '@gcorevideo/player'
import { consola } from 'consola'
import ms from 'ms'
import { z } from 'zod'

// Statistics (telemetry) endpoint
export default defineEventHandler(async function (event) {
  const body = await readBody(event) // TODO validate
  try {
    const { records } = await sanitizePayload(body)
    if (!records.length) {
      return
    }
    let baseTime = records[0].time
    for (const {data, time} of records) {
      const d = time - baseTime
      const t = d ? `+${ms(d)}` : new Date(time).toLocaleTimeString()
      consola.info('STAT %s %s', t, formatRecord(data))
    }
    event.node.res.end()
  } catch (error) {
    consola.error(error)
    event.node.res.end()
  }
})

function formatRecord(data: Record<string, string | number | boolean>) {
  return Object.entries(data)
    .map(([k, v]) => `${k}=${v}`)
    .join(' ')
}

function sanitizePayload(data: unknown) {
  const type = z.enum(['vod', 'live'])
  return z.object({
    records: z.array(z.object({
      data: z.discriminatedUnion("event", [
        z.object({
          event: z.literal(4),
          type: type,
          time: z.number(),
          total_ms: z.number(),
          count: z.number(),
        }),
        z.object({
          event: z.literal(1),
          type: type,
        }),
        z.object({
          event: z.literal(2),
          type: type,
        }),
        z.object({
          event: z.literal(3),
          type: type,
        }),
      ]),
      time: z.number(),
    }))
  }).parseAsync(data)
}
