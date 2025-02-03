import {
  ApiKey,
  GcoreApi,
} from '@gcorevideo/rtckit-node'
import { WebrtcStream } from '@gcorevideo/rtckit-node/dist/WebrtcApi'

export default function gcoreApi() {
  const config = useRuntimeConfig()
  return new GcoreApi(
    new ApiKey(config.apiKey),
    config.apiHost
  )
}

export async function createWebrtcStream(
  name: string,
) {
  const webrtc = gcoreApi().webrtc
  return await webrtc.createStream(name)
}

export function webrtcStreamCreatedResponse(stream: WebrtcStream) {
  return {
    id: stream.id,
    playerUrl: stream.playerUrl,
    whepEndpoint: stream.whepEndpoint,
    whipEndpoint: stream.whipEndpoint,
    sources: [
      stream.dashUrl,
      stream.hlsCmafUrl,
      stream.hlsMpegtsUrl,
    ].filter((s: string | null) => s !== null),
  }
}
