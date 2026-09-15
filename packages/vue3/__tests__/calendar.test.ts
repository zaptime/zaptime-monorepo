import { afterEach, expect, it, vi } from "vitest";
import { createApp, h, nextTick } from "vue";
import Calendar from "../src/App.vue";
import { config, createFixtureFetch } from "../../../tests/contracts/fixtures";
const apps: ReturnType<typeof createApp>[] = [];
const flush = async () => {
  for (let i = 0; i < 20; i++) await new Promise((resolve) => setTimeout(resolve, 0));
  await nextTick();
};
afterEach(() => {
  apps.splice(0).forEach((app) => app.unmount());
  document.body.innerHTML = "";
  vi.unstubAllGlobals();
});
it("emits loaded once for each independent calendar with no IDs", async () => {
  vi.stubGlobal("fetch", vi.fn(createFixtureFetch()));
  const loaded = vi.fn();
  const host = document.createElement("div");
  document.body.append(host);
  const app = createApp({ render: () => h("div", [h(Calendar, { config, onCalendarLoaded: loaded }), h(Calendar, { config, onCalendarLoaded: loaded })]) });
  apps.push(app);
  app.mount(host);
  await flush();
  expect(loaded).toHaveBeenCalledTimes(2);
  expect(host.querySelectorAll(".zaptime-calendar")).toHaveLength(2);
});
it("reports failed initialization without claiming loaded", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => new Response("failed", { status: 500 })),
  );
  const loaded = vi.fn(),
    error = vi.fn();
  const host = document.createElement("div");
  document.body.append(host);
  const app = createApp(Calendar, { config, onCalendarLoaded: loaded, onError: error });
  apps.push(app);
  app.mount(host);
  await flush();
  expect(loaded).not.toHaveBeenCalled();
  expect(error).toHaveBeenCalledTimes(1);
  expect(host.querySelector('[role="alert"]')).not.toBeNull();
});
it("renders deterministic loading on the server without initialization effects", async () => {
  const fetch = vi.fn();
  vi.stubGlobal("fetch", fetch);
  const { renderToString } = await import("vue/server-renderer");
  const html = await renderToString(createApp(Calendar, { config }));
  expect(fetch).not.toHaveBeenCalled();
  expect(html).toContain("cal-animate-spin");
  expect(html).not.toContain("js.stripe.com");
});
