import { WebrtcStreaming, type WhipClientOptions } from "@gcorevideo/rtckit";

let webrtc: WebrtcStreaming | null = null

function useWebrtcStreaming() {
  return {
    close() {
      if (webrtc) {
        webrtc.close()
        webrtc = null
      }
    },
    configure(endpoint: string, options?: WhipClientOptions): WebrtcStreaming {
      const w = this.get()
      w.configure(endpoint, options)
      return w
    },
    get(): WebrtcStreaming {
      if (!webrtc) {
        webrtc = new WebrtcStreaming("")
      }
      return webrtc
    },
    start() {
      this.get().run()
    },
  }
}

export default useWebrtcStreaming