<script setup lang="ts">
import { WebrtcStreamingEvents } from "@gcorevideo/rtckit";

import useMediaDevices from '~/composables/use-media-devices'
import useUserMedia from '~/composables/use-user-media'
import useWebrtcStreaming from '~/composables/use-webrtc-streaming';

const air = useAir()

const mediaDevices = useMediaDevices()
const userMedia = useUserMedia()
const webrtc = useWebrtcStreaming().get();
const mediaDevicesList = useMediaDevicesList()

watch(() => mediaDevices.value.cameraDeviceId, (val) => {
  if (val) {
    const r = webrtc.mediaDevices.getAvailableVideoResolutions(val)
    mediaDevices.value.resolutions = r
  } else {
    mediaDevices.value.resolutions = []
  }
})

watch(() => mediaDevices.value.cameraDevicesList, (val) => {
  if (val.length && !mediaDevices.value.cameraDeviceId) {
    mediaDevices.value.cameraDeviceId = val[0].deviceId
  }
})

watch(
  () => userMedia.value.cameraEnabled,
  (val) => {
    webrtc.toggleVideo(val)
  },
  {
    immediate: true,
  }
)

watch(() => userMedia.value.stream,
  (val) => {
    if (!val) {
      return;
    }
    const tracks = val.getVideoTracks()
    if (!tracks.length) {
      return;
    }
    const { height } = tracks[0].getSettings()
    if (height) {
      mediaDevices.value.resolution = height;
    }
  }
)

onMounted(() => {
  mediaDevicesList.updateCameras();
})

webrtc.on(WebrtcStreamingEvents.MediaDeviceSelect, (e) => {
  if (!mediaDevices.value.willUseCamera || air.value.ended) {
    return
  }
  if (e.kind === "video") {
    mediaDevices.value.cameraDeviceId = e.device.deviceId
  }
})

function onToggle() {
  userMedia.value.cameraEnabled =
    !userMedia.value.cameraEnabled
}
</script>

<template>
  <device-settings :checked="userMedia.cameraEnabled" :device-id="mediaDevices.cameraDeviceId"
    :devices-list="mediaDevices.cameraDevicesList" :disabled="air.ended" label="Camera" id="camera"
    @change="v => mediaDevices.cameraDeviceId = v" @toggle="onToggle">
    <span>
      <label for="camera_videores">quality</label>
      <select v-model="mediaDevices.resolution" :disabled="air.ended || !mediaDevices.willUseCamera || air.live"
        id="camera_videores">
        <option value key="0" disabled>Default</option>
        <option v-for="vres of mediaDevices.resolutions" :key="vres.height" :value="vres.height">
          {{ vres.width }}×{{ vres.height }}
        </option>
      </select>
    </span>
  </device-settings>
</template>
