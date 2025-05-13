<template>
  <div>
    <nuxt-layout>
      <h2 class="text-xl font-semibold mb-4">Extra</h2>
      <div class="grid grid-cols-3 gap-4 mb-4">
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
            @change="
              settings.setIceHostCandidates(
                !!($event.target as HTMLInputElement)?.checked
              )
            "
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
      <div class="grid zgrid gap-4">
        <label class="grow-0 shrink" for="replication">Replication</label>
        <div class="flex items-center gap-2 justify-start basis-full shrink-0 grow">
          <input
            id="replication"
            type="number"
            class="border border-gray-300 rounded-md p-2"
            :value="settings.replication"
            @change="
              settings.setReplication(
                Number(($event.target as HTMLInputElement).value)
              )
            "
          />
          <span>times</span>
        </div>
      </div>
    </nuxt-layout>
  </div>
</template>

<script setup lang="ts">
import { useSettingsStore } from "~/stores/settings";
import type { IceTransportPolicy } from "~/types";
const settings = useSettingsStore();
// TODO lock when a session is active

onMounted(() => {
  settings.setCanTrickleIce(
    Number(localStorage.getItem("webrtc.settings.canTrickleIce")) === 1
  );
  const iceTransportPolicy =
    localStorage.getItem("webrtc.settings.iceTransportPolicy") || "all";
  if (isIceTransportPolicy(iceTransportPolicy)) {
    settings.setIceTransportPolicy(iceTransportPolicy);
  }
  settings.setIceHostCandidates(
    Number(localStorage.getItem("webrtc.settings.iceHostCandidates")) === 1
  );
  settings.preferTcp =
    Number(localStorage.getItem("webrtc.settings.preferTcp")) === 1;
});

watch(
  () =>
    [
      settings.canTrickleIce,
      settings.iceTransportPolicy,
      settings.iceHostCandidates,
      settings.preferTcp,
    ].join(","),
  () => {
    console.log("changed");
    localStorage.setItem(
      "webrtc.settings.canTrickleIce",
      Number(settings.canTrickleIce).toString()
    );
    localStorage.setItem(
      "webrtc.settings.iceTransportPolicy",
      settings.iceTransportPolicy
    );
    localStorage.setItem(
      "webrtc.settings.iceHostCandidates",
      Number(settings.iceHostCandidates).toString()
    );
    localStorage.setItem(
      "webrtc.settings.preferTcp",
      Number(settings.preferTcp).toString()
    );
  }
);

function isIceTransportPolicy(value: string): value is IceTransportPolicy {
  return value === "relay" || value === "all";
}
</script>

<style>
.zgrid {
  align-items: center;
  align-content: center;
  grid-template-columns: 1fr 3fr;
}
@media (min-width: 768px) {
  .zgrid {
    grid-template-columns: 1fr 7fr;
  }
}
</style>
