import { beforeEach, describe, expect, it } from "vitest";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import Default from "../default.vue";
import { useSettingsStore } from "~/stores/settings";
describe("settings", () => {
  describe("god mode", async () => {
    it("should initialize from URL query string", async () => {
      location.search = "iddqd"
      const store = useSettingsStore()
      await mountSuspended(Default);
      expect(store.godMode).toBe(true);
    });
  });
});