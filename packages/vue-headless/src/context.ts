import { defineComponent, getCurrentInstance, inject, provide, onMounted, onUnmounted, type InjectionKey, type PropType, type DefineComponent } from "vue";
import type { CalendarInstance } from "@zaptime/core";
import { createCalendarScope, mountScope, resolveBrowser, type CalendarScope, type CalendarTarget } from "./scope";
const calendarKey: InjectionKey<CalendarInstance> = Symbol("zaptime.calendar");
export const calendarScopeKey: InjectionKey<CalendarScope> = Symbol("zaptime.scope");
const appScopes = new WeakMap<object, CalendarScope>();
export function currentScope() {
  const vm = getCurrentInstance();
  if (!vm) throw new Error("Calendar setup context required");
  const inherited = (vm as unknown as { provides: Record<symbol, CalendarScope> }).provides[calendarScopeKey as symbol] ?? inject(calendarScopeKey, undefined);
  if (inherited) return inherited;
  let scope = appScopes.get(vm.appContext);
  if (!scope) {
    scope = createCalendarScope();
    appScopes.set(vm.appContext, scope);
  }
  return scope;
}
export function resolveCalendar(target?: CalendarTarget) {
  if (target && typeof target !== "string") return target;
  if (getCurrentInstance()) {
    if (typeof target === "string") return currentScope().resolve(target);
    const nearest = inject(calendarKey, undefined);
    return nearest ?? currentScope().resolve();
  }
  return resolveBrowser(target);
}
let sequence = 0;
export function provideCalendar(calendar: CalendarInstance, id?: string): void {
  if (!getCurrentInstance()) throw new Error("provideCalendar requires Vue setup");
  provide(calendarKey, calendar);
  const scope = currentScope();
  provide(calendarScopeKey, scope);
  const registrationId = id ?? `calendar-${++sequence}`;
  const unregister = scope.register(registrationId, calendar);
  let unmountIndex = () => {};
  onMounted(() => {
    unmountIndex = mountScope(scope, registrationId, calendar);
  });
  onUnmounted(() => {
    unregister();
    unmountIndex();
  });
}
export const ZaptimeProvider: DefineComponent<{ calendar: CalendarInstance; calendarId?: string }> = defineComponent({
  name: "ZaptimeProvider",
  props: { calendar: { type: Object as PropType<CalendarInstance>, required: true }, calendarId: String },
  setup(props, { slots }) {
    provideCalendar(props.calendar, props.calendarId);
    return () => slots.default?.();
  },
});
