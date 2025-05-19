<template>
  <div>
    <nuxt-layout>
      <h2 class="text-xl font-semibold mb-4">Extra</h2>
      <div class="grid grid-cols-3 gap-4 mb-4">
        <label class="flex items-center gap-2" for="can_trickle_ice">
          <input
            type="checkbox"
            :checked="settings.canTrickleIce"
            id="can_trickle_ice"
            @change="
              settings.setCanTrickleIce(
                !!($event.target as HTMLInputElement)?.checked
              )
            "
          />
          Can trickle ICE
        </label>
        <label class="flex items-center gap-2" for="ice_relay_only">
          <input
            type="checkbox"
            :checked="settings.iceTransportPolicy === 'relay'"
            id="ice_relay_only"
            @change="
              settings.setIceTransportPolicy(
                !!($event.target as HTMLInputElement)?.checked ? 'relay' : 'all'
              )
            "
          />
          ICE relay only
        </label>
        <label class="flex items-center gap-2" for="ice_host_candidates">
          <input
            type="checkbox"
            :checked="settings.iceHostCandidates"
            id="ice_host_candidates"
            @change="
              settings.setIceHostCandidates(
                !!($event.target as HTMLInputElement)?.checked
              )
            "
          />
          ICE host candidates
        </label>
        <label class="flex items-center gap-2" for="prefer_tcp">
          <input
            type="checkbox"
            :checked="settings.preferTcp"
            id="prefer_tcp"
            @change="
              settings.setPreferTcp(
                !!($event.target as HTMLInputElement)?.checked
              )
            "
          />
          Prefer TCP
        </label>
      </div>
      <div class="grid gap-4 grid-cols-4 items-start content-start">
        <div class="col-span-4 font-semibold mb-4">Profile</div>
        <div>
          <label for="replication" class="font-semibold">Replication</label>
          <span class="text-sm text-slate-500">
            of an ingress connection on the relay to the upstream
          </span>
        </div>
        <div
          class="flex items-center gap-2 justify-start basis-full shrink-0 grow col-span-3"
        >
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
        <div>
          <label for="load_profile_delay" class="font-semibold">Delay</label>
          <span class="text-sm text-slate-500">
            before creating the next upstream connection
          </span>
        </div>
        <div
          class="flex items-center gap-2 justify-start basis-full shrink-0 grow col-span-3"
        >
          <input
            id="load_profile_delay"
            type="text"
            class="border border-gray-300 rounded-md p-2"
            :value="settings.loadProfile.delay"
            @change="
              settings.setLoadProfile({
                delay: ($event.target as HTMLInputElement).value,
              })
            "
          />
          <span>time (ms, s, etc)</span>
        </div>
        <div>
          <label for="load_profile_variance" class="font-semibold"
            >Variance</label
          >
          <span class="text-sm text-slate-500">
            of the next connection delay. 0 - constant delay = base delay, 1.0 - delay is between 0 and 2x the base delay
          </span>
        </div>
        <div
          class="flex items-center gap-2 justify-start basis-full shrink-0 grow col-span-3"
        >
          <input
            id="load_profile_variance"
            type="number"
            class="border border-gray-300 rounded-md p-2"
            :value="settings.loadProfile.variance"
            @change="
              setLoadProfileVariance(($event.target as HTMLInputElement).value)
            "
          />
          <span>0.0-1.0</span>
        </div>
        <div>
          <label for="load_profile_batch_size" class="font-semibold"
            >Batch size</label
          >
          <span class="text-sm text-slate-500">
            of connections within a time window.
            When the number of connections reaches the limit, the next connection will wait until the batch window is over.
            0 - disabled.
          </span>
        </div>
        <div
          class="flex items-center gap-2 justify-start basis-full shrink-0 grow col-span-3"
        >
          <input
            id="load_profile_batch_size"
            type="number"
            class="border border-gray-300 rounded-md p-2"
            :value="settings.loadProfile.batchSize"
            @change="
              setLoadProfileBatchSize(($event.target as HTMLInputElement).value)
            "
          />
          <span>connections</span>
        </div>
        <div>
          <label for="load_profile_batch_window" class="font-semibold"
            >Batch window</label
          >
          <span class="text-sm text-slate-500">
            for a <code>batch size</code> batch number of connections. 0 - disabled.
          </span>
        </div>
        <div
          class="flex items-center gap-2 justify-start basis-full shrink-0 grow col-span-3"
        >
          <input
            id="load_profile_batch_window"
            type="text"
            class="border border-gray-300 rounded-md p-2"
            :value="settings.loadProfile.batchWindow"
            @change="
              settings.setLoadProfile({
                batchWindow: ($event.target as HTMLInputElement).value,
              })
            "
          />
          <span>time</span>
        </div>
      </div>
    </nuxt-layout>
  </div>
</template>

<script setup lang="ts">
import { useSettingsStore, type LoadProfile } from "~/stores/settings";
import type { IceTransportPolicy } from "~/types";
const settings = useSettingsStore();
const RX_DURATION = /^\d+(ms|s|us)$/;

onMounted(() => {
  const url = useRequestURL();
  const canTrickleIce = url.searchParams.get("canTrickleIce");
  if (canTrickleIce) {
    settings.setCanTrickleIce(canTrickleIce === "true");
  } else {
    settings.setCanTrickleIce(
      Number(localStorage.getItem("webrtc.settings.canTrickleIce")) === 1
    );
  }
  const iceTransportPolicy = url.searchParams.get("iceTransportPolicy");
  if (iceTransportPolicy && isIceTransportPolicy(iceTransportPolicy)) {
    settings.setIceTransportPolicy(iceTransportPolicy);
  } else {
    settings.setIceTransportPolicy(
      sanitizeIceTransportPolicy(
        localStorage.getItem("webrtc.settings.iceTransportPolicy")
      )
    );
  }
  const iceHostCandidates = url.searchParams.get("iceHostCandidates");
  if (iceHostCandidates) {
    settings.setIceHostCandidates(iceHostCandidates === "true");
  } else {
    settings.setIceHostCandidates(
      Number(localStorage.getItem("webrtc.settings.iceHostCandidates")) === 1
    );
  }
  const preferTcp = url.searchParams.get("preferTcp");
  if (preferTcp) {
    settings.setPreferTcp(preferTcp === "true");
  } else {
    settings.setPreferTcp(
      Number(localStorage.getItem("webrtc.settings.preferTcp")) === 1
    );
  }
  const loadProfile = parseLoadProfileParams(url.searchParams);
  settings.loadProfile = {
    ...sanitizeLoadProfile(
      JSON.parse(
        localStorage.getItem("webrtc.settings.amp.loadProfile") || "{}"
      )
    ),
    ...loadProfile,
  };

  const replication = url.searchParams.get("amp_count");
  if (replication) {
    settings.setReplication(sanitizeReplication(replication));
  } else {
    settings.setReplication(
      sanitizeReplication(localStorage.getItem("webrtc.settings.amp.replication"))
    );
  }
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

watch(
  () => settings.replication,
  () => {
    localStorage.setItem(
      "webrtc.settings.amp.replication",
      settings.replication.toString()
    );
  }
);
watch(
  () => settings.loadProfile,
  () => {
    localStorage.setItem(
      "webrtc.settings.amp.loadProfile",
      JSON.stringify(settings.loadProfile)
    );
  }
);

function isIceTransportPolicy(value: string): value is IceTransportPolicy {
  return value === "relay" || value === "all";
}

function sanitizeLoadProfile(value: any): LoadProfile {
  return {
    delay: value.delay || "250ms",
    variance: value.variance || 0.5,
    batchSize: value.batchSize || 10,
    batchWindow: value.batchWindow || "30s",
  };
}

function parseLoadProfileParams(params: URLSearchParams): Partial<LoadProfile> {
  const retval: Partial<LoadProfile> = {};
  const delay = params.get("amp_delay");
  if (delay && RX_DURATION.test(delay)) {
    retval.delay = delay;
  }
  const variance = params.get("amp_var");
  if (variance) {
    const v = Number(variance);
    if (!Number.isNaN(v) && v >= 0 && v <= 1) {
      retval.variance = v;
    }
  }
  const batchSize = params.get("amp_batch");
  if (batchSize) {
    const v = Number(batchSize);
    if (!Number.isNaN(v) && v >= 0) {
      retval.batchSize = v;
    }
  }
  const batchWindow = params.get("amp_batchw");
  if (batchWindow && RX_DURATION.test(batchWindow)) {
    retval.batchWindow = batchWindow;
  }
  return retval;
}

function sanitizeIceTransportPolicy(value: string | null): IceTransportPolicy {
  return value && isIceTransportPolicy(value) ? value : "all";
}

function sanitizeReplication(value: string | null): number {
  const v = Number(value)
  return Number.isNaN(v) ? 3 : v
}

function setLoadProfileVariance(value: string) {
  const parsed = Number(value)
  if (Number.isNaN(parsed) || parsed < 0 || parsed > 1) {
    return
  }
  settings.setLoadProfile({
    variance: parsed,
  })
}

function setLoadProfileBatchSize(value: string) {
  const parsed = Number(value)
  if (Number.isNaN(parsed) || parsed < 0) {
    return
  }
  settings.setLoadProfile({
    batchSize: parsed,
  })
}
</script>
