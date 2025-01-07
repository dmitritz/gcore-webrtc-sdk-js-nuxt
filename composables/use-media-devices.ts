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

export default () => {
  const state = useState<{
    cameraDevicesList: DeviceInfo[]
    cameraDeviceId: string
    error: string
    micDevicesList: DeviceInfo[]
    micDeviceId: string
    willUseCamera: boolean
    willUseMic: boolean
    resolutions: VideoResoultion[]
    resolution: number
  }>("mediaDevices", () => ({
    cameraDevicesList: [],
    cameraDeviceId: '',
    error: '',
    micDevicesList: [],
    micDeviceId: '',
    willUseCamera: true,
    willUseMic: true,
    resolutions: [],
    resolution: VIDEORES_DEFAULT,
  }))
  return state;
}
