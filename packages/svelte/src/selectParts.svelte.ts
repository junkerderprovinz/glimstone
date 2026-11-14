// What the Svelte selects share: the Svelte names of the core's list model,
// the props the two machines take, and the trigger's wheel and shake.

import { untrack, type Snippet } from "svelte";
import {
  enableWheelStep,
  shake,
  wheelValue,
  type SelectChoice,
  type SelectEntry as Entry,
  type SelectRows,
  type SelectRun,
  type SelectSubmenu as Submenu,
  type SelectWidth,
} from "@glimstone/core";

export type SelectOption<T extends string = string> = SelectChoice<T, Snippet>;
export type SelectSubmenu<T extends string = string> = Submenu<T, Snippet>;
export type SelectEntry<T extends string = string> = Entry<T, Snippet>;
export type SelectGroup<T extends string = string> = SelectRun<T, Snippet>;

/** What ListSelect and MenuSelect take: the runs resolved and the trigger's whole class list. */
export interface InnerProps<T extends string> {
  /** The name Select gives its root. */
  "data-glim": string;
  label: string;
  hideLabel: boolean;
  groups: SelectGroup<T>[];
  value: T | null;
  onChange: (value: T) => void;
  placeholder?: string;
  width: SelectWidth;
  rows: SelectRows;
  triggerClass: string;
  id?: string;
  triggerAttrs?: Record<string, string>;
  listId?: string;
  ref?: HTMLButtonElement | null;
  disabled?: boolean;
  busy?: boolean;
  tip?: string;
  shake?: number;
}

/**
 * The wheel steps through every option in list order while the closed trigger
 * has focus, and each bump of `count` shakes it once.
 */
export function useTriggerMotion<T extends string>(
  trigger: () => HTMLElement | null | undefined,
  o: {
    all: () => SelectOption<T>[];
    value: () => T | null;
    inert: () => boolean;
    onChange: (value: T) => void;
    count: () => number;
  },
) {
  $effect(() => {
    const el = trigger();
    if (!el) return;
    return enableWheelStep(el, (delta) => {
      if (o.inert()) return;
      const next = wheelValue(o.all(), o.value(), delta);
      if (next !== undefined) o.onChange(next);
    });
  });
  $effect(() => {
    const n = o.count();
    const el = untrack(trigger);
    if (el && n > 0) return shake(el);
  });
}
