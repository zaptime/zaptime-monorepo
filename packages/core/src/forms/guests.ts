import type { CalendarContext } from "../calendar/lifecycle";
import type { CalendarActions } from "../calendar/types";
import { assertFormEditable, invalid } from "../booking/validation";

export function createGuestActions(context: CalendarContext) {
  const { store } = context;
  const guestsEnabled = () => (store.getSnapshot().maxGuests ?? 0) > 0;
  const canAddGuest = () => guestsEnabled() && store.getSnapshot().guests.length < store.getSnapshot().maxGuests!;
  const indexExists = (index: number) => {
    if (!Number.isInteger(index) || index < 0 || index >= store.getSnapshot().guests.length) invalid("guests", "index");
  };
  const actions: Pick<CalendarActions, "setMaxGuests" | "addGuest" | "removeGuest" | "updateGuest"> = {
    setMaxGuests(maxGuests) {
      assertFormEditable(context);
      if (maxGuests !== null && (!Number.isInteger(maxGuests) || maxGuests < 0)) invalid("maxGuests", "range");
      store.commit({ maxGuests });
    },
    addGuest(email = "") {
      assertFormEditable(context);
      if (!canAddGuest()) invalid("guests", "limit");
      if (typeof email !== "string") invalid("guests", "type");
      store.commit({ guests: [...store.getSnapshot().guests, email] });
    },
    removeGuest(index) {
      assertFormEditable(context);
      indexExists(index);
      store.commit({ guests: store.getSnapshot().guests.filter((_, i) => i !== index) });
    },
    updateGuest(index, email) {
      assertFormEditable(context);
      indexExists(index);
      if (typeof email !== "string") invalid(`guests.${index}`, "type");
      store.commit({ guests: store.getSnapshot().guests.map((guest, i) => (i === index ? email : guest)) });
    },
  };
  return { actions, selectors: { guestsEnabled, canAddGuest } };
}
