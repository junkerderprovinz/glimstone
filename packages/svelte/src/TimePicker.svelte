<script lang="ts" module>
  import type { TimePickerText } from "@glimstone/core";

  export type { TimePickerText } from "@glimstone/core";

  export interface TimePickerProps {
    label?: string;
    /** The time as "08:30", or null while a segment is empty, bound with `bind:value`. */
    value: string | null;
    onChange?: (value: string | null) => void;
    /** How far an arrow moves the minutes. */
    minuteStep?: number;
    /** The name the time is sent under in a form. */
    name?: string;
    disabled?: boolean;
    /** The segments' names. English where left out. */
    text?: Partial<TimePickerText>;
    class?: string;
  }
</script>

<script lang="ts">
  import { untrack } from "svelte";
  import { formatTime, parseTime, type TimeSegmentValue } from "@glimstone/core";
  import TimeShell from "./TimeShell.svelte";

  // A time of day in one field of two segments, hours and minutes. Each
  // segment is a spin button: the arrows count it round the clock, digits type
  // it and move on once it is full, Backspace empties it. A time is data, so
  // the segments run left to right in every language. Inside a FieldRow the
  // row names it.
  let { label, value = $bindable(), onChange, minuteStep, name, disabled, text, class: className }: TimePickerProps = $props();

  let values = $state<TimeSegmentValue[]>(untrack(() => parseTime(value)));

  // A time from the app replaces the segments, and so does a null that clears
  // a whole time, but a half-typed time the app only knows as null stays.
  $effect.pre(() => {
    const time = value;
    untrack(() => {
      if (time !== null || formatTime(values) !== null) values = parseTime(time);
    });
  });

  function onValues(next: TimeSegmentValue[]) {
    values = next;
    const time = formatTime(next);
    if (time !== value) {
      value = time;
      onChange?.(time);
    }
  }
</script>

<TimeShell data-glim="TimePicker" {label} {values} {onValues} {minuteStep} {disabled} {text} class={className}>
  {#if name}<input type="hidden" {name} value={formatTime(values) ?? ""} />{/if}
</TimeShell>
