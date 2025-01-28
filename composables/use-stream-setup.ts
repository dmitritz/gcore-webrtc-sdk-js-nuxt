import type { StreamInfo } from "~/types/stream"
import useStream from "./use-stream"

const STREAM_NAME = 'My damn awesome WebRTC stream'

export default async function useStreamSetup(): Promise<Ref<StreamInfo>> {
  const stream = useStream()
  const url = useRequestURL();
  const streamId = url.searchParams.get('stream_id');
  const token = url.searchParams.get('stream_token');
  const server = url.searchParams.get('server');
  const sources = url.searchParams.get('sources')?.split(',') ?? [];
  if (streamId && token) {
    stream.value.id = parseInt(streamId, 10)
    stream.value.whipEndpoint = buildWhipEndpoint(streamId, token, server || '')
    stream.value.whepEndpoint = '' // TODO drop
    stream.value.playerUrl = ''
    stream.value.sources = sources
  } else {
    const cookie =
      useCookie<StreamInfo>('stream')
    const { data } = await fetchStream(cookie.value);
    if (data.value) {
      // @ts-ignore
      cookie.value = data.value
    }
    if (!cookie.value) {
      throw new Error(
        'Failed to create stream',
      )
    }
    if (sources.length || !Array.isArray(cookie.value.sources)) {
      cookie.value.sources = sources
    }
    stream.value = cookie.value
  }
  console.log('useStreamSetup whip:%s sources:%s', stream.value.whipEndpoint, stream.value.sources.map(s => s.substring(0, 20)))
  return stream;
}

async function fetchStream(value: StreamInfo | undefined) {
  if (!value || !value.id) {
    return useFetch(
      '/api/generate',
      {
        method: 'POST',
        body: {
          name: STREAM_NAME,
        }
      },
    )
  }
  return useFetch('/api/keepalive', {
    method: 'POST',
    body: {
      id: value.id,
      name: STREAM_NAME,
    },
  })
}

function buildWhipEndpoint(streamId: string, token: string, hostname: string): string {
  return `https://${hostname || 'whip.gvideo.co'}/${streamId}_${token}/whip`
}
