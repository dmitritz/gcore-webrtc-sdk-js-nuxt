import { StreamMeta, WebrtcStreaming, type WebrtcStreamingOptions, type WhipClientOptions } from "@gcorevideo/rtckit";

let webrtc: WebrtcStreaming | null = null

const baseOptions = {
  mediaDevicesAutoSwitch: true,
  plugins: [
    new StreamMeta(),
  ]
}

function useWebrtcStreaming() {
  return {
    close() {
      if (webrtc) {
        webrtc.close()
        webrtc = null
      }
    },
    configure(endpoint: string, options?: WebrtcStreamingOptions): WebrtcStreaming {
      const w = this.get()
      const opts = options ? { ...baseOptions, ...options } : baseOptions
      w.configure(endpoint, opts)
      return w
    },
    get(): WebrtcStreaming {
      if (!webrtc) {
        webrtc = new WebrtcStreaming("", baseOptions)
      }
      return webrtc
    },
    start() {
      this.get().run()
    },
  }
}

export default useWebrtcStreaming