import type { StreamInfo } from "~/types/stream";

const stream = ref<StreamInfo>({
  id: 0,
  whipEndpoint: "",
  whepEndpoint: "",
  playerUrl: "",
  sources: [],
});

export default function useStream(): Ref<StreamInfo> {
  console.log(
    "useStream whip:%s sources:%s",
    stream.value.whipEndpoint,
    stream.value.sources.map((s) => s.substring(0, 20))
  );
  return stream;
}
