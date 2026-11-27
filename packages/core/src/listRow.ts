// What a ListRow draws for a status that sets the row apart (design-language.md,
// "Lists"). The normal case passes no status and stays quiet.

import { TOAST_MARKS } from "./marks.ts";

export type ListRowTone = "ok" | "warn" | "fail";

/** A row that differs from the rest: the state's tone and neutral words beside its mark, such as "Failed". */
export interface ListRowStatus {
  tone: ListRowTone;
  label: string;
}

/** The mark a status carries: a dot for settled, the state's glyph for a warning or a failure. */
export function listRowStatus(tone: ListRowTone): { mark: (typeof TOAST_MARKS)[keyof typeof TOAST_MARKS] | undefined } {
  return { mark: tone === "ok" ? undefined : TOAST_MARKS[tone] };
}
