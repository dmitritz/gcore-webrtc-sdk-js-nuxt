import { watch } from 'vue'

import { type WebrtcStreamParams } from "@gcorevideo/rtckit";

import useWebrtcStreaming from './use-webrtc-streaming'

function useUserMedia(cb?: (start: () => void) => void) {
  const webrtcStreaming = useWebrtcStreaming()
  const mediaDevices = useMediaDevices()
  const state = useState<{
    audioTrack: MediaStreamTrack | null
    cameraEnabled: boolean
    error: string
    micEnabled: boolean
    stream: MediaStream | null
    videoTrack: MediaStreamTrack | null,
  }>('userMedia', () => ({
    audioTrack: null,
    cameraEnabled: true,
    error: '',
    micEnabled: true,
    stream: null,
    videoTrack: null,
  }))
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
    async (v: string) => {
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
  )
  watch(
    () => state.value.cameraEnabled,
    (val) => {
      if (state.value.videoTrack) {
        state.value.videoTrack.enabled =
          val
      }
    },
  )
  watch(
    () => state.value.micEnabled,
    (val) => {
      if (state.value.audioTrack) {
        state.value.audioTrack.enabled =
          val
      }
    },
  )

  if (cb) {
    // TODO setTimeout/nextTick
    cb(start)
  }
  return state

  function start() {
    updateDevicesList()
  }

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

  async function updateDevicesList() {
    const md = webrtcStreaming.get().mediaDevices
    mediaDevices.value.cameraDevicesList = await md
      .getCameras()
      .then(items => items.map((d, i) => ({
        deviceId: d.deviceId,
        label:
          d.label ||
          `Camera ${i + 1}`,
        groupId: d.groupId,
      })))
    mediaDevices.value.micDevicesList =
      await webrtcStreaming.get().mediaDevices.getMicrophones()
        .then(items => items.map((d, i) => ({
          deviceId: d.deviceId,
          label:
            d.label ||
            `Microphone ${i + 1}`,
          groupId: d.groupId,
        })))
  }
}

export default useUserMedia

function foldConstraints(c: WebrtcStreamParams) {
  return `audio:${c.audio};video:${c.video};resolution:${c.resolution}`
}
