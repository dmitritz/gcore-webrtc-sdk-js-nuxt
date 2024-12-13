import type { StreamInfo } from "~/types/stream"

const STREAM_NAME = 'My damn awesome WebRTC stream'

const stream = ref<StreamInfo>({
  id: 0,
  whipEndpoint: '',
  whepEndpoint: '',
  playerUrl: '',
})

export default async function useStream(): Promise<Ref<StreamInfo>> {
  const url = useRequestURL();
  const streamId = url.searchParams.get('stream_id');
  const token = url.searchParams.get('stream_token');
  const server = url.searchParams.get('server');
  if (streamId && token) {
    stream.value.id = parseInt(streamId, 10)
    stream.value.whipEndpoint = buildWhipEndpoint(streamId, token, server || '')
    stream.value.whepEndpoint = ''
    stream.value.playerUrl = ''
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
    stream.value = cookie.value
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
