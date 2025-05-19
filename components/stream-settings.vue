<script setup lang="ts">
import mousetrap from "mousetrap";

import { useSettingsStore } from "~/stores/settings";

const BIND_KEYS_WHIP_ENDPOINT_FOCUS = "option+.";
const BIND_KEYS_WHIP_ENDPOINT_RESET = "option+z";

const LS_KEY_WHIP_ENDPOINT_STACK = "webrtc.settings.whipEndpointStack";

const stream = useStream();
const rawSources = ref(stream.value.sources.join("\n"));
const inlinePlayer = useInlinePlayer();
const tuneHls = useTuneHls();
const { sourcesNotPersistent } = useSettingsWarning();
const whipEndpointInput = useTemplateRef<HTMLInputElement>("whipEndpointInput");
const settings = useSettingsStore();
const endpoints = ref<string[]>([]);

const storedEndpoint = computed(() =>
  endpoints.value.length ? endpoints.value[endpoints.value.length - 1] : ""
);
const currentEndpoint = computed(() => {
  return stream.value.whipEndpoint.trim();
});
const canRestoreWhipEndpoint = computed(() => {
  const v = currentEndpoint.value;
  return storedEndpoint.value.length > 0 && v !== storedEndpoint.value;
});
const canResetWhipEndpoint = computed(() => {
  return currentEndpoint.value !== stream.value.initialWhipEndpoint;
});
const canPushWhipEndpoint = computed(() => {
  return (
    currentEndpoint.value.length > 0 &&
    currentEndpoint.value !== endpoints.value[endpoints.value.length - 1]
  );
});
const canPopWhipEndpoint = computed(() => {
  return endpoints.value.length > 0;
});

const canStore = computed(() => {
  const v = stream.value.whipEndpoint.trim();
  const s = storedEndpoint.value.trim();
  return v.length > 0 && v !== s;
});

const isStored = computed(() => {
  const v = stream.value.whipEndpoint.trim();
  const s = storedEndpoint.value.trim();
  return s.length > 0 && v === s;
});

const canSwapWhipEndpoint = computed(() => {
  return (
    endpoints.value.length > 0 &&
    currentEndpoint.value &&
    currentEndpoint.value !== endpoints.value[endpoints.value.length - 1]
  );
});

onMounted(() => {
  mousetrap.bind(BIND_KEYS_WHIP_ENDPOINT_FOCUS, () => {
    if (whipEndpointInput.value) {
      whipEndpointInput.value.focus();
    }
  });
  mousetrap.bind(BIND_KEYS_WHIP_ENDPOINT_RESET, () => {
    if (canResetWhipEndpoint.value) {
      resetWhipEndpoint();
    }
  });
  if (!stream.value.whipEndpoint && canRestoreWhipEndpoint.value) {
    setTimeout(() => {
      restoreWhipEndpoint();
    }, 0);
  }
  const es = localStorage.getItem(LS_KEY_WHIP_ENDPOINT_STACK);
  if (es !== null) {
    endpoints.value =
      es
        .split("\n")
        .map((e) => e.trim())
        .filter((s) => s.length > 0) ?? [];
  }
});

onBeforeUnmount(() => {
  mousetrap.unbind(BIND_KEYS_WHIP_ENDPOINT_FOCUS);
  mousetrap.unbind(BIND_KEYS_WHIP_ENDPOINT_RESET);
});

watch(
  () => stream.value.sources,
  (newSources) => {
    if (newSources.length > 0) {
      rawSources.value = newSources.join("\n");
    }
  },
  {
    once: true,
  }
);

function setSources(value: string) {
  rawSources.value = value;
  stream.value.sources = value.split("\n").filter((s) => s.trim().length > 0);
}

function resetWhipEndpoint() {
  stream.value.whipEndpoint = stream.value.initialWhipEndpoint;
}

function resetSources() {
  stream.value.sources = stream.value.initialSources;
  rawSources.value = stream.value.sources.join("\n");
}

function restoreWhipEndpoint() {
  stream.value.whipEndpoint = storedEndpoint.value;
}

function pushWhipEndpoint() {
  endpoints.value.push(currentEndpoint.value);
  localStorage.setItem(LS_KEY_WHIP_ENDPOINT_STACK, endpoints.value.join("\n"));
}

function popWhipEndpoint() {
  const next = endpoints.value.pop();
  if (next) {
    stream.value.whipEndpoint = next;
    localStorage.setItem(
      LS_KEY_WHIP_ENDPOINT_STACK,
      endpoints.value.join("\n")
    );
  }
}

function swapWhipEndpoint() {
  const top = endpoints.value.pop();
  if (top) {
    endpoints.value.push(currentEndpoint.value);
    stream.value.whipEndpoint = top;
  }
}
</script>
<template>
  <div class="grid grid-cols-4 grid-gap-4 auto-rows-auto gap-y-2">
    <div class="col-span-1">
      <label for="whip_endpoint">WHIP endpoint</label>
    </div>
    <div class="col-span-3 flex flex-col gap-1">
      <input
        type="text"
        v-model="stream.whipEndpoint"
        class="border border-current px-1 py-0.5 w-full"
        id="whip_endpoint"
        ref="whipEndpointInput"
      />
      <div class="flex gap-1 items-center">
        <button
          @click="resetWhipEndpoint"
          class="text-slate-600 border rounded px-1 text-sm cursor-pointer"
          v-if="canResetWhipEndpoint"
        >
          Reset
        </button>
        <button
          @click="pushWhipEndpoint"
          class="text-slate-600 border rounded px-1 text-sm"
          :class="{
            'bg-slate-100': !canPushWhipEndpoint,
            'border-slate-400': !canPushWhipEndpoint,
          }"
          v-if="settings.godMode"
          :disabled="!canPushWhipEndpoint"
        >
          Push
        </button>
        <button
          @click="popWhipEndpoint"
          class="text-slate-600 border rounded px-1 text-sm"
          :class="{
            'bg-slate-100': !canPopWhipEndpoint,
            'border-slate-400': !canPopWhipEndpoint,
          }"
          v-if="settings.godMode"
          :disabled="!canPopWhipEndpoint"
        >
          Pop [{{ endpoints.length }}]
        </button>
        <button
          @click="swapWhipEndpoint"
          class="text-slate-600 border rounded px-1 text-sm"
          :class="{
            'bg-slate-100': !canSwapWhipEndpoint,
            'border-slate-400': !canSwapWhipEndpoint,
          }"
          v-if="settings.godMode"
          :disabled="!canSwapWhipEndpoint"
        >
          Swap
        </button>
      </div>
    </div>
    <div class="col-span-1"><label for="player_url">Player URL</label></div>
    <div class="col-span-3 text-sm">
      <input
        type="text"
        v-model="stream.playerUrl"
        class="border border-current px-1 py-0.5 w-full"
        id="player_url"
      />
    </div>
    <div class="col-span-1">
      <label for="player_sources">Media sources</label>
    </div>
    <div class="col-span-3 text-sm">
      <textarea
        type="text"
        :value="rawSources"
        @input="setSources(($event.target as HTMLInputElement).value)"
        class="border border-current px-1 py-0.5 w-full"
        id="player_sources"
      ></textarea>
      <div class="text-sm text-red-500" v-show="sourcesNotPersistent">
        The value you set is not persistent. After a page reload, it will be
        reset to the value provided by the server or overriden via the URL query
        parameters
        <button
          @click="resetSources"
          class="text-slate-600 border rounded px-1 mx-2"
        >
          Reset
        </button>
      </div>
      <div v-if="inlinePlayer"></div>
    </div>
    <template v-if="inlinePlayer">
      <div class="col-span-1">
        <label for="inline_player"> Tune HLS.js </label>
      </div>
      <div class="col-span-3">
        <input type="checkbox" id="inline_player" v-model="tuneHls" />
        <div class="text-sm text-slate-600">
          These experimental low latency settings can cause negative UX like
          playback stalls and stuttering.
        </div>
      </div>
    </template>
  </div>
</template>
