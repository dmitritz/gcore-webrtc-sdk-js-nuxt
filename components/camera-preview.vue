<script setup lang="ts">
import {
  SignalIcon,
  SignalSlashIcon,
} from '@heroicons/vue/16/solid'

const mediaDevices = useMediaDevices()
const userMedia = useUserMedia()

const showPreviewLabel = false;

defineProps<{
  ended?: boolean
  live?: boolean
}>()

const frameSize = useFrameSize()
const video =
  ref<HTMLVideoElement | null>(null)

watch(
  [() => userMedia.value.stream, video],
  ([s, v]) => {
    if (!v) return
    if (s) {
      v.srcObject = s
      v.play().catch(
        (e) => {
          console.error(
            'Video element play',
            e,
          )
        },
      )
    } else {
      v.srcObject = null
    }
  },
)

</script>

<template>
  <div class="camera-preview max-w-2xl mb-4 flex flex-col justify-items-center justify-center items-center"
    v-if="mediaDevices.willUseCamera">
    <video class="aspect-video w-full" ref="video" autoplay playsinline muted id="camera_preview">
      Self preview
    </video>
    <div class="preview-label px-2 py-1 flex gap-1 items-center" :class="{ live }" v-if="showPreviewLabel">
      <signal-icon v-if="live" stroke="white" size="16" class="size-5 animate-pulse" />
      <signal-slash-icon stroke="white" size="16" class="size-5" v-else />
      <span v-if="
        frameSize.width &&
        frameSize.height
      " id="preview_videores">({{
        frameSize.width
        }}&times;{{
          frameSize.height
        }})</span>
      <slot>
      </slot>
    </div>
  </div>
</template>

<style scoped>
.camera-preview {
  position: relative;
  text-align: center;
  background-color: #eee;
}

video {
  background-color: #000;
  color: #fff;
}

@media (min-width: 640px) {
  video {
    min-width: 400px;
    min-height: 225px;
  }
}

.preview-label {
  position: absolute;
  z-index: 1;
  background-color: rgba(0, 0, 0, 0.25);
  color: #fff;
}

.live {
  background-color: rgba(205,
      0,
      0,
      0.25);
}
</style>
