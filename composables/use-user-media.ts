export default function useUserMedia() {
  const state = useState<{
    audioTrack: MediaStreamTrack | null
    cameraEnabled: boolean
    error: string
    micEnabled: boolean
    stream: MediaStream | null
    videoTrack: MediaStreamTrack | null,
  }>('userMedia', () => ({
    audioTrack: null,
    cameraEnabled: true,
    error: '',
    micEnabled: true,
    stream: null,
    videoTrack: null,
  }))

  return state
}
