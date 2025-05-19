export type StreamInfoWithInitialValues = StreamInfo & {
  initialWhipEndpoint: string;
  initialSources: string[];
};

import type { StreamInfo } from "~/types/stream";

export default function useStream(): Ref<StreamInfoWithInitialValues> {
  return useState<StreamInfoWithInitialValues>("stream", function () {
    const url = useRequestURL();
    const streamId = url.searchParams.get("stream_id");
    const token = url.searchParams.get("stream_token");
    const server = url.searchParams.get("server");
    const sources = url.searchParams.get("sources")?.split(",") ?? [];
    if (streamId && token) {
      const id = parseInt(streamId, 10);
      const whipEndpoint = buildWhipEndpoint(streamId, token, server || "");
      const whepEndpoint = ""; // TODO drop
      const playerUrl = "";
      return {
        id,
        whipEndpoint,
        whepEndpoint,
        playerUrl,
        sources,
        initialWhipEndpoint: whipEndpoint,
        initialSources: sources,
      };
    }
    return {
      id: 0,
      whipEndpoint: "",
      whepEndpoint: "",
      playerUrl: "",
      sources: [],
      initialWhipEndpoint: "",
      initialSources: [],
    } as StreamInfoWithInitialValues;
  });
}

function buildWhipEndpoint(
  streamId: string,
  token: string,
  hostname: string
): string {
  return `https://${hostname || "whip.gvideo.co"}/${streamId}_${token}/whip`;
}
