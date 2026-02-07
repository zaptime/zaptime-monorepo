import { inject, provide, ref, type InjectionKey, type Ref } from "vue";

type View = "form" | "calendar" | "success";
type CalendarView = "pickingDate" | "pickingTime";

export type Vue3CalendarScope = {
  calendarView: Ref<CalendarView>;
  view: Ref<View>;
  isSubscribed: Ref<boolean>;
};

export const vue3CalendarScopeKey: InjectionKey<Vue3CalendarScope> = Symbol(
  "zaptime-vue3-calendar-scope",
);

export const createVue3CalendarScope = (): Vue3CalendarScope => {
  return {
    view: ref("calendar"),
    calendarView: ref("pickingDate"),
    isSubscribed: ref(true),
  };
};

export const provideVue3CalendarScope = (
  scope?: Vue3CalendarScope,
): Vue3CalendarScope => {
  const providedScope = scope ?? createVue3CalendarScope();
  provide(vue3CalendarScopeKey, providedScope);
  return providedScope;
};

export const useVue3CalendarScope = (): Vue3CalendarScope => {
  const scope = inject(vue3CalendarScopeKey, null);

  if (scope === null) {
    throw new Error(
      "Zaptime error: Missing vue3 calendar scope provider. Ensure provideVue3CalendarScope() is called in App.vue.",
    );
  }

  return scope;
};

export type { View, CalendarView };
