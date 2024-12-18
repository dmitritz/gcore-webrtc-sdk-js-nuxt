<script setup lang="ts">
import { WebrtcStreamingEvents } from "@gcorevideo/rtckit";

import useMediaDevices from '~/composables/use-media-devices'
import useUserMedia from '~/composables/use-user-media'
import useWebrtcStreaming from '~/composables/use-webrtc-streaming';

const mediaDevices = useMediaDevices()
const mediaDevicesList = useMediaDevicesList()
const userMedia = useUserMedia()

const air = useAir()

const webrtcStreaming = useWebrtcStreaming().get();

watch(
  () => mediaDevices.value.willUseMic,
  (val) => {
    if (val && !mediaDevices.value.micDevicesList.length) {
      setTimeout(() => {
        mediaDevices.value.willUseMic = false
        userMedia.value.micEnabled = false;
      }, 0);
      return;
    }
    webrtcStreaming.toggleAudio(val)
  },
)

webrtcStreaming.on(WebrtcStreamingEvents.MediaDeviceSelect, (e) => {
  if (air.value.ended) {
    return
  }
  if (e.kind === "audio") {
    mediaDevices.value.micDeviceId = e.device.deviceId
  }
})

onMounted(() => {
  mediaDevicesList.updateMicrophones().then(() => {
    if (!mediaDevices.value.micDevicesList.length) {
      mediaDevices.value.willUseMic = false
      userMedia.value.micEnabled = false;
    }
    webrtcStreaming.toggleAudio(userMedia.value.micEnabled)
  })
})

function onChange(id: string) {
  mediaDevices.value.micDeviceId = id
  mediaDevices.value.willUseMic = true
}

function onToggle() {
  // disabled audio tracks doesn't play well with the ingester across all browsers (notably Safari)
  // userMedia.value.micEnabled = !userMedia.value.micEnabled
  mediaDevices.value.willUseMic = !mediaDevices.value.willUseMic

}
</script>

<template>
  <device-settings :checked="mediaDevices.willUseMic" :device-id="mediaDevices.micDeviceId"
    :devices-list="mediaDevices.micDevicesList" :disabled="air.ended" label="Microphone" @change="onChange" id="mic"
    @toggle="onToggle">
  </device-settings>
</template>
