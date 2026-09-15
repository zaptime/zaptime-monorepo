import { afterEach, expect, it } from "vitest";
import { effectScope, nextTick, watchEffect } from "vue";
import { createCalendar, useCalendar, useConfig, useDateFormatters } from "../src/entry";
import { config, createFixtureFetch } from "../../../tests/contracts/fixtures";
const owners: ReturnType<typeof createCalendar>[] = [];
afterEach(async () => {
  await Promise.all(owners.splice(0).map((owner) => owner.dispose()));
});
function owner() {
  const value = createCalendar({ config, runtime: { fetch: createFixtureFetch(), now: () => new Date("2030-05-01T00:00:00Z"), getTimezone: () => "UTC" } });
  owners.push(value);
  return value;
}
it("keeps a captured facade reactive through initialization and identity reset", async () => {
  const calendar = owner(),
    scope = effectScope();
  const { state, observed } = scope.run(() => {
    const { state } = useCalendar(calendar);
    const observed: boolean[] = [];
    watchEffect(() => observed.push(state.initLoaded));
    return { state, observed };
  })!;
  await calendar.init();
  await nextTick();
  expect(state.initLoaded).toBe(true);
  expect(observed[0]).toBe(false);
  expect(observed.at(-1)).toBe(true);
  const reset = calendar.actions.setConfig({ token: "another-token" });
  await nextTick();
  expect(state.initLoaded).toBe(false);
  await reset;
  await nextTick();
  expect(state.initLoaded).toBe(true);
  expect(state.days.length).toBeGreaterThanOrEqual(28);
  scope.stop();
});
it("isolates locale formatters and preserves merged local text overrides", async () => {
  const first = owner(),
    second = owner();
  const scope = effectScope();
  const [a, b, c] = scope.run(() => [useDateFormatters(first), useDateFormatters(second), useConfig(first)] as const)!;
  await first.init();
  await second.init();
  await a.loadDateFnsConfig("sk");
  await b.loadDateFnsConfig("cs");
  expect(a.getFormattedDay("2030-05-02T10:00:00Z")).toBe("štvrtok");
  expect(b.getFormattedDay("2030-05-02T10:00:00Z")).toBe("čtvrtek");
  c.setConfig({ token: config.token, locale: { texts: { chooseDate: "Local date" } } });
  await nextTick();
  expect(c.config.value.locale?.preset).toBe("en");
  expect(c.config.value.locale?.texts?.chooseDate).toBe("Local date");
  scope.stop();
});
