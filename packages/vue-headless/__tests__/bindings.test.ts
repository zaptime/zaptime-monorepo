import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { defineComponent, h, nextTick } from "vue";
import { createCalendar, provideCalendar, useCalendar, useBillingAddress, useConfig, useGuests, useBookingForm } from "../src/entry";
import { config, createFixtureFetch, customFields } from "../../../tests/contracts/fixtures";
export const calendar = () => createCalendar({ config, runtime: { fetch: createFixtureFetch(), now: () => new Date("2030-05-01T00:00:00Z"), getTimezone: () => "UTC" } });
describe("mounted bindings", () => {
  it("routes deep billing, config, field and guest writes into core and renders reset through retained state", async () => {
    const c = calendar();
    let api: any;
    const wrapper = mount(
      defineComponent({
        setup() {
          provideCalendar(c);
          const { state } = useCalendar(c);
          const billing = useBillingAddress(c);
          api = { ...billing, ...useConfig(c), ...useGuests(c), ...useBookingForm(c) };
          return () =>
            h("div", [h("input", { value: billing.billingAddress.value.email, onInput: (e: Event) => (billing.billingAddress.value.email = (e.target as HTMLInputElement).value) }), h("span", String(state.initLoaded))]);
        },
      }),
    );
    await wrapper.find("input").setValue("new@example.test");
    expect(c.getSnapshot().billingAddress.email).toBe("new@example.test");
    api.config.value.locale = { texts: { chooseDate: "Initial" } };
    api.config.value.locale.texts.chooseDate = "Choose";
    expect(c.getSnapshot().config.locale?.texts?.chooseDate).toBe("Choose");
    c.actions.setBookingForm(customFields);
    api.bookingForm.value[0].value = "Changed";
    expect(c.getSnapshot().bookingForm[0].value).toBe("Changed");
    c.actions.setMaxGuests(3);
    api.guests.value.push("one@example.test");
    api.guests.value[0] = "two@example.test";
    expect(c.getSnapshot().guests).toEqual(["two@example.test"]);
    await c.init();
    await nextTick();
    expect(wrapper.find("span").text()).toBe("true");
    await c.actions.setConfig({ token: "second" });
    await nextTick();
    expect(wrapper.find("span").text()).toBe("true");
    wrapper.unmount();
    await c.dispose();
  });
});

it("rejects identity writes synchronously while booking and keeps derived state readonly", async () => {
  let release!: () => void;
  const pending = new Promise<void>((resolve) => (release = resolve));
  const fixture = createFixtureFetch();
  const c = createCalendar({
    config,
    runtime: {
      fetch: async (input, options) => {
        if (String(input).endsWith("/reservations")) await pending;
        return fixture(input, options);
      },
      now: () => new Date("2030-05-01"),
    },
  });
  await c.init();
  let api: any;
  const w = mount(
    defineComponent({
      setup() {
        api = { ...useConfig(c), ...useCalendar(c) };
        return () => h("span", api.state.initLoaded ? "loaded" : "loading");
      },
    }),
  );
  const { slot } = await import("../../../tests/contracts/fixtures");
  c.actions.setSelectedTimeSlot(slot);
  const booking = c.actions.book({ email: "test@example.test" });
  expect(() => {
    api.config.value.token = "changed";
  }).toThrow(/identity|busy/i);
  expect(c.getSnapshot().config.token).toBe(config.token);
  expect(() => {
    api.state.loading = true;
  }).toThrow(/readonly/i);
  const date = api.state.date;
  date.setFullYear(1900);
  expect(c.getSnapshot().calendar.date.getFullYear()).toBe(2030);
  release();
  await booking;
  w.unmount();
  await c.dispose();
});

it("retains nested handles after replacing billing and supports form array operations", async () => {
  const c = calendar();
  let api: any;
  const w = mount(
    defineComponent({
      setup() {
        api = { ...useBillingAddress(c), ...useBookingForm(c) };
        return () => h("span", api.billingAddress.value.email);
      },
    }),
  );
  const retained = api.billingAddress.value;
  c.actions.updateBillingAddressField("email", "first@example.test");
  await nextTick();
  expect(w.text()).toBe("first@example.test");
  retained.email = "second@example.test";
  expect(c.getSnapshot().billingAddress.email).toBe("second@example.test");
  api.bookingForm.value.push(...customFields);
  api.bookingForm.value.splice(0, 1);
  expect(c.getSnapshot().bookingForm.length).toBe(customFields.length - 1);
  delete api.bookingForm.value[0].placeholder;
  expect(c.getSnapshot().bookingForm[0].placeholder).toBeUndefined();
  w.unmount();
  await c.dispose();
});

it("reports unsupported config deletion instead of silently retaining an override", async () => {
  const c = calendar();
  let configRef: any;
  const w = mount(
    defineComponent({
      setup() {
        configRef = useConfig(c).config;
        return () => h("div");
      },
    }),
  );
  configRef.value.locale = { texts: { chooseDate: "Keep" } };
  expect(() => {
    delete configRef.value.locale.texts.chooseDate;
  }).toThrow(/deletion/);
  expect(c.getSnapshot().config.locale?.texts?.chooseDate).toBe("Keep");
  w.unmount();
  await c.dispose();
});
