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
      const newCameras = await webrtcStreaming.get()
        .mediaDevices.getCameras()
      if (sameDevices(mediaDevices.value.cameraDevicesList, newCameras)) {
        return
      }
      mediaDevices.value.cameraDevicesList = newCameras.map((d, i) => ({
        deviceId: d.deviceId,
        label:
          d.label ||
          `Camera ${i + 1}`,
        groupId: d.groupId,
      }));
    });
  }

  async function updateMicrophones() {
    await updateDevicesList(async () => {
      const newMics = await webrtcStreaming.get().mediaDevices.getMicrophones();
      if (sameDevices(mediaDevices.value.micDevicesList, newMics)) {
        return
      }
      mediaDevices.value.micDevicesList = newMics.map((d, i) => ({
        deviceId: d.deviceId,
        label:
          d.label ||
          `Microphone ${i + 1}`,
        groupId: d.groupId,
      }))
    });
  }

  function sameDevices(alist: DeviceInfo[], blist: DeviceInfo[]): boolean {
    if (alist.length !== blist.length) {
      return false
    }
    // TODO check: assuming the items order is stable
    return alist.every((a, i) => a.deviceId === blist[i].deviceId)
  }
}
