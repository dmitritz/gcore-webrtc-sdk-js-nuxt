import { defineStore } from 'pinia'

type State = {
  live: boolean
  ended: boolean
  starting: boolean
}

type Actions = {
  reset: () => void
  end: () => void
  start: () => void
  started: () => void
}

export const useAirStore = defineStore<"air", State, {}, Actions>('air', {
  state: () => ({
    live: false,
    ended: false,
    starting: false,
  }),
  actions: {
    reset() {
      this.live = false
      this.ended = false
      this.starting = false
    },
    end() {
      this.live = false
      this.ended = true
    },
    start() {
      this.starting = true
    },
    started() {
      this.starting = false
      this.live = true
    },  
  },
})