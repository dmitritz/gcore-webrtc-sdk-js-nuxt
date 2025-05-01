<template>
  <div>
    <nuxt-layout>
      <h2 class="text-xl font-semibold mb-4">Extra</h2>
      <div class="grid grid-cols-3 gap-4">
        <label class="flex items-center gap-2">
          <input
            type="checkbox"
            :checked="settings.canTrickleIce"
            @change="
              settings.setCanTrickleIce(
                !!($event.target as HTMLInputElement)?.checked
              )
            "
          />
          Can trickle ICE
        </label>
        <label class="flex items-center gap-2">
          <input
            type="checkbox"
            :checked="settings.iceTransportPolicy === 'relay'"
            @change="
              settings.setIceTransportPolicy(
                !!($event.target as HTMLInputElement)?.checked ? 'relay' : 'all'
              )
            "
          />
          ICE relay only
        </label>
        <label class="flex items-center gap-2">
          <input
            type="checkbox"
            :checked="settings.iceHostCandidates"
            @change="settings.setIceHostCandidates(!!($event.target as HTMLInputElement)?.checked)"
          />
          ICE host candidates
        </label>
        <label class="flex items-center gap-2">
          <input
            type="checkbox"
            :checked="settings.preferTcp"
            @change="
              settings.setPreferTcp(
                !!($event.target as HTMLInputElement)?.checked
              )
            "
          />
          Prefer TCP
        </label>
      </div>
    </nuxt-layout>
  </div>
</template>

<script setup lang="ts">
import { useSettingsStore } from "~/stores/settings";
const settings = useSettingsStore();
// TODO lock when a session is active
</script>
