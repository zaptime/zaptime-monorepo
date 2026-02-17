import { computed } from "vue";
import {
  type CalendarView,
  type View,
  useVue3CalendarScope,
} from "./useVue3CalendarScope";

export default function () {
  const scope = useVue3CalendarScope();

  const view = computed(() => {
    return scope.view.value;
  });

  const calendarView = computed(() => {
    return scope.calendarView.value;
  });

  const setView = (value: View) => {
    scope.view.value = value;
  };

  const setCalendarView = (value: CalendarView) => {
    scope.calendarView.value = value;
  };

  return {
    view,
    calendarView,
    setView,
    setCalendarView,
  };
}
