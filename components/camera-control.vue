<script setup lang="ts">
import { WebrtcStreamingEvents } from "@gcorevideo/rtckit";

import useMediaDevices from '~/composables/use-media-devices'
import useUserMedia from '~/composables/use-user-media'
import useWebrtcStreaming from '~/composables/use-webrtc-streaming';

const air = useAir()

const mediaDevices = useMediaDevices()
const userMedia = useUserMedia()
const webrtcStreaming = useWebrtcStreaming().get();

webrtcStreaming.on(WebrtcStreamingEvents.MediaDeviceSwitch, (e) => {
  if (!mediaDevices.value.willUseCamera || air.value.ended) {
    return
  }
  if (e.kind === "video") {
    mediaDevices.value.cameraDeviceId = e.device.deviceId
  }
})

function onToggle() {
  if (air.value.live) {
    userMedia.value.cameraEnabled =
      !userMedia.value.cameraEnabled
  } else {
    mediaDevices.value.willUseCamera =
      !mediaDevices.value.willUseCamera
  }
}
</script>

<template>
  <device-settings
    :checked="
      mediaDevices.willUseCamera
    "
    :device-id="
      mediaDevices.cameraDeviceId
    "
    :devices-list="
      mediaDevices.cameraDevicesList
    "
    :disabled="air.ended"
    label="Camera"
    @change="devId => mediaDevices.cameraDeviceId = devId"
    @toggle="onToggle"
  >
    <span>
      <label for="videores">resolution</label>
      <select
        v-model="mediaDevices.resolution"
        :disabled="air.ended || !mediaDevices.willUseCamera || air.live"
        id="videores"
      >
        <option value key="0" disabled>Default</option>
        <option
          v-for="vres of mediaDevices.resolutions"
          :key="vres.height"
          :value="vres.height"
          :selected="
            mediaDevices.resolution === vres.height
          "
        >
          {{ vres.width }}×{{ vres.height }}
        </option>
      </select>
    </span>
  </device-settings>
</template>
