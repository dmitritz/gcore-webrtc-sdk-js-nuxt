export default function useTuneHls() {
  return useState<boolean>("tuneHls", () => false);
}
