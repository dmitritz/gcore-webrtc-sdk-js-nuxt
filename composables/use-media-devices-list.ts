export default function useMediaDevicesList() {
  const mediaDevices = useMediaDevices()
  const webrtcStreaming = useWebrtcStreaming()

  return {
    updateCameras,
    updateMicrophones
  }

  async function updateCameras() {
    mediaDevices.value.cameraDevicesList =
      await webrtcStreaming.get().mediaDevices.getCameras()
        .then(items => items.map((d, i) => ({
          deviceId: d.deviceId,
          label:
            d.label ||
            `Camera ${i + 1}`,
          groupId: d.groupId,
        })))
  }

  async function updateMicrophones() {
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
