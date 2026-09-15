import { afterEach, expect, it, vi } from "vitest";
import { createApp } from "vue";
import Calendar from "../src/App.vue";
import { config, createFixtureFetch, slot } from "../../../tests/contracts/fixtures";
const apps: ReturnType<typeof createApp>[] = [];
const flush = async () => {
  for (let i = 0; i < 15; i++) await new Promise((r) => setTimeout(r, 0));
};
afterEach(() => {
  apps.splice(0).forEach((app) => app.unmount());
  document.body.innerHTML = "";
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  vi.useRealTimers();
});
async function mount(compact = false) {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date("2030-05-01T00:00:00Z"));
  const fixture = createFixtureFetch();
  vi.stubGlobal("fetch", async (input: RequestInfo | URL, init?: RequestInit) =>
    String(input).includes("time-slots") ? Response.json({ success: true, data: [slot, { ...slot, start: "2030-05-03T10:00:00Z", end: "2030-05-03T10:30:00Z" }] }) : fixture(input, init),
  );
  const host = document.createElement("div");
  document.body.append(host);
  const app = createApp(Calendar, { config: { ...config, compact } });
  apps.push(app);
  app.mount(host);
  await flush();
  return host;
}
it("names month and timezone controls and exposes zones to keyboard users", async () => {
  // The test exercises keyboard access, not the host ICU database's size.
  vi.spyOn(Intl, "supportedValuesOf").mockReturnValue(["Europe/Prague", "America/New_York"]);
  const host = await mount();
  expect(host.querySelector('button[aria-label="Next month"]')).not.toBeNull();
  const input = host.querySelector('input[aria-label="Timezone"]') as HTMLInputElement;
  expect(input).not.toBeNull();
  input.focus();
  input.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
  await flush();
  expect(document.querySelector('[role="option"]')).not.toBeNull();
  expect(host.querySelector('button[aria-label="Timezone"]')).not.toBeNull();
});
it("provides full date names and arrow key movement", async () => {
  const host = await mount();
  const first = host.querySelector('button[aria-label="May 2, 2030"]') as HTMLButtonElement;
  expect(first).not.toBeNull();
  first.focus();
  first.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
  expect(document.activeElement).toBe(host.querySelector('button[aria-label="May 3, 2030"]'));
  first.click();
  await flush();
  expect(first.getAttribute("aria-pressed")).toBe("true");
});
it("moves focus into compact time selection after choosing a day", async () => {
  const host = await mount(true);
  const first = host.querySelector('button[aria-label="May 2, 2030"]') as HTMLButtonElement;
  expect(first).not.toBeNull();
  first.focus();
  first.click();
  await flush();
  expect(document.activeElement?.getAttribute("aria-label")).toBe("Available times");
});
it("announces loading before initialization resolves", () => {
  vi.stubGlobal("fetch", () => new Promise(() => {}));
  const host = document.createElement("div");
  document.body.append(host);
  const app = createApp(Calendar, { config });
  apps.push(app);
  app.mount(host);
  expect(host.querySelector('[role="status"]')?.textContent).toContain("Loading");
});
