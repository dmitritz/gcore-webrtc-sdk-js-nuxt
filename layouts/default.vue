<script setup lang="ts">
import { version as rtckitver } from "@gcorevideo/rtckit";
import { reportError } from "@gcorevideo/utils";
import {
  BugAntIcon,
  CheckIcon,
  ExclamationCircleIcon,
} from "@heroicons/vue/16/solid";
import pkg from "../package.json";

const air = useAir();
const route = useRoute();
const query = route.query;
const locked = computed(() => route.path === "/host" && air.value.live);
const reported = ref(false);
const { whipEndpointNotPersistent, sourcesNotPersistent } =
  useSettingsWarning();
function report() {
  reported.value = true;
  reportError(new Error("User reported error"));
  setTimeout(() => {
    reported.value = false;
  }, 1000);
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
        <router-link
          :to="{ path: '/', query }"
          id="nav_host"
          class="r"
          :class="{ disabled: locked }"
          >Host</router-link
        >
        <router-link
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
        </router-link>
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
  </div>
</template>

<style scoped>
@import "tailwindcss";

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
</style>
