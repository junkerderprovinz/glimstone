<script setup lang="ts">
import { ref, watch } from "vue";
import { formatTime, parseTime, type TimePickerText, type TimeSegmentValue } from "@glimstone/core";
import TimeShell from "./TimeShell.vue";

// A time of day in one field of two segments, hours and minutes, bound with
// v-model as "08:30", or null while a segment is empty. Each segment is a spin
// button: the arrows count it round the clock, digits type it and move on once
// it is full, Backspace empties it. A time is data, so the segments run left
// to right in every language. Inside a FieldRow the row names it.
const props = defineProps<{
  label?: string;
  /** How far an arrow moves the minutes. */
  minuteStep?: number;
  /** The name the time is sent under in a form. */
  name?: string;
  disabled?: boolean;
  /** The segments' names. English where left out. */
  text?: Partial<TimePickerText>;
}>();
const value = defineModel<string | null>({ required: true });

// A time from the app replaces the segments, and so does a null that clears a
// whole time, but a half-typed time the app only knows as null stays.
const values = ref<TimeSegmentValue[]>(parseTime(value.value));
watch(value, (time) => {
  if (time !== null || formatTime(values.value) !== null) values.value = parseTime(time);
});

function onValues(next: TimeSegmentValue[]) {
  values.value = next;
  const time = formatTime(next);
  if (time !== value.value) value.value = time;
}
</script>

<template>
  <TimeShell data-glim="TimePicker" :label="label" :values="values" :minute-step="minuteStep" :disabled="disabled" :text="text" @values="onValues">
    <input v-if="props.name" type="hidden" :name="props.name" :value="formatTime(values) ?? ''" />
  </TimeShell>
</template>
