<script lang="ts" module>
  import type { TimePickerText } from "@glimstone/core";

  export interface TimeRangePickerProps {
    label?: string;
    /** The start and the end as "08:00", each null while one of its segments is empty, bound with `bind:value`. */
    value: [string | null, string | null];
    onChange?: (value: [string | null, string | null]) => void;
    /** How far an arrow moves the minutes. */
    minuteStep?: number;
    disabled?: boolean;
    /** The segments' names, the halves' and the word between them. English where left out. */
    text?: Partial<TimePickerText>;
    class?: string;
  }
</script>

<script lang="ts">
  import { untrack } from "svelte";
  import { formatTime, parseTime, timeRangeValue, type TimeSegmentValue } from "@glimstone/core";
  import TimeShell from "./TimeShell.svelte";

  // A span of two times in one field, such as the quiet hours. The segments
  // work as in a TimePicker, and the arrows walk on from the start into the
  // end. Inside a FieldRow the row names it.
  let { label, value = $bindable(), onChange, minuteStep, disabled, text, class: className }: TimeRangePickerProps = $props();

  let values = $state<TimeSegmentValue[]>(untrack(() => value.flatMap(parseTime)));

  // A time from the app replaces its half, and so does a null that clears a
  // whole time, but a half-typed time the app only knows as null stays.
  $effect.pre(() => {
    const times = [...value];
    untrack(() => {
      values = times.flatMap((time, i) => {
        const half = values.slice(i * 2, i * 2 + 2);
        return time === null && formatTime(half) === null ? half : parseTime(time);
      });
    });
  });

  function onValues(next: TimeSegmentValue[]) {
    values = next;
    const span = timeRangeValue(next);
    if (span[0] !== value[0] || span[1] !== value[1]) {
      value = span;
      onChange?.(span);
    }
  }
</script>

<TimeShell data-glim="TimeRangePicker" {label} {values} {onValues} {minuteStep} {disabled} {text} class={className} />
