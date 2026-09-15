import { defineComponent, h } from "vue";
import { ZaptimeCalendar, ZapTimeCalendar, book, useCalendarViewState } from "@zaptime/vue3";
import { useCalendarInstance, useCalendar, useBillingAddress, useBookingForm } from "@zaptime/vue-headless";
import "@zaptime/vue3/style.css";
import "@zaptime/vue3/dist/style.css";
export const Custom = defineComponent({
  setup() {
    const instance = useCalendarInstance({ config: { token: "fixture-token" } });
    const { state, next } = useCalendar(instance);
    const { billingAddress } = useBillingAddress(instance);
    const { bookingForm } = useBookingForm(instance);
    billingAddress.value.email = "attendee@example.test";
    void bookingForm.value;
    useCalendarViewState(instance).setView("calendar");
    return () => h("button", { disabled: state.loading, onClick: next }, "Next month");
  },
});
export const Complete = () => h(ZaptimeCalendar, { config: { token: "fixture-token" } });
void ZapTimeCalendar;
void book;
