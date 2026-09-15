import { afterEach, describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { defineComponent, h, provide } from "vue";
import { createCalendar, createCalendarScope, provideCalendar, ZaptimeProvider, useConfig, cancel, calendarScopeKey } from "../src/entry";
const create = () => createCalendar({ config: { token: "test" } });
const wrappers: ReturnType<typeof mount>[] = [];
afterEach(() => {
  wrappers.splice(0).forEach((w) => w.unmount());
  vi.unstubAllGlobals();
});
describe("instance resolution", () => {
  it("scope registers, rejects duplicates, reference counts, and excludes disposed instances", async () => {
    const s = createCalendarScope(),
      a = create(),
      b = create();
    expect(() => s.resolve()).toThrow(/missing/i);
    const off = s.register("a", a),
      offAgain = s.register("a", a);
    expect(() => s.register("a", b)).toThrow(/duplicate/i);
    off();
    expect(s.resolve()).toBe(a);
    s.register("b", b);
    expect(() => s.resolve()).toThrow(/ambiguous/i);
    expect(s.resolve("b")).toBe(b);
    offAgain();
    expect(s.resolve()).toBe(b);
    const disposal = b.dispose();
    expect(() => s.resolve()).toThrow(/missing/i);
    await disposal;
    await a.dispose();
  });
  it("inherits nearest provider and lets explicit instance and provided ID override", () => {
    const a = create(),
      b = createCalendar({ config: { token: "other" } }),
      s = createCalendarScope();
    s.register("b", b);
    let found: any;
    const Child = defineComponent({
      setup() {
        found = [useConfig().config.value.token, useConfig(b).config.value.token, useConfig("b").config.value.token];
        return () => h("span");
      },
    });
    wrappers.push(
      mount(
        defineComponent({
          setup() {
            provide(calendarScopeKey, s);
            provideCalendar(a);
            return () => h(Child);
          },
        }),
      ),
    );
    expect(found).toEqual(["test", "other", "other"]);
  });
  it("supports browser legacy unique fallback and rejects multi-app same IDs", () => {
    const a = create(),
      b = create();
    expect(() => cancel()).toThrow(/missing/i);
    wrappers.push(mount(ZaptimeProvider, { props: { calendar: a, calendarId: "same" } }));
    expect(() => cancel("missing")).toThrow(/missing/i);
    expect(cancel()).resolves.toBe(false);
    wrappers.push(mount(ZaptimeProvider, { props: { calendar: b, calendarId: "same" } }));
    expect(() => cancel()).toThrow(/ambiguous/i);
    expect(() => cancel("same")).toThrow(/ambiguous/i);
    wrappers.pop()!.unmount();
    expect(cancel("same")).resolves.toBe(false);
  });
  it("never uses browser fallback on the server", () => {
    vi.stubGlobal("window", undefined);
    expect(() => cancel()).toThrow(/server/i);
    expect(cancel(create())).resolves.toBe(false);
  });
});
