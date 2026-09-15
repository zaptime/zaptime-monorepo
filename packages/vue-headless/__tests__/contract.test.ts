import { it } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import { defineComponent, h, nextTick } from "vue";
import { createCalendar, provideCalendar } from "../src/entry";
import { snapshotBridge } from "../src/bridge";
import { runCalendarContract } from "../../../tests/contracts/calendarContract";
runCalendarContract(async (options) => {
  const calendar = createCalendar(options);
  let rendered = calendar.getSnapshot();
  const wrapper = mount(
    defineComponent({
      setup() {
        provideCalendar(calendar);
        const snapshot = snapshotBridge(calendar);
        return () => {
          rendered = snapshot.value;
          return h("div", `${rendered.phase}:${rendered.revision}`);
        };
      },
    }),
  );
  let closed = false;
  return {
    calendar,
    read: () => rendered,
    flush: async () => {
      await flushPromises();
      await nextTick();
    },
    unmount: async () => {
      if (closed) return;
      closed = true;
      wrapper.unmount();
      await calendar.dispose();
    },
  };
}, it);
