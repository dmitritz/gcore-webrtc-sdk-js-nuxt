import type { WebrtcStreamParams } from "@gcorevideo/rtckit";

export default function useMediaDevicesReconfigure() {
  const state = useUserMedia();
  const mediaDevices = useMediaDevices() // TODO module-level
  const webrtcStreaming = useWebrtcStreaming()

  const constraints: ComputedRef<WebrtcStreamParams> = computed(() => {
    const params: WebrtcStreamParams = {
      audio: false,
      video: false,
    };
    if (mediaDevices.value.willUseMic) {
      params.audio = mediaDevices.value.micDeviceId || true;
    }
    if (mediaDevices.value.willUseCamera) {
      params.video = mediaDevices.value.cameraDeviceId || mediaDevices.value.cameraDevicesList[0]?.deviceId || false
      if (mediaDevices.value.resolution) {
        params.resolution = mediaDevices.value.resolution
      }
    }
    return params
  })

  watch(
    () => foldConstraints(constraints.value),
    async (_: string) => {
      closeTracks()
      if (
        constraints.value.audio ===
        false &&
        constraints.value.video ===
        false
      ) {
        return
      }
      try {
        const s =
          await webrtcStreaming.get().openSourceStream(constraints.value)
        state.value.stream = s
        s.getTracks().forEach(
          (track: MediaStreamTrack) => {
            if (
              track.kind === 'audio'
            ) {
              state.value.audioTrack =
                track
              track.addEventListener(
                'ended',
                () => {
                  if (
                    state.value
                      .audioTrack ===
                    track
                  ) {
                    state.value.audioTrack =
                      null
                  }
                },
              )
            } else {
              state.value.videoTrack =
                track
              track.addEventListener(
                'ended',
                () => {
                  if (
                    state.value
                      .videoTrack ===
                    track
                  ) {
                    state.value.videoTrack =
                      null
                  }
                },
              )
            }
          },
        )
      } catch (e) {
        state.value.error = String(e)
      }
    },
    {
      immediate: true,
    }
  )

  function closeTracks() {
    const s = state.value.stream
    if (s) {
      s.getTracks().forEach((t) => {
        s.removeTrack(t)
        t.stop()
      })
      state.value.stream = null
    }
    state.value.audioTrack = null
    state.value.videoTrack = null
  }
}

function foldConstraints(c: WebrtcStreamParams) {
  return `audio:${c.audio};video:${c.video};resolution:${c.resolution}`
}
