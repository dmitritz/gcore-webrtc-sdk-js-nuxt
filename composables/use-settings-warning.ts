export default function useSettingsWarning() {
  const stream = useStream();

  const whipEndpointNotPersistent = computed(
    () =>
      stream.value.whipEndpoint &&
      stream.value.initialWhipEndpoint &&
      stream.value.whipEndpoint !== stream.value.initialWhipEndpoint
  );
  const sourcesNotPersistent = computed(
    () =>
      stream.value.sources.length > 0 &&
      stream.value.initialSources.length > 0 &&
      !sameArrays(stream.value.sources, stream.value.initialSources)
  );
  return {
    whipEndpointNotPersistent,
    sourcesNotPersistent,
  };
}

function sameArrays(a: string[], b: string[]) {
  return a.length === b.length && a.every((value) => b.includes(value));
}
