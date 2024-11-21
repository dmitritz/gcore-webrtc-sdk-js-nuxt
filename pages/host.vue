<script setup lang="ts">
import { WebrtcStreamingEvents, } from '@gcorevideo/rtckit';
import type { MediaDeviceSwitchInfo, MediaDeviceSwitchOffInfo } from '@gcorevideo/rtckit';

const DEVICE_SWITCH_NOTIFICATION_TIMEOUT = 5000

definePageMeta({
  middleware: 'auth',
})

const micSwitched = ref<MediaDeviceSwitchInfo | null>(null)
const cameraSwitched = ref<MediaDeviceSwitchInfo | null>(null)
const micSwitchedOff = ref<MediaDeviceSwitchOffInfo | null>(null)
const cameraSwitchedOff = ref<MediaDeviceSwitchOffInfo | null>(null)

const mediaDevices = useMediaDevices()
const stream = await useStream()
const webrtcStreaming = useWebrtcStreaming()

const air = useAir()

let startUserMedia: () => void

const userMedia = useUserMedia((sum: () => void) => {
  startUserMedia = sum // TODO call startUserMedia
})
const canStart = computed(
  () =>
    userMedia.value.videoTrack &&
    // userMedia.value.audioTrack &&
    !started.value,
)
const started = computed(() => air.value.live || air.value.ended)

onMounted(() => startUserMedia())

function start() {
  const s = userMedia.value.stream
  if (!s) {
    return
  }
  air.value.live = true

  const w = webrtcStreaming.configure(stream.whipEndpoint,
  {
    hotReplace: true,
    icePreferTcp: true,
    iceTransportPolicy: 'relay',
    mediaDevicesAutoSwitch: true,
    videoCodecs: ['H264'],
  })
  w.on(WebrtcStreamingEvents.MediaDeviceSwitch, (e) => {
    if (e.kind === "audio") {
      micSwitched.value = e
    } else if (e.kind === "video") {
      cameraSwitched.value = e
    }
    setTimeout(() => {
      if (e.kind === "audio") {
        micSwitched.value = null
      } else if (e.kind === "video") {
        cameraSwitched.value = null
      }
    }, DEVICE_SWITCH_NOTIFICATION_TIMEOUT)
  })
  w.on(WebrtcStreamingEvents.MediaDeviceSwitchOff, (e) => {
    if (e.kind === "audio") {
      micSwitchedOff.value = e
    } else if (e.kind === "video") {
      cameraSwitchedOff.value = e
    }
    setTimeout(() => {
      if (e.kind === "audio") {
        micSwitchedOff.value = null
      } else if (e.kind === "video") {
        cameraSwitchedOff.value = null
      }
    }, DEVICE_SWITCH_NOTIFICATION_TIMEOUT)
  })
  w.run()
}

function leave() {
  air.value.live = false
  air.value.ended = true
  webrtcStreaming.close()
  if (userMedia.value.stream) {
    closeMediaStream(
      userMedia.value.stream,
    )
    userMedia.value.stream = null
  }
}

function restart() {
  window.location.reload()
}
</script>

<template>
  <div>
    <nuxt-layout>
      <template #header>
        Cool, you're hosting
      </template>
      <div class="flex gap-4 flex-col md:flex-row md:basis-full justify-center">
        <div class="block my-2">
          <div class="block my-2">
            <camera-control />
            <camera-preview
              v-if="
                mediaDevices.willUseCamera
              "
              :live="air.live"
              :ended="air.ended"
            >
              <a @click.prevent="restart" href="#" v-if="air.ended">reload</a>
            </camera-preview>
            <mic-control />
          </div>
          <div class="block my-2 flex gap-2 items-center">
            <button
              @click="start"
              v-if="canStart"
              class="px-4 py-1 btn"
            >
              Start
            </button>
            <div class="py-2 text-slate-600 text-center md:text-left" v-if="!started && !canStart">
              Turn on your camera <b>and</b> microphone before you start streaming
            </div>
            <button
              @click="leave"
              v-if="air.live"
              class="px-4 py-1 btn"
            >
              Leave
            </button>
            <a v-if="air.live" :href="stream.playerUrl" target="_blank">watch</a>
          </div>
        </div>
        <div class="block my-2 justify-center flex flex-col gap-2 text-center md:basis-1/2 lg:basis-1/3">
          <div v-if="micSwitched">
            <div class="text-slate-900">Microphone input has been changed from <b>{{micSwitched.prev.label}}</b> to <b>{{micSwitched.device.label}}</b></div>
          </div>
          <div v-if="micSwitchedOff">
            <div class="text-red-900">Microphone <b>{{micSwitchedOff.device.label}}</b> has been disconnected</div>
          </div>
          <div v-if="cameraSwitched">
            <div class="text-slate-900">Camera input has been changed from <b>{{cameraSwitched.prev.label}}</b> to <b>{{cameraSwitched.device.label}}</b></div>
          </div>
          <div v-if="cameraSwitchedOff">
            <div class="text-red-900">Camera <b>{{cameraSwitchedOff.device.label}}</b> has been disconnected</div>
          </div>
        </div>
      </div>
    </nuxt-layout>
  </div>
</template>

<style scoped>
@tailwind components;

@layer components {
  .statusRunning {
    @apply text-red-900;
  }
}

.btn {
  background-color: #000;
  border-radius: 3px;
  background-image: url('/img/slick-bg.svg');
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
  color: #fff;
  text-transform: uppercase;
  font-weight: bold;
}
</style>
