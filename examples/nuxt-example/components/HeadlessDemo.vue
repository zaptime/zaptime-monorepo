<script setup lang="ts">
import { onUnmounted, ref, shallowRef } from "vue";
import { useCalendarInstance, useCalendar, useSelectedTimeSlot, ZaptimeProvider } from "@zaptime/vue-headless";
const props = defineProps<{ name: string; shared?: boolean }>();
const calendar = useCalendarInstance({ config: { token: "fixture-token", apiBaseUrl: "https://booking.example.test/", locale: { preset: "en" } } });
const { state, next, prev, monthName, currentYear, dayClicked, selectTimeSlot } = useCalendar(calendar);
const { selectedTimeSlot } = useSelectedTimeSlot(calendar);
const snapshot = shallowRef(calendar.getSnapshot());
onUnmounted(
  calendar.subscribe(() => {
    snapshot.value = calendar.getSnapshot();
  }),
);
const shown = ref(true);
const submit = () => {
  void calendar.actions.submit().catch(() => {});
};
</script>
<template>
  <section :data-testid="props.name" class="demo-card">
    <h2>Custom calendar</h2>
    <button @click="shown = !shown">{{ shown ? "Hide fields" : "Show fields" }}</button>
    <p v-if="!state.initLoaded" role="status">Loading calendar</p>
    <template v-else>
      <h3>{{ monthName }} {{ currentYear }}</h3>
      <button @click="prev">Previous month</button><button @click="next">Next month</button>
      <p v-if="state.loading" role="status">Loading availability</p>
      <div v-else>
        <button v-for="day in state.days.filter((day) => day.timeSlots?.length)" :key="day.label" @click="dayClicked(day)">Day {{ day.label }}</button>
      </div>
      <button v-for="slot in state.timeSlots" :key="slot.start" @click="selectTimeSlot(slot)">{{ calendar.formatters.getFormattedTime(slot.start) }}</button>
      <p data-testid="selection">{{ selectedTimeSlot?.start ?? "Select a time" }}</p>
      <ZaptimeProvider :calendar="calendar"
        ><HeadlessFields v-if="shown" />
        <div v-if="shared" data-testid="shared-fields"><HeadlessFields /></div
      ></ZaptimeProvider>
      <button :disabled="!selectedTimeSlot || snapshot.phase === 'submitting'" @click="submit">Confirm booking</button>
      <button @click="calendar.actions.setConfig({ token: 'another-fixture-token' })">Change event</button>
      <p role="status" data-testid="phase">{{ snapshot.phase }}</p>
      <p v-if="snapshot.error" role="alert">{{ snapshot.error.message }}</p>
    </template>
  </section>
</template>
<style scoped>
.demo-card {
  padding: 24px;
  background: white;
  border: 1px solid #ccc;
  border-radius: 12px;
}
.demo-card :deep(label) {
  display: block;
  margin-top: 12px;
}
.demo-card :deep(input) {
  display: block;
  border: 1px solid #777;
  padding: 8px;
}
.demo-card button {
  margin: 4px;
  padding: 8px;
  border: 1px solid #777;
}
</style>
