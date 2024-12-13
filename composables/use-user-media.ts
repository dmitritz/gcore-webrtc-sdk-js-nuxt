import { WebrtcStreamingEvents } from "@gcorevideo/rtckit";

import useWebrtcStreaming from './use-webrtc-streaming.js'

export default function useUserMedia(cb?: (start: () => void) => void) {
  const webrtcStreaming = useWebrtcStreaming()
  const mediaDevices = useMediaDevices()
  const mediaDevicesList = useMediaDevicesList()
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

  if (cb) {
    cb(start)
  }
  return state

  // TODO extract
  function start() {
    updateDevicesList()

    const w = webrtcStreaming.get()
    w.on(WebrtcStreamingEvents.MediaDeviceSwitch, () => setTimeout(refreshDevicesList, 0));
    w.on(WebrtcStreamingEvents.MediaDeviceSwitchOff, () => setTimeout(refreshDevicesList, 0));

    function refreshDevicesList() {
      w.mediaDevices.reset();
      updateDevicesList();
    }
  }

  async function updateDevicesList() {
    await mediaDevicesList.updateCameras();
    await mediaDevicesList.updateMicrophones();
  }
}
