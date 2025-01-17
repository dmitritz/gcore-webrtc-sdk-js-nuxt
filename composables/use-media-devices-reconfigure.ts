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
      params.video = mediaDevices.value.cameraDeviceId || mediaDevices.value.cameraDevicesList[0]?.deviceId || true
      if (mediaDevices.value.resolution) {
        params.resolution = mediaDevices.value.resolution
      }
    }
    return params
  })

  function closeTracks() {
    state.value.stream = null
    state.value.audioTrack = null
    state.value.videoTrack = null
  }

  async function openSourceStream() {
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
  }

  return (function () {
    let timerId: ReturnType<typeof setTimeout> | null = null
    return function () {
      if (timerId === null) {
        timerId = setTimeout(function () {
          timerId = null;
          openSourceStream();
        }, 0)
      }
    }
  }())
}

function foldConstraints(c: WebrtcStreamParams) {
  return `audio:${c.audio};video:${c.video};resolution:${c.resolution}`
}
