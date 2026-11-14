import { mergeProps } from "solid-js";
import { meterView, type MeterSize } from "@glimstone/core";
import { useTipBubble } from "./useTipBubble.tsx";

export type { MeterSize } from "@glimstone/core";

// A level that stands, such as how full a disk is. meterView() in the core
// decides when it turns red and how it runs without a value.

export interface MeterProps {
  /** From 0 to 1. Without it the meter shows stripes while the level is still being read. */
  value?: number | null;
  /** The accessible name, such as the disk's. */
  label: string;
  /** `small` sits beside a row's name, `medium` is as wide as its column. */
  size?: MeterSize;
  /** From here on the fill is the fault colour. */
  threshold?: number;
  /** Slim and grey, for a footer line or a dense list. Inside a button it takes the accent when the button is reached. */
  quiet?: boolean;
  /** The level in words, such as "120 GB free of 4 TB": read out, and shown in the bubble. */
  valueText?: string;
  class?: string;
}

export function Meter(props: MeterProps) {
  const merged = mergeProps({ size: "medium", threshold: 0.9 } as const, props);
  const view = () => meterView(merged.value, { size: merged.size, threshold: merged.threshold, quiet: merged.quiet });
  const tip = useTipBubble(() => merged.valueText);
  const busy = () => view().percent === null;
  return (
    <>
      <span
        data-glim="Meter"
        ref={tip.ref}
        {...tip.handlers}
        role={busy() ? "progressbar" : "meter"}
        aria-label={merged.label}
        aria-valuemin={busy() ? undefined : 0}
        aria-valuemax={busy() ? undefined : 100}
        aria-valuenow={view().percent ?? undefined}
        aria-valuetext={merged.valueText}
        aria-busy={busy() || undefined}
        class={merged.class ? `${view().className} ${merged.class}` : view().className}
      >
        <span class="glim-meter-fill" style={view().width ? { width: view().width! } : undefined} />
      </span>
      {tip.bubble}
    </>
  );
}
