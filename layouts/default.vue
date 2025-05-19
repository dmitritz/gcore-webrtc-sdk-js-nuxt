<script setup lang="ts">
import pkg from "../package.json" with { type: 'json' }
import { version as rtckitver } from "@gcorevideo/rtckit";
import { reportError } from "@gcorevideo/utils";
import {
  BugAntIcon,
  CheckIcon,
  ExclamationCircleIcon,
} from "@heroicons/vue/16/solid";
import mousetrap from 'mousetrap'

const air = useAir();
const route = useRoute();
const query = route.query;
const locked = computed(() => route.path === "/" && (air.value.live || air.value.starting));
const reported = ref(false);
const { whipEndpointNotPersistent, sourcesNotPersistent } =
useSettingsWarning();
const settings = useSettingsStore()
const godModeNotification = ref(false)

const KEYS_GODMODE = 'i d d q d'

onMounted(() => {
  mousetrap.bind(KEYS_GODMODE, () => {
    setGodMode()
    godModeNotification.value = true
    setTimeout(() => {
      godModeNotification.value = false
    }, 3000)
  })
  const url = useRequestURL()
  const godMode = url.searchParams.get('iddqd')
  if (godMode !== null) {
    setGodMode()
  }
})

function report() {
  reported.value = true;
  reportError(new Error("User reported error"));
  setTimeout(() => {
    reported.value = false;
  }, 1000);
}

function setGodMode() {
  if (settings.godMode) {
    return
  }
  settings.setGodMode(true)
}
</script>

<template>
  <div class="container mx-auto h-screen flex flex-col">
    <NuxtRouteAnnouncer />
    <header class="w-full my-8 px-2">
      <div class="flex basis-auto items-center flex-wrap gap-4 mb-4">
        <img
          src="~/assets/img/gcore_black_001.svg"
          alt="Gcore logo"
          class="basis-1/3 w-1/3 max-w-48"
        />
        <div class="flex-auto text-slate-700 text-2xl">
          <slot name="header">Here we go</slot>
          <button
            @click="report"
            title="Report a bug"
            class="border border-red-300 inline-flex justify-self-end rounded text-sm p-1"
            :disabled="reported"
          >
            <bug-ant-icon class="w-4 h-4 text-red-500" v-if="!reported" />
            <check-icon class="w-4 h-4 text-red-500" v-else />
          </button>
        </div>
      </div>
      <nav class="my-2 flex gap-2 mb-4">
        <nuxt-link
          :to="{ path: '/', query }"
          id="nav_host"
          class="r"
          :class="{ disabled: locked }"
          >Host</nuxt-link
        >
        <nuxt-link
          :to="{
            path: '/settings',
            query,
          }"
          id="nav_settings"
          :class="{ disabled: locked }"
          >Settings
          <exclamation-circle-icon
            class="w-4 h-4 inline"
            v-if="whipEndpointNotPersistent || sourcesNotPersistent"
          />
        </nuxt-link>
        <transition name="fade">
          <nuxt-link
            :to="{ path: '/extra', query }"
            id="nav_extra"
            class="r"
            :class="{ disabled: locked }"
            v-if="settings.godMode"
            >Extra</nuxt-link
          >
        </transition>
      </nav>
    </header>
    <main class="basis-full px-2">
      <slot></slot>
    </main>
    <footer class="w-full mt-8 mb-4 mx-auto basis-auto">
      <div class="m:w-24 flex justify-evenly gap-4">
        <img
          src="~/assets/img/h264-logo.svg"
          alt="H264 logo"
          class="basis-1/2 w-1/2 max-w-24"
        />
        <img
          src="~/assets/img/opus-logo.svg"
          alt="Opus logo"
          class="basis-1/2 w-1/2 max-w-24"
        />
      </div>
      <div class="text-end text-slate-700 text-sm">
        <p>
          {{ pkg.version }}/rtckit <b>{{ rtckitver }}</b>
        </p>
      </div>
    </footer>
    <div
      v-if="godModeNotification"
      class="god-mode-notification fixed bottom-0 right-0 text-white py-3 px-6 uppercase text-xl font-bold"
    >
      God mode
    </div>
  </div>
</template>

<style scoped>
@reference "~/assets/css/main.css";

nav a {
  text-decoration: none;
  text-transform: lowercase;
  @apply rounded py-1 px-2;
  @apply text-orange-500 hover:text-orange-500 bg-transparent;
}
.router-link-active {
  cursor: default;
  @apply text-slate-700 hover:text-slate-700 bg-slate-100;
}
.disabled {
  pointer-events: none;
  @apply text-slate-300;
}

.god-mode-notification {
  background-color: oklch(82.8% 0.189 84.429 / 67%);
}

.fade-enter-active,
.fade-leave-active {
  transition-delay: 0.1s;
  transition-duration: 0.5s;
  transition-property: opacity background-color;
  transition-timing-function: ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

a.fade-enter-to {
  @apply bg-orange-600 text-white;
}
</style>
