import { ref, computed } from 'vue';

type View = 'form' | 'calendar' | 'success';
type CalendarView = 'pickingDate' | 'pickingTime';

type CalendarViewState = {
  view: View;
  calendarView: CalendarView;
};

const _calendarView = ref<Record<string, CalendarViewState>>({
  __DEFAULT__: {
    view: 'calendar' as View,
    calendarView: 'pickingDate' as CalendarView,
  },
});

export default function (calendarId?: string) {
  if (calendarId !== undefined && _calendarView.value[calendarId] === undefined) {
    _calendarView.value[calendarId] = {
      view: 'calendar' as View,
      calendarView: 'pickingDate' as CalendarView,
    };
  }

  const view = computed(() => {
    if (calendarId === undefined) {
      return _calendarView.value.__DEFAULT__.view;
    } else {
      return _calendarView.value[calendarId].view;
    }
  });

  const calendarView = computed(() => {
    if (calendarId === undefined) {
      return _calendarView.value.__DEFAULT__.calendarView;
    } else {
      return _calendarView.value[calendarId].calendarView;
    }
  });

  const setView = (view: View) => {
    if (calendarId === undefined) {
      _calendarView.value.__DEFAULT__.view = view;
    } else {
      _calendarView.value[calendarId].view = view;
    }
  };

  const setCalendarView = (___calendarView: CalendarView) => {
    if (calendarId === undefined) {
      _calendarView.value.__DEFAULT__.calendarView = ___calendarView;
    } else {
      if (_calendarView.value[calendarId] === undefined) {
        _calendarView.value[calendarId] = {
          calendarView: ___calendarView,
          view: view.value,
        };
      } else {
        _calendarView.value[calendarId].calendarView = ___calendarView;
      }
    }
  };

  return {
    view,
    calendarView,
    setView,
    setCalendarView,
  };
}
