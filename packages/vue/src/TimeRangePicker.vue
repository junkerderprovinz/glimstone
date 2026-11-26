<script setup lang="ts">
import { ref, watch } from "vue";
import { formatTime, parseTime, timeRangeValue, type TimePickerText, type TimeSegmentValue } from "@glimstone/core";
import TimeShell from "./TimeShell.vue";

// A span of two times in one field, such as the quiet hours, bound with
// v-model as the start and the end, each "08:00" or null while one of its
// segments is empty. The segments work as in a TimePicker, and the arrows walk
// on from the start into the end. Inside a FieldRow the row names it.
defineProps<{
  label?: string;
  /** How far an arrow moves the minutes. */
  minuteStep?: number;
  disabled?: boolean;
  /** The segments' names, the halves' and the word between them. English where left out. */
  text?: Partial<TimePickerText>;
}>();
const value = defineModel<[string | null, string | null]>({ required: true });

// A time from the app replaces its half, and so does a null that clears a
// whole time, but a half-typed time the app only knows as null stays.
const values = ref<TimeSegmentValue[]>(value.value.flatMap(parseTime));
watch(
  () => value.value.join("|"),
  () => {
    values.value = value.value.flatMap((time, i) => {
      const half = values.value.slice(i * 2, i * 2 + 2);
      return time === null && formatTime(half) === null ? half : parseTime(time);
    });
  },
);

function onValues(next: TimeSegmentValue[]) {
  values.value = next;
  const span = timeRangeValue(next);
  if (span[0] !== value.value[0] || span[1] !== value.value[1]) value.value = span;
}
</script>

<template>
  <TimeShell data-glim="TimeRangePicker" :label="label" :values="values" :minute-step="minuteStep" :disabled="disabled" :text="text" @values="onValues" />
</template>
