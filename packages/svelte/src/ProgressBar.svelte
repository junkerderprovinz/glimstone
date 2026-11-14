<script lang="ts" module>
  export interface ProgressBarProps {
    /** From 0 to 1. Without it the bar runs indeterminate, while the work has no measure yet. */
    value?: number | null;
    /** The accessible name, such as what is being copied. */
    label: string;
    /** The work waits: the fill takes the waiting tone and the sheen stops. */
    paused?: boolean;
    /** The work stopped on an error: the fill takes the fault colour. */
    failed?: boolean;
    /** The progress in words, such as "1.2 GB of 4 GB", read out instead of the percentage. */
    valueText?: string;
    class?: string;
  }
</script>

<script lang="ts">
  import { progressView } from "@glimstone/core";

  // Work that moves toward its end, such as a copy. A sheen runs over the fill
  // while the work does; progressView() in the core says when it stops.
  let { value, label, paused, failed, valueText, class: className }: ProgressBarProps = $props();
  const view = $derived(progressView(value, { paused, failed }));
</script>

<span
  data-glim="ProgressBar"
  role="progressbar"
  aria-label={label}
  aria-valuemin={view.percent === null ? undefined : 0}
  aria-valuemax={view.percent === null ? undefined : 100}
  aria-valuenow={view.percent ?? undefined}
  aria-valuetext={valueText}
  class={className ? `${view.className} ${className}` : view.className}
>
  <span class="glim-progress-fill" style={view.width ? `width: ${view.width}` : undefined}></span>
</span>
