import type { ReactNode } from "react";
import { pillClassName, type PillTone } from "@glimstone/core";

export type { PillTone } from "@glimstone/core";

// One value of a list row, such as a size, a date or a state; pillClassName()
// in the core says why it is not a Badge.

export interface PillProps {
  children: ReactNode;
  /** `state` lifts a word that says what the row is doing; the other three
   *  wash the pill in their state colour. */
  tone?: PillTone;
  /** Extra classes, such as `glim-num` for figures that line up in a column. */
  className?: string;
}

export function Pill({ children, tone = "neutral", className }: PillProps) {
  return <span className={className ? `${pillClassName(tone)} ${className}` : pillClassName(tone)}>{children}</span>;
}
