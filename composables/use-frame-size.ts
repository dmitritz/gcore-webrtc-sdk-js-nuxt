export type FrameSize = {
  width: number
  height: number
}

export default function useFrameSize() {
  const userMedia = useUserMedia()

  const state = ref<FrameSize>({
    width: 0,
    height: 0,
  })

  watch(
    () => userMedia.value.videoTrack,
    (track) => {
      if (!track) return
      const { width = 0, height = 0 } =
        track.getSettings()
      state.value.width = width;
      state.value.height = height;
    },
  )

  return state
}
