<script lang="ts" module>
  import type { Snippet } from "svelte";
  import type { TimePickerText, TimeSegmentValue } from "@glimstone/core";

  export interface TimeShellProps {
    "data-glim": string;
    label?: string;
    values: TimeSegmentValue[];
    onValues: (values: TimeSegmentValue[]) => void;
    minuteStep?: number;
    disabled?: boolean;
    text?: Partial<TimePickerText>;
    class?: string;
    children?: Snippet;
  }
</script>

<script lang="ts">
  import { TIME_PICKER_TEXT, segmentText, timeKey } from "@glimstone/core";
  import { useFieldName } from "./fieldName.js";

  // The field TimePicker and TimeRangePicker share: one or two times, each two
  // segments, whose keys come from timePicker.ts in the core.
  let { "data-glim": glim, label, values, onValues, minuteStep = 1, disabled = false, text, class: className, children }: TimeShellProps = $props();

  const fieldName = useFieldName(() => label);
  const words = $derived({ ...TIME_PICKER_TEXT, ...text });
  const range = $derived(values.length > 2);
  const segments: HTMLSpanElement[] = [];
  let typed = "";

  function focus(at: number) {
    typed = "";
    segments[at]?.focus();
  }

  function onKeyDown(at: number, e: KeyboardEvent) {
    if (disabled) return;
    const result = timeKey(values, at, e.key, typed, minuteStep);
    if (!result) return;
    e.preventDefault();
    if (result.values.some((v, i) => v !== values[i])) onValues(result.values);
    if (result.focus !== at) focus(result.focus);
    else typed = result.buffer;
  }

  // A press beside the segments lands on the first empty one, as on a text field's padding.
  function onMouseDown(e: MouseEvent) {
    if (disabled || (e.target as HTMLElement).closest(".glim-time-seg")) return;
    e.preventDefault();
    const empty = values.indexOf(null);
    focus(empty < 0 ? 0 : empty);
  }
</script>

{#snippet segment(at: number)}
  <span
    bind:this={segments[at]}
    role="spinbutton"
    tabindex={disabled ? -1 : 0}
    aria-label={at % 2 === 0 ? words.hour : words.minute}
    aria-valuemin={0}
    aria-valuemax={at % 2 === 0 ? 23 : 59}
    aria-valuenow={values[at] ?? undefined}
    aria-valuetext={values[at] === null ? undefined : segmentText(values[at]!)}
    aria-disabled={disabled || undefined}
    data-empty={values[at] === null ? "" : undefined}
    class="glim-time-seg"
    onkeydown={(e) => onKeyDown(at, e)}
    onfocus={() => (typed = "")}>{segmentText(values[at]!)}</span
  >
{/snippet}

{#snippet time(first: number)}
  {@render segment(first)}<span class="glim-time-colon" aria-hidden="true">:</span>{@render segment(first + 1)}
{/snippet}

<!-- The press on the group only hands the focus to a segment, which takes the keys. -->
<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<div
  data-glim={glim}
  role="group"
  aria-label={fieldName()}
  data-disabled={disabled ? "" : undefined}
  class={["glim-time", className].filter(Boolean).join(" ")}
  onmousedown={onMouseDown}
>
  {#if range}
    {#each [0, 2] as first (first)}
      {#if first > 0}<span class="glim-time-to" aria-hidden="true">{words.to}</span>{/if}
      <span role="group" aria-label={first === 0 ? words.start : words.end} class="glim-time-half">{@render time(first)}</span>
    {/each}
  {:else}
    {@render time(0)}
  {/if}
  {@render children?.()}
</div>
