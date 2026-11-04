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
  className?: string;
}

export function Meter({ value, label, size = "medium", threshold, quiet, valueText, className }: MeterProps) {
  const view = meterView(value, { size, threshold, quiet });
  const tip = useTipBubble(valueText);
  const busy = view.percent === null;
  return (
    <>
      <span
        ref={tip.ref}
        {...tip.handlers}
        role={busy ? "progressbar" : "meter"}
        aria-label={label}
        aria-valuemin={busy ? undefined : 0}
        aria-valuemax={busy ? undefined : 100}
        aria-valuenow={view.percent ?? undefined}
        aria-valuetext={valueText}
        aria-busy={busy || undefined}
        className={className ? `${view.className} ${className}` : view.className}
      >
        <span className="glim-meter-fill" style={view.width ? { width: view.width } : undefined} />
      </span>
      {tip.bubble}
    </>
  );
}
