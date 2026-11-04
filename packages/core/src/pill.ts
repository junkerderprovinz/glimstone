// The small data pill of a list row: a size, a date, a state. A Badge says
// something about the row; a pill is one of its values, so it stays quiet and
// takes a state colour only as a wash.

export type PillTone = "neutral" | "state" | "ok" | "warn" | "fail";

/** The class list of a pill. */
export function pillClassName(tone: PillTone = "neutral"): string {
  return tone === "neutral" ? "glim-pill" : `glim-pill glim-pill--${tone}`;
}
