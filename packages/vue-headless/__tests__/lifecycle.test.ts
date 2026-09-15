import { describe, it, expect, vi } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import { defineComponent, h } from "vue";
import { renderToString } from "vue/server-renderer";
import { createCalendar, useCalendarInstance, useConfig, ZaptimeProvider, cancel } from "../src/entry";
import { config, createFixtureFetch } from "../../../tests/contracts/fixtures";
describe("ownership", () => {
  it("initializes once on mount, resolves IDs during setup, and disposes after microtask", async () => {
    const fetch = vi.fn(createFixtureFetch());
    let c: any;
    const Host = defineComponent({
      setup() {
        c = useCalendarInstance({ config, calendarId: "owned", runtime: { fetch, now: () => new Date("2030-05-01") } });
        expect(useConfig("owned").config.value.token).toBe(config.token);
        useConfig(c);
        useConfig(c);
        return () => h("div");
      },
    });
    const w = mount(Host);
    await flushPromises();
    expect(fetch.mock.calls.filter(([url]) => String(url).includes("event-types/init"))).toHaveLength(1);
    w.unmount();
    expect(() => cancel("owned")).toThrow(/missing/i);
    await flushPromises();
    expect(c.getSnapshot().phase).toBe("disposed");
  });
  it("borrowed provider never initializes or disposes", async () => {
    const c = createCalendar({ config });
    const init = vi.spyOn(c, "init"),
      dispose = vi.spyOn(c, "dispose");
    const w = mount(ZaptimeProvider, { props: { calendar: c } });
    w.unmount();
    await flushPromises();
    expect(init).not.toHaveBeenCalled();
    expect(dispose).not.toHaveBeenCalled();
    await c.dispose();
  });
  it("SSR owner construction makes no IO", async () => {
    const fetch = vi.fn();
    await renderToString(
      h(
        defineComponent({
          setup() {
            useCalendarInstance({ config, runtime: { fetch } });
            return () => h("span", "Loading");
          },
        }),
      ),
    );
    expect(fetch).not.toHaveBeenCalled();
  });
});
