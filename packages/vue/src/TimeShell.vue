<script setup lang="ts">
import { computed, ref } from "vue";
import { TIME_PICKER_TEXT, timeKey, type TimePickerText, type TimeSegmentValue } from "@glimstone/core";
import { useFieldName } from "./fieldName";
import TimeSegment from "./TimeSegment.vue";

// The field TimePicker and TimeRangePicker share: one or two times, each two
// segments, whose keys come from timePicker.ts in the core.
const props = defineProps<{
  label?: string;
  values: TimeSegmentValue[];
  minuteStep?: number;
  disabled?: boolean;
  text?: Partial<TimePickerText>;
}>();
const emit = defineEmits<{ values: [values: TimeSegmentValue[]] }>();

const fieldName = useFieldName(() => props.label);
const words = computed(() => ({ ...TIME_PICKER_TEXT, ...props.text }));
const range = computed(() => props.values.length > 2);
const root = ref<HTMLDivElement | null>(null);
let typed = "";

function focus(at: number) {
  typed = "";
  root.value?.querySelectorAll<HTMLElement>(".glim-time-seg")[at]?.focus();
}

function onKeyDown(at: number, e: KeyboardEvent) {
  if (props.disabled) return;
  const result = timeKey(props.values, at, e.key, typed, props.minuteStep ?? 1);
  if (!result) return;
  e.preventDefault();
  if (result.values.some((v, i) => v !== props.values[i])) emit("values", result.values);
  if (result.focus !== at) focus(result.focus);
  else typed = result.buffer;
}

// A press beside the segments lands on the first empty one, as on a text field's padding.
function onMouseDown(e: MouseEvent) {
  if (props.disabled || (e.target as HTMLElement).closest(".glim-time-seg")) return;
  e.preventDefault();
  const empty = props.values.indexOf(null);
  focus(empty < 0 ? 0 : empty);
}

const segment = (at: number) => ({
  at,
  value: props.values[at] ?? null,
  label: at % 2 === 0 ? words.value.hour : words.value.minute,
  disabled: props.disabled,
  onKeydown: (e: KeyboardEvent) => onKeyDown(at, e),
  onFocus: () => (typed = ""),
});
</script>

<template>
  <div
    ref="root"
    role="group"
    :aria-label="fieldName"
    :data-disabled="disabled ? '' : undefined"
    class="glim-time"
    @mousedown="onMouseDown"
  >
    <template v-if="range">
      <template v-for="first in [0, 2]" :key="first">
        <span v-if="first > 0" class="glim-time-to" aria-hidden="true">{{ words.to }}</span>
        <span role="group" :aria-label="first === 0 ? words.start : words.end" class="glim-time-half">
          <TimeSegment v-bind="segment(first)" />
          <span class="glim-time-colon" aria-hidden="true">:</span>
          <TimeSegment v-bind="segment(first + 1)" />
        </span>
      </template>
    </template>
    <template v-else>
      <TimeSegment v-bind="segment(0)" />
      <span class="glim-time-colon" aria-hidden="true">:</span>
      <TimeSegment v-bind="segment(1)" />
    </template>
    <slot />
  </div>
</template>
