<script setup lang="ts">
import {
  IngesterErrorHandler,
  NetworkError,
  ServerRequestError,
  StreamMeta,
  VideoResolutionChangeDetector,
  WebrtcStreamingEvents,
  WhipClientEvents,
} from "@gcorevideo/rtckit";
import type {
  MediaDeviceSwitchInfo,
  MediaDeviceSwitchOffInfo,
} from "@gcorevideo/rtckit";
import { ArrowPathIcon } from "@heroicons/vue/24/outline";
import { trace } from "@gcorevideo/utils";
import mousetrap from "mousetrap";

import { getIngesterErrorReasonExplanation } from "~/utils/errors";

const DEVICE_SWITCH_NOTIFICATION_TIMEOUT = 5000;

definePageMeta({
  middleware: ["auth"],
});

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
  [Status.Initial]: "Initializing...",
  [Status.ConnectingDevices]: "Connecting devices...",
  [Status.Ready]: "Ready",
  [Status.Connecting]: "Connecting to the server",
  [Status.Streaming]: "Streaming",
  [Status.ConnectionFailed]: "Connection failed",
  [Status.Disconnected]: "Disconnected",
  [Status.Reconnecting]: "Reconnecting...",
  [Status.Ended]: "Ended",
};

enum QualityStatus {
  None = 1,
  Measuring,
  Normal,
  Degraded,
  Improved,
}

const T = "pages.host";

const micSwitched = ref<MediaDeviceSwitchInfo | null>(null);
const cameraSwitched = ref<MediaDeviceSwitchInfo | null>(null);
const micSwitchedOff = ref<MediaDeviceSwitchOffInfo | null>(null);
const cameraSwitchedOff = ref<MediaDeviceSwitchOffInfo | null>(null);

const mediaDevices = useMediaDevices();
const stream = await useStream();
const webrtcStreaming = useWebrtcStreaming();
const mediaDevicesList = useMediaDevicesList();
const air = useAir();
const userMedia = useUserMedia();

const ingesterError = ref("");
const status = ref<Status>(Status.Initial);
const videoQuality = ref(0);
const qualityStatus = ref<QualityStatus>(QualityStatus.None);
const settings = useSettingsStore();

type Callback = () => void;
const unmount = ref<Callback[]>([]);

const showPlayer = ref(useInlinePlayer());
const NewPlayer = import.meta.client
  ? defineAsyncComponent(() => import("~/components/new-stream-player.vue"))
  : null;

const hasValidMediaSources = computed(() => {
  return stream.value.sources.length > 0;
});

const statusName = computed(() => STATUS_NAMES[status.value]);
const silentAudio = computed(() => !mediaDevices.value.willUseMic);
const selectedMic = computed(
  () =>
    mediaDevices.value.micDeviceId &&
    mediaDevices.value.micDevicesList.find(
      (d) => d.deviceId === mediaDevices.value.micDeviceId
    )?.label
);

const started = computed(() => air.value.live || air.value.ended);

const canStart = computed(
  () => !!userMedia.value.videoTrack && !started.value && !air.value.starting
);

const canRestart = computed(() => air.value.ended);

const BIND_KEYS_START = "option+.";
const BIND_KEYS_LEAVE = "option+\\";
const BIND_KEYS_RESTART = "option+r";
const BIND_KEYS_TOGGLE_PLAYER = "option+p";

onMounted(() => {
  mousetrap.bind(BIND_KEYS_START, () => {
    start();
  });
  mousetrap.bind(BIND_KEYS_LEAVE, () => {
    leave();
  });
  mousetrap.bind(BIND_KEYS_RESTART, () => {
    if (canRestart.value) {
      restart();
    }
  });
  mousetrap.bind(BIND_KEYS_TOGGLE_PLAYER, () => {
    showPlayer.value = !showPlayer.value;
  });
  status.value =
    mediaDevices.value.cameraDevicesList.length ||
    mediaDevices.value.micDevicesList.length
      ? Status.Ready
      : Status.ConnectingDevices;
  startUserMedia();
});

onBeforeUnmount(() => {
  mousetrap.unbind(BIND_KEYS_START);
  mousetrap.unbind(BIND_KEYS_LEAVE);
  mousetrap.unbind(BIND_KEYS_RESTART);
  mousetrap.unbind(BIND_KEYS_TOGGLE_PLAYER);
  for (const callback of unmount.value) {
    try {
      callback();
    } catch (e) {
      reportError(e);
    }
  }
  webrtcStreaming.close();
});

watch(
  () =>
    mediaDevices.value.cameraDevicesList.map(({ deviceId }) => deviceId).join(),
  (v: string) => {
    trace("cameraDevicesList changed", {
      v,
      cameraDevicesList: mediaDevices.value.cameraDevicesList,
    });
    if (
      mediaDevices.value.cameraDevicesList.length &&
      status.value === Status.ConnectingDevices
    ) {
      status.value = Status.Ready;
    }
  }
);

function start() {
  const s = userMedia.value.stream;
  if (!s) {
    return;
  }
  air.value.starting = true;
  status.value = Status.Connecting;
  ingesterError.value = "";

  const w = webrtcStreaming.configure(stream.value.whipEndpoint, {
    canTrickleIce: settings.canTrickleIce,
    debug: true,
    icePreferTcp: settings.preferTcp,
    iceTransportPolicy: settings.iceTransportPolicy,
    mediaDevicesAutoSwitch: true,
    plugins: [
      new IngesterErrorHandler((reason) => {
        ingesterError.value = getIngesterErrorReasonExplanation(reason);
      }),
      new StreamMeta(),
      new VideoResolutionChangeDetector(({ degraded, height }) => {
        videoQuality.value = height;
        if (degraded) {
          qualityStatus.value = QualityStatus.Degraded;
        } else {
          qualityStatus.value =
            qualityStatus.value === QualityStatus.Degraded
              ? QualityStatus.Improved
              : QualityStatus.Normal;
        }
      }),
    ],
    videoCodecs: ["H264"], // TODO settings
  });
  w.on(WebrtcStreamingEvents.MediaDeviceSwitch, (e) => {
    if (e.kind === "audio") {
      micSwitched.value = e;
    } else if (e.kind === "video") {
      cameraSwitched.value = e;
    }
    setTimeout(() => {
      if (e.kind === "audio") {
        micSwitched.value = null;
      } else if (e.kind === "video") {
        cameraSwitched.value = null;
      }
    }, DEVICE_SWITCH_NOTIFICATION_TIMEOUT);
  });
  w.on(WebrtcStreamingEvents.MediaDeviceSwitchOff, (e) => {
    if (e.kind === "audio") {
      micSwitchedOff.value = e;
    } else if (e.kind === "video") {
      cameraSwitchedOff.value = e;
    }
    setTimeout(() => {
      if (e.kind === "audio") {
        micSwitchedOff.value = null;
      } else if (e.kind === "video") {
        cameraSwitchedOff.value = null;
      }
    }, DEVICE_SWITCH_NOTIFICATION_TIMEOUT);
  });
  w.run()
    .then((client) => {
      client.on(WhipClientEvents.Connected, () => {
        air.value.live = true;
        air.value.starting = false;
        status.value = Status.Streaming;
        qualityStatus.value = QualityStatus.Measuring;
      });
      client.on(WhipClientEvents.Disconnected, () => {
        air.value.live = false;
        air.value.starting = false;
        if (air.value.live && !air.value.ended) {
          status.value = Status.Reconnecting;
        } else {
          status.value = Status.Disconnected;
        }
      });
      client.on(WhipClientEvents.ConnectionFailed, () => {
        air.value.starting = false;
        air.value.live = false;
        status.value = Status.ConnectionFailed;
      });
    })
    .catch((e) => {
      reportError(e);
      if (e instanceof ServerRequestError || e instanceof NetworkError) {
        status.value = Status.ConnectionFailed;
      }
      air.value.starting = false;
    });
}

function leave() {
  air.value.live = false;
  air.value.ended = true;
  webrtcStreaming.close();
  if (userMedia.value.stream) {
    closeMediaStream(userMedia.value.stream);
    userMedia.value.stream = null;
    userMedia.value.audioTrack = null;
    userMedia.value.videoTrack = null;
  }
  status.value = Status.Ended;
}

function restart() {
  air.value.live = false;
  air.value.ended = false;
  ingesterError.value = "";
  // mediaDevices.value.micDeviceId = "";
  // mediaDevices.value.cameraDeviceId = "";
  qualityStatus.value = QualityStatus.None;
  videoQuality.value = 0;
  webrtcStreaming.close();
  status.value = Status.Initial;
  setTimeout(() => {
    status.value = Status.ConnectingDevices;
    reopenMediaStream()
      .then(() => {
        status.value = Status.Ready;
      })
      .catch((e) => reportError(e));
  }, 0);
}

function startUserMedia() {
  const w = webrtcStreaming.get();
  w.on(WebrtcStreamingEvents.MediaDeviceSwitch, onMdSwitch);
  w.on(WebrtcStreamingEvents.MediaDeviceSwitchOff, onMdSwitch);

  unmount.value.push(() => {
    w.off(WebrtcStreamingEvents.MediaDeviceSwitch, onMdSwitch);
    w.off(WebrtcStreamingEvents.MediaDeviceSwitchOff, onMdSwitch);
  });
}

function onMdSwitch() {
  trace(`${T} onMdSwitch`);
  setTimeout(() => {
    reopenMediaStream().catch((e) => reportError(e));
  }, 0);
}

function reopenMediaStream() {
  const w = webrtcStreaming.get();
  // w.mediaDevices.reset(); // TODO check, it's done by WebrtcStreaming
  updateDevicesList();
  return w.openSourceStream().then((s) => {
    trace(`${T} onMdSwitch.openSourceStream`, {
      id: s.id,
      video: s.getVideoTracks()[0]?.label,
    });
    userMedia.value.stream = s;
    s.getTracks().forEach((t) => {
      if (t.kind === "audio") {
        userMedia.value.audioTrack = t;
      } else if (t.kind === "video") {
        userMedia.value.videoTrack = t;
      }
    });
  });
}

async function updateDevicesList() {
  await mediaDevicesList.updateCameras();
  await mediaDevicesList.updateMicrophones();
}
</script>

<template>
  <div>
    <nuxt-layout>
      <template #header> You're hosting </template>
      <div class="flex gap-4 flex-col md:flex-row md:basis-full justify-center">
        <div class="block my-2">
          <div class="block my-2">
            <camera-control />
            <camera-preview
              v-if="mediaDevices.willUseCamera"
              :live="air.live"
              :ended="air.ended"
            >
              <a @click.prevent="restart" href="#" v-if="canRestart" id="reload"
                ><arrow-path-icon class="w-4 h-4" /> reload</a
              >
            </camera-preview>
            <mic-control />
          </div>
          <div class="my-2 flex gap-2 items-center">
            <button
              @click="start"
              v-if="canStart"
              class="px-4 py-1 btn"
              id="start"
            >
              Start
            </button>
            <button
              @click="leave"
              v-if="air.live"
              class="px-4 py-1 btn"
              id="leave"
            >
              Leave
            </button>
            <a
              v-if="air.live && stream.playerUrl && !showPlayer"
              :href="stream.playerUrl"
              target="_blank"
              id="player_url"
              >watch</a
            >
          </div>
        </div>
        <div
          class="my-2 justify-center flex flex-col gap-2 text-center md:basis-1/2 lg:basis-1/3"
        >
          <div class="flex items-center flex-col">
            <div class="text-slate-900" id="streaming_status">
              {{ statusName }}
            </div>
            <a
              @click.prevent="restart"
              href="#"
              v-if="canRestart"
              id="status_reload"
              class="flex items-center gap-1"
              ><arrow-path-icon class="w-4 h-4" /> reload</a
            >
          </div>
          <div class="text-slate-900">
            Quality:
            <span
              id="stream_quality"
              :class="{
                'stream-quality': true,
                degraded: qualityStatus === QualityStatus.Degraded,
                improved: qualityStatus === QualityStatus.Improved,
              }"
            >
              <template v-if="qualityStatus === QualityStatus.None">‒</template>
              <template v-else-if="qualityStatus === QualityStatus.Measuring"
                >measuring...</template
              >
              <template v-else>{{ videoQuality }}p</template>
            </span>
          </div>
          <div class="text-slate-900" id="audio_status">
            Audio:
            <span v-if="silentAudio" id="using_silent_audio">silent</span>
            <span v-else-if="selectedMic" id="using_microphone">{{
              selectedMic
            }}</span>
            <span v-else-if="!userMedia.stream" id="pending_microphone"
              >...</span
            >
            <b v-else>(!)</b>
          </div>
          <div v-if="micSwitched">
            <div class="text-slate-900" id="mic_changed">
              Microphone input has been changed from
              <b>{{ micSwitched.prev.label }}</b> to
              <b>{{ micSwitched.device.label }}</b>
            </div>
          </div>
          <div v-if="micSwitchedOff">
            <div class="text-red-900" id="mic_disconnected">
              Microphone <b>{{ micSwitchedOff.device.label }}</b>
              has been disconnected
            </div>
          </div>
          <div
            v-if="
              status === Status.Ready && !mediaDevices.micDevicesList.length
            "
          >
            <div class="text-red-900" id="mic_unavailable">
              No microphones are available
            </div>
          </div>
          <div v-if="cameraSwitched">
            <div class="text-slate-900" id="camera_changed">
              Camera input has been changed from
              <b>{{ cameraSwitched.prev.label }}</b> to
              <b>{{ cameraSwitched.device.label }}</b>
            </div>
          </div>
          <div v-if="cameraSwitchedOff">
            <div class="text-red-900" id="camera_disconnected">
              Camera <b>{{ cameraSwitchedOff.device.label }}</b>
              has been disconnected
            </div>
          </div>
          <div v-if="ingesterError">
            <div class="text-red-900" id="ingester_error">
              {{ ingesterError }}
            </div>
          </div>
          <new-player v-if="air.live && showPlayer && hasValidMediaSources" />
        </div>
      </div>
      <div
        class="my-2 flex flex-col items-start gap-1 text-sm mt-4"
        v-if="settings.godMode"
      >
        <div class="text-slate-900 font-semibold w-1">Endpoint</div>
        <code class="text-pink-800 bg-red-50 py-1 px-2 rounded-xs">{{
          stream.whipEndpoint
        }}</code>
        <div class="text-slate-900 font-semibold">Stream URL</div>
        <code
          v-for="s of stream.sources"
          :key="s"
          class="text-pink-800 bg-red-50 py-1 px-2 rounded-xs"
          >{{ s }}</code
        >
      </div>
    </nuxt-layout>
  </div>
</template>

<style scoped>
@reference "~/assets/css/main.css";

.btn {
  @apply bg-black rounded rounded-xs text-white uppercase font-bold;
  background-image: url("/img/slick-bg.svg");
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
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
