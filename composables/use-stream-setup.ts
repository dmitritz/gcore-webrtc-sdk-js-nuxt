import type { StreamInfo } from "~/types/stream";
import useStream from "./use-stream";

const STREAM_NAME = "My damn awesome WebRTC stream";

// TODO importing JSON

export default async function useStreamSetup() {
  const stream = useStream();
  const persisted = useCookie<StreamInfo>("stream");
  const data = await fetchStream(persisted.value);
  persisted.value = data;
  console.log('useStreamSetup', data);
  if (!stream.value.whipEndpoint) {
    stream.value = {
      ...data,
      initialWhipEndpoint: data.whipEndpoint,
      initialSources: data.sources,
    }
  }
}

async function fetchStream(value: StreamInfo | undefined): Promise<StreamInfo> {
  if (!value) {
    const { data } = await useFetch("/api/generate", {
      method: "POST",
      body: {
        name: STREAM_NAME,
      },
    });
    if (!data.value) {
      throw new Error("Failed to generate stream");
    }
    return data.value as StreamInfo;
  }
  const { error, data, status } = await useFetch("/api/keepalive", {
    method: "POST",
    body: {
      id: value.id,
      name: STREAM_NAME,
    },
  });
  if (error.value) {
    throw new Error("Failed to keepalive stream");
  }
  if (data.value) {
    return data.value as StreamInfo;
  }
  return value;
}
