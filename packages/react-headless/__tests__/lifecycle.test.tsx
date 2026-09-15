import { StrictMode } from "react";
import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { createCalendar } from "@zaptime/core";
import { useCalendarInstance, useCalendar, ZaptimeProvider, CalendarProviderError } from "../src/entry";
afterEach(cleanup);
export function options() {
  const fetch = vi.fn<typeof globalThis.fetch>(
    async (url) => new Response(JSON.stringify({ success: true, data: String(url).includes("event-types/init") ? { configuration: {}, disabled: false, isSubscribed: true } : [] })),
  );
  return { config: { token: "a", max: 1 }, runtime: { fetch, now: () => new Date("2026-09-15T12:00:00Z"), getTimezone: () => "UTC" } };
}
it("initializes a committed StrictMode owner once and defers terminal disposal past replay", async () => {
  const opts = options();
  const { result, unmount, rerender } = renderHook(
    () => {
      const c = useCalendarInstance({ ...opts, config: { ...opts.config } });
      useCalendar(c);
      return c;
    },
    { wrapper: StrictMode },
  );
  await act(async () => {
    await result.current.init();
  });
  expect(opts.runtime.fetch.mock.calls.filter(([url]) => String(url).includes("event-types/init"))).toHaveLength(1);
  expect(result.current.getSnapshot().phase).toBe("ready");
  const revision = result.current.getSnapshot().revision;
  rerender();
  await act(async () => {});
  expect(result.current.getSnapshot().revision).toBe(revision);
  unmount();
  await act(async () => {});
  expect(result.current.getSnapshot().phase).toBe("disposed");
});
it("reconciles semantic config changes after commit without replacing owner", async () => {
  const opts = options();
  const { result, rerender } = renderHook(({ compact }) => useCalendarInstance({ ...opts, config: { ...opts.config, compact } }), { initialProps: { compact: false } });
  const original = result.current;
  await act(async () => {
    await original.init();
  });
  rerender({ compact: true });
  await act(async () => {});
  expect(result.current).toBe(original);
  expect(original.getSnapshot().config.compact).toBe(true);
  expect(opts.runtime.fetch.mock.calls.filter(([url]) => String(url).includes("event-types/init"))).toHaveLength(1);
});
it("borrows nearest provider and never initializes or disposes host instances", async () => {
  const a = createCalendar(options()),
    b = createCalendar(options());
  const { result, unmount } = renderHook(() => useCalendar(), {
    wrapper: ({ children }) => (
      <ZaptimeProvider calendar={a}>
        <ZaptimeProvider calendar={b}>{children}</ZaptimeProvider>
      </ZaptimeProvider>
    ),
  });
  expect(result.current.config.token).toBe("a");
  expect(result.current.state).toBe(b.getSnapshot().calendar);
  unmount();
  await act(async () => {});
  expect(b.getSnapshot().phase).toBe("idle");
  expect(a.getSnapshot().phase).toBe("idle");
});
it("throws a typed error for missing provider", () => {
  expect(() => renderHook(() => useCalendar())).toThrow(CalendarProviderError);
});
it("clears removed optional authorization props on reconciliation", async () => {
  const opts = options();
  const { result, rerender } = renderHook(({ override }: { override?: string }) => useCalendarInstance({ ...opts, config: { ...opts.config, ...(override ? { rescheduleOverrideToken: override } : {}) } }), {
    initialProps: { override: "proof" } as { override?: string },
  });
  await act(async () => {
    await result.current.init();
  });
  rerender({});
  await act(async () => {});
  expect(result.current.getSnapshot().config.rescheduleOverrideToken).toBeUndefined();
});
