import type { StreamInfo } from "~/types/stream";

const stream = ref<StreamInfo>({
  id: 0,
  whipEndpoint: "",
  whepEndpoint: "",
  playerUrl: "",
  sources: [],
});

export default function useStream(): Ref<StreamInfo> {
  return stream;
}
