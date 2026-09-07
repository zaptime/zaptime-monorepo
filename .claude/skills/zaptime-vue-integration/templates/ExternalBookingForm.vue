<template>
  <div>
    <ZaptimeCalendar
      :config="config"
      :calendar-id="calendarId"
      @time-slot-changed="(s) => (slot = s)"
    />

    <!-- Host-owned form. Replace the inputs with the app's own primitives. -->
    <form v-if="slot" @submit.prevent="submit">
      <p>{{ slot.start }} – {{ slot.end }}</p>
      <input v-model="form.firstName" placeholder="First name" />
      <input v-model="form.lastName" placeholder="Last name" />
      <input v-model="form.email" type="email" required placeholder="Email" />
      <input v-model="form.phone" type="tel" placeholder="Phone" />
      <p v-if="error" role="alert">{{ error }}</p>
      <button type="submit" :disabled="submitting">Book</button>
    </form>

    <p v-if="booked">Booked. Confirmation sent to {{ booked.data.userEmail }}.</p>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue";
import { ZaptimeCalendar, book } from "@zaptime/vue3";
import type { ZaptimeConfig } from "@zaptime/vue3";
import { SlotNoLongerAvailableError, slotNoLongerAvailableText, useCalendar } from "@zaptime/core";
import type { ReservationResponse, TimeSlot } from "@zaptime/core";

const props = defineProps<{ token: string; calendarId?: string }>();

const config: ZaptimeConfig = {
  token: props.token,
  externalBooking: true, // slot pick no longer opens Zaptime's form
};

const slot = ref<TimeSlot | undefined>();
const form = reactive({ firstName: "", lastName: "", email: "", phone: "" });
const submitting = ref(false);
const error = ref<string | undefined>();
const booked = ref<ReservationResponse | undefined>();

const { getDays } = useCalendar(props.calendarId);

async function submit() {
  if (!slot.value) return;
  submitting.value = true;
  error.value = undefined;
  try {
    const res = await book({
      ...form,
      calendarId: props.calendarId,
      // location: locations.value[0] — from useLocations(calendarId) if the event type has several
      // customFields: [{ uuid: "<field uuid from dashboard>", value: "..." }],
    });
    if (res.success) {
      booked.value = res;
      slot.value = undefined;
    } else {
      error.value = "Please check the entered details.";
    }
  } catch (e) {
    if (e instanceof SlotNoLongerAvailableError) {
      error.value = slotNoLongerAvailableText(config.locale);
      slot.value = undefined;
      await getDays(); // refresh availability
    } else {
      error.value = "Booking failed. Please try again.";
    }
  } finally {
    submitting.value = false;
  }
}
</script>
