import { mergeProps, type JSX } from "solid-js";
import { pillClassName, type PillTone } from "@glimstone/core";

export type { PillTone } from "@glimstone/core";

// One value of a list row, such as a size, a date or a state; pillClassName()
// in the core says why it is not a Badge.

export interface PillProps {
  children: JSX.Element;
  /** `state` lifts a word that says what the row is doing; the other three
   *  wash the pill in their state colour. */
  tone?: PillTone;
  /** Extra classes, such as `glim-num` for figures that line up in a column. */
  class?: string;
}

export function Pill(props: PillProps) {
  const merged = mergeProps({ tone: "neutral" } as const, props);
  return (
    <span data-glim="Pill" class={merged.class ? `${pillClassName(merged.tone)} ${merged.class}` : pillClassName(merged.tone)}>
      {merged.children}
    </span>
  );
}
