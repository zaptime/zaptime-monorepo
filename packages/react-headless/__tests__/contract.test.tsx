import { act, renderHook } from "@testing-library/react";
import { it } from "vitest";
import { createCalendar } from "@zaptime/core";
import { useSlice } from "../src/store";
import { runCalendarContract } from "../../../tests/contracts/calendarContract";
runCalendarContract(async (options) => {
  const calendar = createCalendar(options);
  const { result, unmount } = renderHook(() => useSlice(calendar, ...(Object.keys(calendar.getSnapshot()) as (keyof ReturnType<typeof calendar.getSnapshot>)[])));
  let closed = false;
  return {
    calendar,
    read: () => result.current,
    flush: async () => {
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });
    },
    unmount: async () => {
      if (closed) return;
      closed = true;
      unmount();
      await calendar.dispose();
    },
  };
}, it);
