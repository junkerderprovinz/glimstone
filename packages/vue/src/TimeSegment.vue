<script setup lang="ts">
import { segmentText, type TimeSegmentValue } from "@glimstone/core";

// One segment of a time field, the hours at an even place and the minutes at
// an odd one. The field it stands in answers its keys.
defineProps<{ at: number; value: TimeSegmentValue; label: string; disabled: boolean }>();
</script>

<template>
  <span
    role="spinbutton"
    :tabindex="disabled ? -1 : 0"
    :aria-label="label"
    aria-valuemin="0"
    :aria-valuemax="at % 2 === 0 ? 23 : 59"
    :aria-valuenow="value ?? undefined"
    :aria-valuetext="value === null ? undefined : segmentText(value)"
    :aria-disabled="disabled || undefined"
    :data-empty="value === null ? '' : undefined"
    class="glim-time-seg"
  >
    {{ segmentText(value) }}
  </span>
</template>
