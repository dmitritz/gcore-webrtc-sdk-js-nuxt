<script setup lang="ts">
import {
  ErrorScreen,
  Player, PlayerEvent,
  SourceController,
  SpinnerThreeBounce,
} from "@gcorevideo/player";

import { TvIcon, SignalIcon, SignalSlashIcon } from "@heroicons/vue/24/outline";

Player.registerPlugin(ErrorScreen);
Player.registerPlugin(SourceController);
Player.registerPlugin(SpinnerThreeBounce);

const container = ref<HTMLDivElement>();
const playing = ref(false);
const tuneHls = useTuneHls();

onMounted(() => {
  const stream = useStream();
  setTimeout(() => {
    const player = new Player({
      autoPlay: true,
      dash: {
        streaming: {
          retryAttempts: {
            MPD: 100,
          },
          retryIntervals: {
            MPD: 1000,
          },
        },
      },
      playback: {
        hlsjsConfig: tuneHls.value ? {
          liveSyncDurationCount: 0,
          liveMaxLatencyDurationCount: 1,
        } : {}
      },
      debug: true,
      mute: true,
      spinner: {
        showOnError: true,
        showOnStart: true,
      },
      strings: {},
      sources: stream.value.sources,
    });
    player.on(PlayerEvent.Play, () => {
      playing.value = true;
    });
    setTimeout(() => {
      player.attachTo(container.value!);
      playing.value = true;
    }, 0);
  }, 3000);
});
</script>

<template>
  <div
    class="w-full max-w-screen-md aspect-video relative bg-black"
    ref="container"
    id="player-container"
  >
    <tv-icon class="absolute bottom-2 left-2 w-4 h-4 z-10 stroke-white" />
    <signal-slash-icon
      class="absolute bottom-2 left-8 w-4 h-4 z-10 stroke-white animate-pulse"
      v-if="!playing"
    />
    <signal-icon
      class="absolute bottom-2 left-8 w-4 h-4 z-10 stroke-white"
      v-else
    />
  </div>
</template>
