import { it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { computed, defineComponent, h, nextTick } from "vue";
import { createCalendar, useCalendar, useCurrentTimezone, useHourCycle, useGuests } from "../src/entry";
import { config, createFixtureFetch, slot } from "../../../tests/contracts/fixtures";
const create = () => createCalendar({ config, runtime: { fetch: createFixtureFetch(), now: () => new Date("2030-05-01T00:00:00Z"), getTimezone: () => "Europe/Prague", getHourCycle: () => "h12" } });
it("tracks predicate-only computed/render consumers", async () => {
  const c = create();
  const day = { label: "2", date: new Date("2030-05-02T10:00:00Z") };
  const wrapper = mount(
    defineComponent({
      setup() {
        const api = useCalendar(c);
        const selected = computed(() => api.isSelected(slot));
        const selectedDay = computed(() => api.isSelectedDay(day));
        const available = computed(() => api.dayHasTimeSlot(c.getSnapshot().calendar.days.find((d) => d.timeSlots?.length) ?? day));
        return () => h("span", `${selected.value}:${selectedDay.value}:${available.value}`);
      },
    }),
  );
  expect(wrapper.text()).toBe("false:false:false");
  await c.init();
  await nextTick();
  expect(wrapper.text()).toBe("false:true:true");
  c.actions.setSelectedTimeSlot(slot);
  await nextTick();
  expect(wrapper.text()).toBe("true:true:true");
  wrapper.unmount();
  await c.dispose();
});
it("reads captured original preferences through live scalar getters after init", async () => {
  const c = create();
  let timezoneApi!: ReturnType<typeof useCurrentTimezone>;
  let cycleApi!: ReturnType<typeof useHourCycle>;
  const wrapper = mount(
    defineComponent({
      setup() {
        timezoneApi = useCurrentTimezone(c);
        cycleApi = useHourCycle(c);
        const original = computed(() => timezoneApi.clientOriginalTimezone);
        return () => h("span", `${original.value}:${cycleApi.clientOriginalHourCycle}`);
      },
    }),
  );
  expect(wrapper.text()).toBe("UTC:h23");
  await c.init();
  await nextTick();
  expect(wrapper.text()).toBe("Europe/Prague:h12");
  await c.actions.setTimezone("America/New_York");
  c.actions.setHourCycle("h23");
  await nextTick();
  expect(wrapper.text()).toBe("Europe/Prague:h12");
  expect(typeof timezoneApi.clientOriginalTimezone).toBe("string");
  wrapper.unmount();
  await c.dispose();
});
it("rejects invalid guest mutations and replacement before changing any guest", async () => {
  const c = create();
  let api!: ReturnType<typeof useGuests>;
  const wrapper = mount(
    defineComponent({
      setup() {
        api = useGuests(c);
        return () => h("span", api.guests.value.join(","));
      },
    }),
  );
  c.actions.setMaxGuests(1);
  let changes = 0;
  const stop = c.subscribe(() => changes++);
  expect(() => api.guests.value.push("first@example.test", "second@example.test")).toThrow();
  expect(c.getSnapshot().guests).toEqual([]);
  expect(changes).toBe(0);
  api.guests.value = ["original@example.test"];
  changes = 0;
  expect(() => {
    api.guests.value = ["replacement@example.test", "extra@example.test"];
  }).toThrow();
  expect(c.getSnapshot().guests).toEqual(["original@example.test"]);
  expect(changes).toBe(0);
  c.actions.setMaxGuests(2);
  changes = 0;
  expect(() => {
    api.guests.value = ["replacement@example.test", 42 as unknown as string];
  }).toThrow();
  expect(c.getSnapshot().guests).toEqual(["original@example.test"]);
  expect(changes).toBe(0);
  expect(() => api.guests.value.splice(0, 1, "replacement@example.test", 42 as unknown as string)).toThrow();
  expect(c.getSnapshot().guests).toEqual(["original@example.test"]);
  expect(changes).toBe(0);
  stop();
  wrapper.unmount();
  await c.dispose();
});

it("passes a projected slot through core cloning and preserves booking timestamps", async () => {
  const payloads: Record<string, unknown>[] = [];
  const fixture = createFixtureFetch();
  const c = createCalendar({
    config,
    runtime: {
      now: () => new Date("2030-05-01T00:00:00Z"),
      fetch: async (input, options) => {
        if (String(input).endsWith("/reservations")) payloads.push(JSON.parse(String(options?.body)));
        return fixture(input, options);
      },
    },
  });
  let api!: ReturnType<typeof useCalendar>;
  const wrapper = mount(
    defineComponent({
      setup() {
        api = useCalendar(c);
        return () => h("span", String(api.state.timeSlots.length));
      },
    }),
  );
  await c.init();
  const projected = api.state.timeSlots[0];
  expect(Object.getOwnPropertyDescriptor(projected, "start")?.value).toBe(slot.start);
  expect(Object.getOwnPropertyDescriptor(projected, "missing")).toBeUndefined();
  expect(Object.getOwnPropertyDescriptor(api.state.timeSlots, "length")?.value).toBe(1);
  api.selectTimeSlot(projected);
  expect(c.getSnapshot().selectedTimeSlot).toEqual(slot);
  await c.actions.book({ email: "test@example.test" });
  expect(payloads[0]).toMatchObject({ start: slot.start, end: slot.end });
  wrapper.unmount();
  await c.dispose();
});
