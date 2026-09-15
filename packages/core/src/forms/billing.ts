import type { CalendarContext } from "../calendar/lifecycle";
import type { CalendarActions } from "../calendar/types";
import { assertFormEditable, invalid } from "../booking/validation";

export function createBillingActions(context: CalendarContext): Pick<CalendarActions, "setBillingAddress" | "updateBillingAddressField"> {
  const { store } = context;
  return {
    setBillingAddress(address) {
      assertFormEditable(context);
      const keys = Object.keys(store.getSnapshot().billingAddress) as (keyof typeof address)[];
      for (const key of keys) if (typeof address[key] !== "string") invalid(`billingAddress.${key}`, "type");
      store.commit({ billingAddress: Object.fromEntries(keys.map(key => [key, address[key]])) as typeof address });
    },
    updateBillingAddressField(field, value) {
      assertFormEditable(context);
      if (!Object.hasOwn(store.getSnapshot().billingAddress, field)) invalid(`billingAddress.${field}`, "unknown-field");
      if (typeof value !== "string") invalid(`billingAddress.${field}`, "type");
      store.commit({ billingAddress: { ...store.getSnapshot().billingAddress, [field]: value } });
    },
  };
}
