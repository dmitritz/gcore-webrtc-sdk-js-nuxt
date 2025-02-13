<script setup lang="ts">
const stream = useStream();
const rawSources = ref(stream.value.sources.join("\n"));

const { whipEndpointNotPersistent, sourcesNotPersistent } =
  useSettingsWarning();

watch(() => stream.value.sources, (newSources) => {
  console.log("stream-settings newSources", newSources);
  if (newSources.length > 0) {
    rawSources.value = newSources.join("\n");
  }
}, {
  once: true,
});

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
</script>
<template>
  <div class="grid grid-cols-4 grid-gap-4 auto-rows-auto gap-y-2">
    <div class="col-span-1">
      <label for="whip_endpoint">WHIP endpoint</label>
    </div>
    <div class="col-span-3">
      <input
        type="text"
        v-model="stream.whipEndpoint"
        class="border border-current px-1 py-0.5 w-full"
        id="whip_endpoint"
      />
      <div class="text-sm text-red-500" v-show="whipEndpointNotPersistent">
        The value you set is not persistent. After a page reload, it will be
        reset to the value provided by the server or overriden via the URL query
        parameters
        <button
          @click="resetWhipEndpoint"
          class="text-slate-600 border rounded px-1 mx-2"
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
    <div class="col-span-1"><label for="player_sources">Media sources</label></div>
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
    </div>
  </div>
</template>
