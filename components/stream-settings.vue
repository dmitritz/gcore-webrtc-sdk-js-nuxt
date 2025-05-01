<script setup lang="ts">
import mousetrap from "mousetrap";
import { ServerIcon } from "@heroicons/vue/24/outline";

const stream = useStream();
const rawSources = ref(stream.value.sources.join("\n"));
const inlinePlayer = useInlinePlayer();
const tuneHls = useTuneHls();
const { whipEndpointNotPersistent, sourcesNotPersistent } =
  useSettingsWarning();
const whipEndpointInput = useTemplateRef<HTMLInputElement>("whipEndpointInput");

const BIND_KEYS_FOCUS_WHIP_ENDPOINT = "option+."

const LS_KEY_WHIP_ENDPOINT = "webrtc.settings.whipEndpoint";

const storedEndpoint = ref(
  localStorage.getItem(LS_KEY_WHIP_ENDPOINT) ?? ""
);
const canRestoreWhipEndpoint = computed(() => {
  const v = stream.value.whipEndpoint.trim();
  return storedEndpoint.value.length > 0 && v !== storedEndpoint.value;
});
const canResetWhipEndpoint = computed(() => {
  return stream.value.whipEndpoint !== stream.value.initialWhipEndpoint;
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

onMounted(() => {
  mousetrap.bind(BIND_KEYS_FOCUS_WHIP_ENDPOINT, () => {
    if (whipEndpointInput.value) {
      whipEndpointInput.value.focus();
    }
  });
  if (!stream.value.whipEndpoint && canRestoreWhipEndpoint.value) {
    setTimeout(() => {
      restoreWhipEndpoint();
    }, 0);
  }
});

onBeforeUnmount(() => {
  mousetrap.unbind(BIND_KEYS_FOCUS_WHIP_ENDPOINT);
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

function storeWhipEndpoint() {
  const v = stream.value.whipEndpoint.trim();
  localStorage.setItem(LS_KEY_WHIP_ENDPOINT, v);
  storedEndpoint.value = v;
}

function restoreWhipEndpoint() {
  stream.value.whipEndpoint = storedEndpoint.value;
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
          v-if="canStore"
          @click="storeWhipEndpoint"
          class="text-slate-600 border rounded px-1 text-sm cursor-pointer"
        >
          Store
        </button>
        <span
          class="text-slate-600 border border-transparent px-1 text-sm"
          v-if="isStored"
        >
          Stored
        </span>
        <button
          @click="restoreWhipEndpoint"
          class="text-slate-600 border rounded px-1 text-sm cursor-pointer"
          v-if="canRestoreWhipEndpoint"
        >
          Restore
        </button>
        <button
          @click="resetWhipEndpoint"
          class="text-slate-600 border rounded px-1 text-sm cursor-pointer"
          v-if="canResetWhipEndpoint"
        >
          Reset
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
