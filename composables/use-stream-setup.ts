import type { StreamInfo } from "~/types/stream"
import useStream from "./use-stream"
import usePersistence from "./use-persistence";

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
    const persisted = usePersistence() // only the stream ID is used for persistence
    const { data } = await fetchStream(persisted.value);
    if (data.value) {
      // @ts-ignore
      persisted.value = data.value
    }
    if (!persisted.value) {
      throw new Error(
        'Failed to create stream',
      )
    }
    if (sources.length || !Array.isArray(persisted.value.sources)) {
      persisted.value.sources = sources
    }
    stream.value = persisted.value
  }
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
