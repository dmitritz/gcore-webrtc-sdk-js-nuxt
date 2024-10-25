import {
  watch,
} from 'vue'

export type DeviceInfo = {
  label: string
  deviceId: string
}

export const VIDEORES: Record<
  string,
  { width: number; height: number }
> = {
  '1080p': {
    width: 1920,
    height: 1080,
  },
  '720p': {
    width: 1280,
    height: 720,
  },
  '480p': {
    width: 854,
    height: 480,
  },
  '360p': {
    width: 640,
    height: 360,
  },
  '240p': {
    width: 426,
    height: 240,
  },
}

export const VIDEORES_DEFAULT = '1080p'

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
    videoConstraints: {
      width: number
      height: number
    }
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
      videoConstraints: {
        ...VIDEORES[VIDEORES_DEFAULT],
      },
    }
  })
  watch(() => state.value.micDeviceId, (val) => {
    // TODO
  })
  watch(() => state.value.cameraDeviceId, (val) => {
    // TODO
  })
  // TODO watch the rest
  return state;
}
