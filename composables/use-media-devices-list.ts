export default function useMediaDevicesList() {
  const mediaDevices = useMediaDevices()
  const webrtcStreaming = useWebrtcStreaming()

  return {
    updateCameras,
    updateMicrophones
  }

  async function updateDevicesList(cb: () => Promise<void>) {
    try {
      await cb()
    } catch (e) {
      mediaDevices.value.error = String(e);
    }
  }

  async function updateCameras() {
    await updateDevicesList(async () => {
      mediaDevices.value.cameraDevicesList = await webrtcStreaming.get()
        .mediaDevices.getCameras()
        .then(items => items.map((d, i) => ({
          deviceId: d.deviceId,
          label:
            d.label ||
            `Camera ${i + 1}`,
          groupId: d.groupId,
        })))
    });
  }

  async function updateMicrophones() {
    await updateDevicesList(async () => {
      mediaDevices.value.micDevicesList =
        await webrtcStreaming.get().mediaDevices.getMicrophones()
          .then(items => items.map((d, i) => ({
            deviceId: d.deviceId,
            label:
              d.label ||
              `Microphone ${i + 1}`,
            groupId: d.groupId,
          })))
    });
  }
}
