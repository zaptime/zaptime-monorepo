<template>
  <!-- Nuxt: keep ClientOnly. Plain Vue SPA: replace with the inner element. -->
  <ClientOnly>
    <ZaptimeCalendar
      :config="config"
      :calendar-id="calendarId"
      @booking-confirmed="onBookingConfirmed"
      @time-slot-changed="(slot) => emit('slot-changed', slot)"
      @calendar-loaded="emit('loaded')"
    />
    <template #fallback>
      <div class="zaptime-placeholder" aria-busy="true" />
    </template>
  </ClientOnly>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { ZaptimeCalendar } from "@zaptime/vue3";
import type { ZaptimeConfig } from "@zaptime/vue3";
import type { ReservationResponse, TimeSlot } from "@zaptime/core";

const props = withDefaults(
  defineProps<{
    /** Event type token from the Zaptime dashboard. */
    token: string;
    /** Unique per calendar instance when several are mounted at once. */
    calendarId?: string;
    /** date-fns locale code, e.g. "en", "cs", "de". */
    locale?: string;
    /** Set to put the calendar in reschedule mode. */
    reservationUuid?: string;
    /** Overrides merged on top of dashboard configuration. */
    overrides?: Partial<ZaptimeConfig>;
  }>(),
  { calendarId: undefined, locale: undefined, reservationUuid: undefined, overrides: () => ({}) },
);

const emit = defineEmits<{
  (e: "booked", reservation: ReservationResponse): void;
  (e: "slot-changed", slot: TimeSlot | undefined): void;
  (e: "loaded"): void;
}>();

// Computed so runtime changes (locale switch, theme toggle) flow into core.
const config = computed<ZaptimeConfig>(() => ({
  token: props.token,
  ...(props.locale ? { locale: { preset: props.locale } } : {}),
  ...(props.reservationUuid ? { reservationUuid: props.reservationUuid } : {}),
  ...props.overrides,
}));

function onBookingConfirmed(reservation: ReservationResponse) {
  emit("booked", reservation);
}
</script>

<style scoped>
.zaptime-placeholder {
  min-height: 360px;
}
</style>
