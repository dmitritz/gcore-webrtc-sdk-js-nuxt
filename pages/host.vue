<script setup lang="ts">
import {
  IngesterErrorHandler,
  StreamMeta,
  VideoResolutionChangeDetector,
  WebrtcStreamingEvents,
  WhipClientEvents
} from '@gcorevideo/rtckit';
import type { MediaDeviceSwitchInfo, MediaDeviceSwitchOffInfo } from '@gcorevideo/rtckit';

import { getIngesterErrorReasonExplanation } from '~/utils/errors';

const DEVICE_SWITCH_NOTIFICATION_TIMEOUT = 5000

definePageMeta({
  middleware: 'auth',
})

enum Status {
  Initial = 1,
  Ready,
  ConnectionFailed,
  ConnectingDevices,
  Disconnected,
  Reconnecting,
  Connecting,
  Streaming,
  Ended,
}

const STATUS_NAMES: Record<Status, string> = {
  [Status.Initial]: 'Initializing...',
  [Status.ConnectingDevices]: 'Connecting devices...',
  [Status.Ready]: 'Ready',
  [Status.Connecting]: 'Connecting to the server',
  [Status.Streaming]: 'Streaming',
  [Status.ConnectionFailed]: 'Connection failed',
  [Status.Disconnected]: 'Disconnected',
  [Status.Reconnecting]: 'Reconnecting...',
  [Status.Ended]: 'Ended',
};

enum QualityStatus {
  None = 1,
  Measuring,
  Normal,
  Degraded,
  Improved,
}

const micSwitched = ref<MediaDeviceSwitchInfo | null>(null)
const cameraSwitched = ref<MediaDeviceSwitchInfo | null>(null)
const micSwitchedOff = ref<MediaDeviceSwitchOffInfo | null>(null)
const cameraSwitchedOff = ref<MediaDeviceSwitchOffInfo | null>(null)

const mediaDevices = useMediaDevices()
const stream = await useStream()
const webrtcStreaming = useWebrtcStreaming()
const ingesterError = ref("")
const status = ref<Status>(Status.Initial)
const statusName = computed(() => STATUS_NAMES[status.value]);
const videoQuality = ref(0)
const qualityStatus = ref<QualityStatus>(QualityStatus.None)

const air = useAir()
const started = computed(() => air.value.live || air.value.ended)

let startUserMedia: () => void

const userMedia = useUserMedia((cb: () => void) => {
  startUserMedia = cb
})
const canStart = computed(
  () =>
    !!userMedia.value.videoTrack &&
    !started.value &&
    !air.value.starting,
)

onMounted(() => {
  status.value = Status.ConnectingDevices;
  startUserMedia()
})

watch(
  () => mediaDevices.value.cameraDevicesList,
  (val) => {
    if (val.length && status.value === Status.ConnectingDevices) {
      status.value = Status.Ready;
    }
  }
)

function start() {
  const s = userMedia.value.stream
  if (!s) {
    return
  }
  air.value.starting = true
  status.value = Status.Connecting

  const w = webrtcStreaming.configure(stream.value.whipEndpoint,
    {
      canTrickleIce: true,
      debug: true,
      icePreferTcp: true,
      iceTransportPolicy: 'relay',
      mediaDevicesAutoSwitch: true,
      mediaDevicesAutoSwitchRefresh: true,
      mediaDevicesMultiOpen: false,
      plugins: [
        new IngesterErrorHandler((reason) => {
          ingesterError.value = getIngesterErrorReasonExplanation(reason)
        }),
        new StreamMeta(),
        new VideoResolutionChangeDetector(({ degraded, height, srcHeight }) => {
          videoQuality.value = height
          if (degraded) {
            qualityStatus.value = QualityStatus.Degraded;
          } else {
            qualityStatus.value = qualityStatus.value === QualityStatus.Degraded ? QualityStatus.Improved : QualityStatus.Normal;
          }
        }),
      ],
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
  w.run().then(client => {
    client.on(WhipClientEvents.Connected, () => {
      air.value.live = true
      air.value.starting = false
      status.value = Status.Streaming
      qualityStatus.value = QualityStatus.Measuring
    })
    client.on(WhipClientEvents.Disconnected, () => {
      air.value.live = false
      air.value.starting = false
      if (air.value.live && !air.value.ended) {
        status.value = Status.Reconnecting
      } else {
        status.value = Status.Disconnected;
      }
    })
    client.on(WhipClientEvents.ConnectionFailed, () => {
      air.value.starting = false
      air.value.live = false
      status.value = Status.ConnectionFailed
    })
  }).catch(e => {
    console.error('WebrtcStreaming run', e)
    air.value.starting = false
  })
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
  status.value = Status.Ended
}

function restart() {
  window.location.reload()
}
</script>

<template>
  <div>
    <nuxt-layout>
      <template #header>
        You're hosting
      </template>
      <div class="flex gap-4 flex-col md:flex-row md:basis-full justify-center">
        <div class="block my-2">
          <div class="block my-2">
            <camera-control />
            <camera-preview v-if="
              mediaDevices.willUseCamera
            " :live="air.live" :ended="air.ended">
              <a @click.prevent="restart" href="#" v-if="air.ended" id="reload">reload</a>
            </camera-preview>
            <mic-control />
          </div>
          <div class="block my-2 flex gap-2 items-center">
            <button @click="start" v-if="canStart" class="px-4 py-1 btn" id="start">
              Start
            </button>
            <button @click="leave" v-if="air.live" class="px-4 py-1 btn" id="leave">
              Leave
            </button>
            <a v-if="air.live && stream.playerUrl" :href="stream.playerUrl" target="_blank" id="player_url">watch</a>
          </div>
        </div>
        <div class="block my-2 justify-center flex flex-col gap-2 text-center md:basis-1/2 lg:basis-1/3">
          <div>
            <div class="text-slate-900" id="streaming_status">{{ statusName }}</div>
          </div>
          <div class="text-slate-900">
            Quality:
            <span id="stream_quality" :class="{
              'stream-quality': true,
              'degraded': qualityStatus === QualityStatus.Degraded,
              'improved': qualityStatus === QualityStatus.Improved,
            }">
              <template v-if="qualityStatus === QualityStatus.None">‒</template>
              <template v-else-if="qualityStatus === QualityStatus.Measuring">measuring...</template>
              <template v-else>{{ videoQuality }}p</template>
            </span>
          </div>
          <div v-if="micSwitched">
            <div class="text-slate-900" id="mic_changed">Microphone input has been changed from <b>{{ micSwitched.prev.label }}</b> to
              <b>{{ micSwitched.device.label }}</b>
            </div>
          </div>
          <div v-if="micSwitchedOff">
            <div class="text-red-900" id="mic_disconnected">Microphone <b>{{ micSwitchedOff.device.label }}</b> has been disconnected</div>
          </div>
          <div v-if="status === Status.Ready && !mediaDevices.micDevicesList.length">
            <div class="text-red-900" id="mic_unavailable">No microphones are available</div>
          </div>
          <div v-if="cameraSwitched">
            <div class="text-slate-900" id="camera_changed">Camera input has been changed from <b>{{ cameraSwitched.prev.label }}</b> to
              <b>{{ cameraSwitched.device.label }}</b>
            </div>
          </div>
          <div v-if="cameraSwitchedOff">
            <div class="text-red-900" id="camera_disconnected">Camera <b>{{ cameraSwitchedOff.device.label }}</b> has been disconnected</div>
          </div>
          <div v-if="ingesterError">
            <div class="text-red-900" id="ingester_error">{{ ingesterError }}</div>
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

.stream-quality.degraded {
  @apply text-red-600;
}

.stream-quality.degraded::before {
  content: "↓";
}

.stream-quality.improved {
  @apply text-green-600;
}

.stream-quality.improved::before {
  content: "↑";
}
</style>
