<script setup lang="ts">
  import useStream from '~/composables/use-stream'
  const stream = await useStream()
</script>
<template>
  <div class="grid grid-cols-4 grid-gap-4 auto-rows-auto gap-y-2">
    <div class="col-span-1">
      WHIP endpoint
    </div>
    <div class="col-span-3">
      <input type="text" v-model="stream.whipEndpoint" class="border border-current px-1 py-0.5 w-full" id="whip_endpoint"/>
    </div>
    <div class="col-span-1">
      WHEP endpoint
    </div>
    <div class="col-span-3">
      <code class="text-sm bg-slate-100">{{ stream.whepEndpoint }}</code>
    </div>
    <div class="col-span-1">
      Player URL
    </div>
    <div class="col-span-3 text-sm">
      <a :href="stream.playerUrl">{{ stream.playerUrl }}</a>
    </div>
  </div>
</template>
