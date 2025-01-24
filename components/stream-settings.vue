<script setup lang="ts">
import useStream from "~/composables/use-stream";
const stream = await useStream();
const rawSources = ref(stream.value.sources.join("\n"));

function setSources(value: string) {
  rawSources.value = value
  stream.value.sources = value.split("\n").filter(s => s.trim().length > 0);
}
</script>
<template>
  <div class="grid grid-cols-4 grid-gap-4 auto-rows-auto gap-y-2">
    <div class="col-span-1"><label for="whip_endpoint">WHIP endpoint</label></div>
    <div class="col-span-3">
      <input
        type="text"
        v-model="stream.whipEndpoint"
        class="border border-current px-1 py-0.5 w-full"
        id="whip_endpoint"
      />
    </div>
    <div class="col-span-1">WHEP endpoint</div>
    <div class="col-span-3">
      <code class="text-sm bg-slate-100">{{ stream.whepEndpoint }}</code>
    </div>
    <!-- TODO drop -->
    <div class="col-span-1"><label for="player_url">Player URL</label></div>
    <div class="col-span-3 text-sm">
      <input
        type="text"
        v-model="stream.playerUrl"
        class="border border-current px-1 py-0.5 w-full"
        id="player_url"
      />
    </div>
    <div class="col-span-1"><label for="sources">Media sources</label></div>
    <div class="col-span-3 text-sm">
      <textarea
        type="text"
        :value="rawSources"
        @input="setSources(($event.target as HTMLInputElement).value)"
        class="border border-current px-1 py-0.5 w-full"
        id="player_sources"
      ></textarea>
    </div>
  </div>
</template>
