<script setup lang="ts">
import useMediaDevices, {VIDEORES, VIDEORES_DEFAULT} from '~/composables/use-media-devices'
import useUserMedia from '~/composables/use-user-media'

const VIDEORES_LABELS = Object.fromEntries(
  Object.entries(VIDEORES).map(([k, { width, height}]) => [k, `${width}x${height}`])
)
const VIDEORES_ITEMS = Object.keys(VIDEORES)

const air = useAir()

const mediaDevices = useMediaDevices()
const userMedia = useUserMedia()
const videores = ref(VIDEORES_DEFAULT)
const deviceId = ref('')

watch([deviceId, videores], updateMediaDevices)

function updateMediaDevices() {
  mediaDevices.value.cameraDeviceId = deviceId.value
  mediaDevices.value.willUseCamera =
    true
  mediaDevices.value.videoConstraints = {
    width: VIDEORES[videores.value].width,
    height: VIDEORES[videores.value].height,
  }
}

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
    :readonly="air.live"
    label="Camera"
    @change="devId => deviceId = devId"
    @toggle="onToggle"
  >
    <span>
      <label for="videores">resolution</label>
      <select
        v-model="videores"
        :disabled="air.ended || !mediaDevices.willUseCamera || air.live"
        id="videores"
      >
        <option
          v-for="vres of VIDEORES_ITEMS"
          :key="vres"
          :value="vres"
          :selected="
            videores === vres
          "
        >
          {{ VIDEORES_LABELS[vres] }}
        </option>
      </select>
    </span>
  </device-settings>
</template>
