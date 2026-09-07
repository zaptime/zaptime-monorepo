<!--
  Wiring skeleton for a headless Zaptime calendar. Deliberately unstyled:
  replace each element with the integrator's own primitives and classes,
  keep the bindings. Render client-side only (onMounted / <ClientOnly>).
-->
<template>
  <div>
    <p v-if="status === 'loading' || status === 'idle'">Loading…</p>
    <p v-else-if="status === 'disabled'">This event type is not accepting bookings.</p>
    <p v-else-if="status === 'error'">Calendar could not be loaded.</p>

    <template v-else>
      <!-- 1. Month grid -->
      <section v-if="view === 'calendar'">
        <header>
          <button type="button" :disabled="prevDisabled" @click="prev">‹</button>
          <span>{{ monthName }} {{ currentYear }}</span>
          <button type="button" :disabled="nextDisabled" @click="next">›</button>
        </header>

        <div v-if="state.loading">Loading days…</div>
        <div v-else>
          <div v-if="!state.monthHasTimeSlots">
            <p>{{ config.locale?.texts?.noTimeSlotAvailable }}</p>
            <button type="button" @click="next">{{ config.locale?.texts?.showNextMonth }}</button>
          </div>

          <div role="grid">
            <span v-for="h in state.headers" :key="h" role="columnheader">{{ h }}</span>
            <button
              v-for="(day, i) in state.days"
              :key="i"
              type="button"
              role="gridcell"
              :disabled="!day.date || day.isPast || !dayHasTimeSlot(day)"
              :aria-selected="isSelectedDay(day)"
              :data-today="day.isToday || undefined"
              @click="dayClicked(day)"
            >
              {{ day.label }}
            </button>
          </div>
        </div>

        <!-- 2. Time slots for the selected day -->
        <aside v-if="state.timeSlots.length">
          <h3>{{ getFormattedDayInMonth(state.timeSlots[0].start) }}</h3>
          <p>{{ config.locale?.texts?.choosePreferredTime }}</p>
          <button
            v-for="slot in state.timeSlots"
            :key="slot.start"
            type="button"
            :aria-pressed="isSelected(slot)"
            @click="pickSlot(slot)"
          >
            {{ getFormattedTime(slot.start) }} – {{ getFormattedTime(slot.end) }}
            <small v-if="slot.seats > 1">{{ slot.seats }} seats</small>
          </button>
        </aside>
        <p v-else-if="state.monthHasTimeSlots">{{ config.locale?.texts?.chooseDate }}</p>

        <!-- Optional preferences -->
        <label>
          Timezone
          <select :value="timezone" @change="onTimezoneChange">
            <option v-for="tz in timezones" :key="tz" :value="tz">{{ tz }}</option>
          </select>
        </label>
        <label>
          <input type="checkbox" :checked="hourCycle === 'h23'" @change="setHourCycle(hourCycle === 'h23' ? 'h11' : 'h23')" />
          24h
        </label>
      </section>

      <!-- 3. Booking form / reschedule confirmation -->
      <form v-else-if="view === 'form' && selectedTimeSlot" @submit.prevent="submit">
        <template v-if="reservation">
          <h2>{{ config.locale?.confirmationForm?.reschedulingEvent }}</h2>
          <p><s>{{ getFormattedDayInMonth(reservation.start) }} {{ getFormattedTime(reservation.start) }}</s></p>
        </template>
        <h2 v-else>{{ config.locale?.confirmationForm?.confirmBooking }}</h2>
        <p>
          {{ getFormattedDayInMonth(selectedTimeSlot.start) }},
          {{ getFormattedTime(selectedTimeSlot.start) }} – {{ getFormattedTime(selectedTimeSlot.end) }}
        </p>

        <template v-if="!reservation">
          <!-- Map each field.type to the integrator's primitive. -->
          <div v-for="field in bookingForm" :key="field.uuid">
            <label :for="field.uuid">{{ field.label }}</label>

            <textarea
              v-if="field.type === 'textarea'"
              :id="field.uuid" :required="field.required" :placeholder="field.placeholder"
              @input="setCustomFieldValue(field.uuid, ($event.target as HTMLTextAreaElement).value)"
            />
            <select
              v-else-if="field.type === 'select'"
              :id="field.uuid" :required="field.required"
              @change="setCustomFieldValue(field.uuid, ($event.target as HTMLSelectElement).value)"
            >
              <option value="" disabled selected>{{ field.placeholder }}</option>
              <option v-for="o in field.options" :key="o" :value="o">{{ o }}</option>
            </select>
            <select
              v-else-if="field.type === 'multiselect'"
              :id="field.uuid" :required="field.required" multiple
              @change="setCustomFieldValue(field.uuid, Array.from(($event.target as HTMLSelectElement).selectedOptions, (o) => o.value))"
            >
              <option v-for="o in field.options" :key="o" :value="o">{{ o }}</option>
            </select>
            <fieldset v-else-if="field.type === 'radio'">
              <label v-for="o in field.options" :key="o">
                <input type="radio" :name="field.uuid" :value="o" :required="field.required" @change="setCustomFieldValue(field.uuid, o)" />
                {{ o }}
              </label>
            </fieldset>
            <input
              v-else-if="field.type === 'checkbox' || field.type === 'switch'"
              :id="field.uuid" type="checkbox" :required="field.required"
              @change="setCustomFieldValue(field.uuid, ($event.target as HTMLInputElement).checked)"
            />
            <input
              v-else
              :id="field.uuid"
              :type="field.type === 'phone' ? 'tel' : field.type"
              :required="field.required || field.mergeTag === 'EMAIL'"
              :placeholder="field.placeholder"
              @input="setCustomFieldValue(field.uuid, field.type === 'number' ? Number(($event.target as HTMLInputElement).value) : ($event.target as HTMLInputElement).value)"
            />
          </div>

          <div v-if="guestsEnabled">
            <div v-for="(guest, i) in guests" :key="i">
              <input type="email" :value="guest" placeholder="guest@example.com" @input="updateGuest(i, ($event.target as HTMLInputElement).value)" />
              <button type="button" @click="removeGuest(i)">×</button>
            </div>
            <button v-if="canAddGuest" type="button" @click="addGuest()">
              {{ config.locale?.confirmationForm?.addGuests }}
            </button>
          </div>
        </template>

        <p v-if="submitError" role="alert">{{ submitError }}</p>

        <button type="button" :disabled="submitting" @click="view = 'calendar'">
          {{ config.locale?.confirmationForm?.buttons?.goBack }}
        </button>
        <button type="submit" :disabled="submitting">
          {{ reservation ? config.locale?.confirmationForm?.buttons?.reschedule : config.locale?.confirmationForm?.buttons?.confirmBooking }}
        </button>
      </form>

      <!-- 4. Success -->
      <section v-else-if="view === 'success'">
        <h2>Booked</h2>
        <p v-if="selectedTimeSlot">
          {{ getFormattedDayInMonth(selectedTimeSlot.start) }},
          {{ getFormattedTime(selectedTimeSlot.start) }}
        </p>
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import {
  book,
  reschedule,
  stopReservationRefresh,
  useBookingForm,
  useCalendar,
  useConfig,
  useCurrentTimezone,
  useDateFormatters,
  useGuests,
  useHourCycle,
  useLocations,
  useReservationReschedule,
  useSelectedTimeSlot,
  SlotNoLongerAvailableError,
  RescheduleNotAllowedError,
  slotNoLongerAvailableText,
  rescheduleNotAllowedText,
  type ReservationResponse,
  type TimeSlot,
  type ZaptimeConfig,
} from "@zaptime/core";
import { useZaptimeInit } from "./useZaptimeInit";

const props = defineProps<{ config: ZaptimeConfig; calendarId?: string }>();
const emit = defineEmits<{
  (e: "booked", reservation: ReservationResponse): void;
  (e: "slot-changed", slot: TimeSlot | undefined): void;
}>();

const { status, init } = useZaptimeInit(props.config, props.calendarId);
const { config } = useConfig(props.calendarId);
const {
  state, prev, next, prevDisabled, nextDisabled, monthName, currentYear,
  dayClicked, dayHasTimeSlot, isSelectedDay, selectTimeSlot, isSelected, getDays,
} = useCalendar(props.calendarId);
const { selectedTimeSlot, setSelectedTimeSlot } = useSelectedTimeSlot(props.calendarId);
const { bookingForm, setCustomFieldValue, collectFormValues } = useBookingForm(props.calendarId);
const { guests, guestsEnabled, canAddGuest, addGuest, removeGuest, updateGuest } = useGuests(props.calendarId);
const { locations } = useLocations(props.calendarId);
const { reservation } = useReservationReschedule(props.calendarId);
const { getFormattedTime, getFormattedDayInMonth } = useDateFormatters();
const { timezone, setTimezone } = useCurrentTimezone();
const { hourCycle, setHourCycle } = useHourCycle();

const view = ref<"calendar" | "form" | "success">("calendar");
const submitting = ref(false);
const submitError = ref<string | null>(null);
const timezones = ref<string[]>([]);

function pickSlot(slot: TimeSlot) {
  selectTimeSlot(slot);
  emit("slot-changed", slot);
  view.value = "form";
}

async function onTimezoneChange(e: Event) {
  setTimezone((e.target as HTMLSelectElement).value);
  await getDays(); // slots may move across days
}

async function submit() {
  submitting.value = true;
  submitError.value = null;
  try {
    const res = reservation.value
      ? await reschedule(props.calendarId)
      : await book({
          calendarId: props.calendarId,
          location: locations.value[0],
          ...collectFormValues(),
        });

    if (!res.success) throw new Error("validation");

    emit("booked", res);
    if (!config.value.redirectAfterBookingUrl) view.value = "success";
  } catch (err) {
    if (err instanceof SlotNoLongerAvailableError) {
      submitError.value = slotNoLongerAvailableText(config.value.locale);
      getDays().catch(() => {});
    } else if (err instanceof RescheduleNotAllowedError) {
      submitError.value = rescheduleNotAllowedText(config.value.locale);
    } else {
      submitError.value = "Booking failed. Please try again.";
    }
  } finally {
    submitting.value = false;
  }
}

onMounted(async () => {
  await init();
  try {
    const base = config.value.apiBaseUrl || "https://api.zaptime.app/";
    const json = await fetch(base + "timezones").then((r) => r.json());
    timezones.value = json.data;
  } catch {
    timezones.value = [timezone.value];
  }
});

onUnmounted(() => {
  stopReservationRefresh();
  setSelectedTimeSlot(undefined);
});
</script>
