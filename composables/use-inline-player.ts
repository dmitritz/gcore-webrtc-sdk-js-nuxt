export default function useInlinePlayer() {
  return import.meta.client
    ? new URL(location.href).searchParams.has("inline_player")
    : false;
}
