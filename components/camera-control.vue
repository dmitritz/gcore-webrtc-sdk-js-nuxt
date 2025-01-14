<script setup lang="ts">
import { WebrtcStreamingEvents, type VideoResolution } from "@gcorevideo/rtckit";

import useMediaDevices from '~/composables/use-media-devices'
import useUserMedia from '~/composables/use-user-media'
import useWebrtcStreaming from '~/composables/use-webrtc-streaming';

const air = useAir()

const mediaDevices = useMediaDevices()
const userMedia = useUserMedia()
const webrtc = useWebrtcStreaming().get();
const mediaDevicesList = useMediaDevicesList()
const openSourceStream = useMediaDevicesReconfigure()

watch(() => mediaDevices.value.cameraDeviceId, (val) => {
  if (val) {
    const r = webrtc.mediaDevices.getAvailableVideoResolutions(val)
    if (!sameResolutions(mediaDevices.value.resolutions, r)) {
      mediaDevices.value.resolutions = r
    }
    ensureValidResolution();
  } else {
    mediaDevices.value.resolutions = []
  }
})

watch(() => mediaDevices.value.resolutions.map(({ height }) => String(height)).join(), () => {
  if (!mediaDevices.value.resolutions.length) {
    return
  }
  ensureValidResolution();
})

watch(() => mediaDevices.value.cameraDevicesList, () => {
  if (mediaDevices.value.cameraDevicesList.length && !mediaDevices.value.cameraDeviceId) {
    mediaDevices.value.cameraDeviceId = mediaDevices.value.cameraDevicesList[0].deviceId
    openSourceStream();
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
  mediaDevicesList.updateCameras().then(() => {
    if (!mediaDevices.value.cameraDevicesList.length) {
      mediaDevices.value.willUseCamera = false
      userMedia.value.cameraEnabled = false
      // TODO show error message as streaming without a camera is meaningless
    } else if (mediaDevices.value.willUseCamera) {
      mediaDevices.value.cameraDeviceId = mediaDevices.value.cameraDevicesList[0].deviceId
      openSourceStream()
    }
    webrtc.toggleVideo(userMedia.value.cameraEnabled)
  })
})

webrtc.on(WebrtcStreamingEvents.MediaDeviceSelect, (e) => {
  if (!mediaDevices.value.willUseCamera || air.value.ended) {
    return
  }
  if (e.kind === "video") {
    mediaDevices.value.cameraDeviceId = e.device.deviceId
  }
})

function ensureValidResolution() {
  if (mediaDevices.value.resolution && !mediaDevices.value.resolutions.some((v) => v.height === mediaDevices.value.resolution)) {
    mediaDevices.value.resolution = mediaDevices.value.resolutions[0].height
  }
}

function onToggle() {
  userMedia.value.cameraEnabled =
    !userMedia.value.cameraEnabled
}

function setCamera(id: string) {
  mediaDevices.value.cameraDeviceId = id
  mediaDevices.value.willUseCamera = true
  openSourceStream()
}

function setResolution() {
  // TODO check that the `mediaDevices.value.resolution` value has been updated
  openSourceStream()
}

function sameResolutions(a: VideoResolution[], b: VideoResolution[]) {
  if (a.length !== b.length) {
    return false
  }
  return a.every((v, i) => {
    const { width, height } = v
    const { width: bwidth, height: bheight } = b[i]
    return width === bwidth && height === bheight
  })
}
</script>

<template>
  <device-settings :checked="userMedia.cameraEnabled" :device-id="mediaDevices.cameraDeviceId"
    :devices-list="mediaDevices.cameraDevicesList" :disabled="air.ended" label="Camera" id="camera" @change="setCamera"
    @toggle="onToggle">
    <span>
      <label for="camera_videores">quality</label>
      <select v-model="mediaDevices.resolution" :disabled="air.ended || !mediaDevices.willUseCamera || air.live"
        id="camera_videores" @change="setResolution">
        <option value key="0" disabled>Default</option>
        <option v-for="vres of mediaDevices.resolutions" :key="vres.height" :value="vres.height">
          {{ vres.width }}×{{ vres.height }}
        </option>
      </select>
    </span>
  </device-settings>
</template>
