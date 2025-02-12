import type { WebrtcStreamParams } from "@gcorevideo/rtckit";

export default function useMediaDevicesReconfigure() {
  const userMedia = useUserMedia();
  const mediaDevices = useMediaDevices(); // TODO module-level
  const webrtcStreaming = useWebrtcStreaming();
  const timerId = useState<ReturnType<typeof setTimeout> | null>(
    "useMediaDevicesReconfigure.timerId",
    () => null
  );

  const constraints: ComputedRef<WebrtcStreamParams> = computed(() => {
    const params: WebrtcStreamParams = {
      audio: false,
      video: false,
    };
    if (mediaDevices.value.willUseMic) {
      params.audio = mediaDevices.value.micDeviceId || true;
    }
    if (mediaDevices.value.willUseCamera) {
      params.video =
        mediaDevices.value.cameraDeviceId ||
        mediaDevices.value.cameraDevicesList[0]?.deviceId ||
        true;
      if (mediaDevices.value.resolution) {
        params.resolution = mediaDevices.value.resolution;
      }
    }
    return params;
  });

  function closeTracks() {
    userMedia.value.stream = null;
    userMedia.value.audioTrack = null;
    userMedia.value.videoTrack = null;
  }

  async function openSourceStream() {
    closeTracks();
    if (
      constraints.value.audio === false &&
      constraints.value.video === false
    ) {
      return;
    }
    try {
      const s = await webrtcStreaming.get().openSourceStream(constraints.value);
      userMedia.value.stream = s;
      s.getTracks().forEach((track: MediaStreamTrack) => {
        if (track.kind === "audio") {
          userMedia.value.audioTrack = track;
          track.addEventListener("ended", () => {
            if (userMedia.value.audioTrack === track) {
              userMedia.value.audioTrack = null;
            }
          });
        } else {
          userMedia.value.videoTrack = track;
          track.addEventListener("ended", () => {
            if (userMedia.value.videoTrack === track) {
              userMedia.value.videoTrack = null;
            }
          });
        }
      });
    } catch (e) {
      userMedia.value.error = String(e);
    }
  }

  onBeforeUnmount(() => {
    if (timerId.value) {
      clearTimeout(timerId.value);
      timerId.value = null;
    }
  });

  return function () {
    if (timerId.value === null) {
      timerId.value = setTimeout(function () {
        timerId.value = null;
        openSourceStream();
      }, 0);
    }
  };
}
