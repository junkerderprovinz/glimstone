// What a Meter and a ProgressBar show for a value. A meter is a level that
// stands, such as how full a disk is; a progress bar is work that moves toward
// its end. Both take a value from 0 to 1, and without one they run
// indeterminate: the level is still being read, or the work has no measure yet.

export type MeterSize = "small" | "medium";

export interface BarView {
  /** The track's class list. */
  className: string;
  /** The fill's width as a CSS percentage, or null while indeterminate. */
  width: string | null;
  /** The value in whole percent for aria-valuenow, or null while indeterminate. */
  percent: number | null;
}

function measure(value: number | null | undefined): { v: number | null; width: string | null; percent: number | null } {
  if (value == null || Number.isNaN(value)) return { v: null, width: null, percent: null };
  const v = Math.min(1, Math.max(0, value));
  return { v, width: `${Math.round(v * 1000) / 10}%`, percent: Math.round(v * 100) };
}

/**
 * A meter's look. At or past `threshold` the fill turns to the fault colour,
 * since a disk that is nearly full is a problem to see from across the room.
 */
export function meterView(value: number | null | undefined, size: MeterSize = "medium", threshold = 0.9): BarView {
  const { v, width, percent } = measure(value);
  const classes = ["glim-meter", "glim-meter-track", `glim-meter-track--${size}`];
  if (v === null) classes.push("glim-meter-track--busy");
  else if (v >= threshold) classes.push("glim-meter-track--full");
  return { className: classes.join(" "), width, percent };
}

/**
 * A progress bar's look. The sheen runs only while the work does: it stops
 * when the bar is paused, finished or failed, since a light still travelling a
 * finished bar contradicts the number beside it.
 */
export function progressView(value: number | null | undefined, state: { paused?: boolean; failed?: boolean } = {}): BarView {
  const { v, width, percent } = measure(value);
  const classes = ["glim-meter", "glim-progress"];
  if (v === null) classes.push("glim-progress--busy");
  if (state.failed) classes.push("glim-progress--failed");
  else if (state.paused) classes.push("glim-progress--paused");
  else if (v === 1) classes.push("glim-progress--done");
  return { className: classes.join(" "), width, percent };
}
