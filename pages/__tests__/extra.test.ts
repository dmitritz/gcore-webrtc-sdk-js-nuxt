import { describe, it, expect, beforeEach } from "vitest";
import { type VueWrapper, type DOMWrapper } from "@vue/test-utils";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import Extra from "../extra.vue";
import { type State, useSettingsStore } from "~/stores/settings";
describe("extra", () => {
  describe("settings from URL query string", () => {
    let component: VueWrapper<any>
    let store: ReturnType<typeof useSettingsStore>
  
    describe.each([
      ["replication", "amp_count=10", "input[id='replication']", 10, (s: State) => s.replication],
      ["replication default value", "amp_count=z", "input[id='replication']", 3, (s: State) => s.replication],
      ["load profile delay", "amp_delay=100ms", "input[id='load_profile_delay']", "100ms", (s: State) => s.loadProfile.delay],
      ["load profile delay default", "amp_delay=100", "input[id='load_profile_delay']", "250ms", (s: State) => s.loadProfile.delay],
      ["load profile delay default", "amp_delay=", "input[id='load_profile_delay']", "250ms", (s: State) => s.loadProfile.delay],
      ["load profile delay default", "amp_delay=12oz", "input[id='load_profile_delay']", "250ms", (s: State) => s.loadProfile.delay],
      ["load profile variance", "amp_var=0.75", "input[id='load_profile_variance']", 0.75, (s: State) => s.loadProfile.variance],
      ["load profile variance default", "amp_var=", "input[id='load_profile_variance']", 0.5, (s: State) => s.loadProfile.variance],
      ["load profile batch size", "amp_batch=0", "input[id='load_profile_batch_size']", 0, (s: State) => s.loadProfile.batchSize],
      ["load profile batch size default", "amp_batch=", "input[id='load_profile_batch_size']", 10, (s: State) => s.loadProfile.batchSize],
      ["load profile batch window", "amp_batchw=10s", "input[id='load_profile_batch_window']", "10s", (s: State) => s.loadProfile.batchWindow],
      ["load profile batch window default", "amp_batchw=", "input[id='load_profile_batch_window']", "30s", (s: State) => s.loadProfile.batchWindow],
    ])("%s", (_, query, selector, value, storeProp) => {
      beforeEach(async () => {
        location.search = query
        localStorage.clear();
        store = useSettingsStore()
        component = await mountSuspended(Extra)
      });
      it("should be initialized", () => {
        const input = component.find(selector) as DOMWrapper<HTMLInputElement>
        expect(input.element.value).toBe(String(value))
        expect(storeProp(store)).toBe(value)
      });
    })
  });
});
