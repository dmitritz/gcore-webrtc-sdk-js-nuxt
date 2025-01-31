import type { StreamInfo } from "~/types/stream"

export default function usePersistence() {
  const pval = ref<StreamInfo>({
    id: 0,
    whipEndpoint: '',
    whepEndpoint: '',
    playerUrl: '',
    sources: [],
  })
  if (import.meta.client) {
    // const cookie = useCookie<StreamInfo>('stream')
    pval.value = {
      id: parseInt(localStorage.getItem('stream.id') ?? '0', 10),
      whipEndpoint: localStorage.getItem('stream.whip_endpoint') ?? '',
      whepEndpoint: localStorage.getItem('stream.whep_endpoint') ?? '',
      playerUrl: localStorage.getItem('stream.player_url') ?? '',
      sources: localStorage.getItem('stream.sources')?.split(',').filter(Boolean) ?? [],
    }
  }
  watch(pval, (val) => {
    localStorage.setItem('stream.id', val.id.toString())
    localStorage.setItem('stream.whip_endpoint', val.whipEndpoint)
    localStorage.setItem('stream.whep_endpoint', val.whepEndpoint)
    localStorage.setItem('stream.player_url', val.playerUrl)
    localStorage.setItem('stream.sources', val.sources.join(','))
  })
  return pval
}