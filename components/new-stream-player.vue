<script setup lang="ts">
import { TvIcon, SignalIcon, SignalSlashIcon } from '@heroicons/vue/24/outline';
import { Player, PlayerEvent } from '@gcorevideo/player'
import useStream from "~/composables/use-stream";

const container = ref<HTMLDivElement>()
const playing = ref(false)

onMounted(async () => {
  const stream = await useStream();
  setTimeout(() => {
    const player = new Player({
      autoPlay: true,
      dash: {
        streaming: {
          retryAttemptes: {
            MPD: 100,
          },
          retryIntervals: {
            MPD: 1000,
          },
        }
      },
      debug: true,
      mute: true,
      strings: {},
      sources: stream.value.sources,
    })
    player.on(PlayerEvent.Play, () => {
      playing.value = true
    })
    setTimeout(() => {
      player.init(container.value!)
      playing.value = true
    }, 0)
  }, 3000)
})
</script>

<template>
  <div class="w-full max-w-screen-md h-full md:h-auto md:aspect-video relative bg-black" ref="container">
    <tv-icon class="absolute bottom-2 left-2 w-4 h-4 z-10 stroke-white"/>
    <signal-slash-icon class="absolute bottom-2 left-8 w-4 h-4 z-10 stroke-white animate-pulse" v-if="!playing" />
    <signal-icon class="absolute bottom-2 left-8 w-4 h-4 z-10 stroke-white" v-else />
  </div>
</template>