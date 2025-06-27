export default function useTuneHls() {
  return useState<boolean>("tuneHls", () => new URL(location.href).searchParams.has('tune_hls'));
}
