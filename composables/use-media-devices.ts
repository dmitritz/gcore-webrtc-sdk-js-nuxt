import {
  watch,
} from 'vue'

import useWebrtcStreaming from '~/composables/use-webrtc-streaming'

export type DeviceInfo = {
  label: string
  deviceId: string
}

// TODO import from rtckit
export type VideoResoultion = {
  width: number
  height: number
}

export const VIDEORES: Record<
  string,
  VideoResoultion> = {
  '1080': {
    width: 1920,
    height: 1080,
  },
  '720': {
    width: 1280,
    height: 720,
  },
  '480': {
    width: 854,
    height: 480,
  },
  '360': {
    width: 640,
    height: 360,
  },
  '240': {
    width: 426,
    height: 240,
  },
}

export const VIDEORES_DEFAULT = 1080

const webrtcStreaming = useWebrtcStreaming()

export default () => {
  const state = useState<{
    cameraDevicesList: DeviceInfo[]
    cameraDeviceId: string
    error: string
    micDevicesList: DeviceInfo[]
    micDeviceId: string
    willUseCamera: boolean
    willUseMic: boolean
    pending: boolean
    resolutions: VideoResoultion[]
    resolution: number
  }>("mediaDevices", () => {
    return {
      cameraDevicesList: [],
      cameraDeviceId: '',
      error: '',
      micDevicesList: [],
      micDeviceId: '',
      willUseCamera: false,
      willUseMic: false,
      pending: false,
      resolutions: [],
      resolution: VIDEORES_DEFAULT,
    }
  })
  watch(() => state.value.micDeviceId, (val) => {
    // TODO
  })
  watch(() => state.value.cameraDeviceId, (val) => {
    if (val) {
      const r = webrtcStreaming.get().mediaDevices.getAvailableVideoResolutions(val)
      state.value.resolutions = r
    } else {
      state.value.resolutions = []
    }
  })
  watch(() => state.value.cameraDevicesList, (val) => {
    if (val.length && !state.value.cameraDeviceId) {
      state.value.cameraDeviceId = val[0].deviceId
    }
  })
  // TODO watch the rest
  return state;
}
