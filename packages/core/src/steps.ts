// The parts of Steps that Zag's steps machine leaves to the page: the words,
// and the keys of its row. The machine draws the row as tabs but gives them no
// arrow keys, so the row takes the tabs pattern's own.

export interface StepsItem {
  /** The step's name in the row and the accessible name of its tab. */
  title: string;
}

export interface StepsText {
  back: string;
  next: string;
  /** The forward button on the last step, which hands the whole over. */
  finish: string;
}

export const STEPS_TEXT: StepsText = {
  back: "Back",
  next: "Next",
  finish: "Finish",
};

/**
 * The step a key moves the focus to in the row, or null for a key the row
 * does not take. The arrows wrap round and follow the reading direction.
 */
export function stepsKeyTarget(key: string, index: number, count: number, dir: "ltr" | "rtl"): number | null {
  const forward = dir === "rtl" ? "ArrowLeft" : "ArrowRight";
  const backward = dir === "rtl" ? "ArrowRight" : "ArrowLeft";
  if (key === forward) return (index + 1) % count;
  if (key === backward) return (index - 1 + count) % count;
  if (key === "Home") return 0;
  if (key === "End") return count - 1;
  return null;
}
