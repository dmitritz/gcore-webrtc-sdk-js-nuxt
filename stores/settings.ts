import { defineStore } from 'pinia'

type State = {
    iceTransportPolicy: 'relay' | 'all'
    preferTcp: boolean
    videoCodecs: string[]
    canTrickleIce: boolean
    iceHostCandidates: boolean
    godMode: boolean // enables additional low-level control parameters in the UI
}

type Actions = {
    setIceTransportPolicy: (iceTransportPolicy: 'relay' | 'all') => void    
    setPreferTcp: (preferTcp: boolean) => void
    setVideoCodecs: (videoCodecs: string[]) => void
    setCanTrickleIce: (canTrickleIce: boolean) => void
    setGodMode: (godMode: boolean) => void
    setIceHostCandidates: (iceHostCandidates: boolean) => void
}

const DEFAULT_SETTINGS = {
    iceTransportPolicy: 'relay' as 'relay' | 'all',
    preferTcp: true,
    videoCodecs: ['H264'],
    canTrickleIce: true,
    iceHostCandidates: false,
    godMode: false,
}

export const useSettingsStore = defineStore<"settings",State, {}, Actions>('settings', {
  state: () => ({
    ...DEFAULT_SETTINGS,
  }),
  actions: {
    setIceTransportPolicy(iceTransportPolicy: 'relay' | 'all') {
      this.iceTransportPolicy = iceTransportPolicy
    },
    setPreferTcp(preferTcp: boolean) {
      this.preferTcp = preferTcp
    },
    setVideoCodecs(videoCodecs: string[]) {
      this.videoCodecs = videoCodecs
    },
    setCanTrickleIce(canTrickleIce: boolean) {
      this.canTrickleIce = canTrickleIce
    },
    setGodMode(godMode: boolean) {
      this.godMode = godMode
    },
    setIceHostCandidates(iceHostCandidates: boolean) {
      this.iceHostCandidates = iceHostCandidates
    },
  },
})
