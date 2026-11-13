// What the Vue selects share: the Vue names of the core's list model, the
// rainbow position copied onto a portalled list, and the trigger's wheel and
// shake.

import { computed, onScopeDispose, shallowRef, watch, type Component, type ComputedRef, type Ref } from "vue";
import {
  enableWheelStep,
  readPortalHue,
  shake,
  wheelValue,
  type SelectChoice,
  type SelectEntry as Entry,
  type SelectRun,
  type SelectSubmenu as Submenu,
} from "@glimstone/core";

export type SelectOption<T extends string = string> = SelectChoice<T, Component>;
export type SelectSubmenu<T extends string = string> = Submenu<T, Component>;
export type SelectEntry<T extends string = string> = Entry<T, Component>;
export type SelectGroup<T extends string = string> = SelectRun<T, Component>;

/** What a portalled panel needs to stand in its trigger's palette position. */
export interface PortalHue {
  /** Inline custom properties to bind to the portalled element. */
  style: ComputedRef<Record<string, string> | undefined>;
  /** `"glim-hue"` when there is a hue to apply, otherwise `""`. */
  className: ComputedRef<string>;
}

/**
 * The trigger's rainbow position, for a list portalled out of the card that
 * sets it. `.glim-hue` travels with the properties, never alone.
 */
export function usePortalHue(open: () => boolean, trigger: Ref<HTMLElement | null>): PortalHue {
  const hue = shallowRef<Record<string, string> | null>(null);
  watch(open, (on) => (hue.value = on && trigger.value ? readPortalHue(trigger.value) : null), { flush: "sync" });
  return {
    style: computed(() => hue.value ?? undefined),
    className: computed(() => (hue.value ? "glim-hue" : "")),
  };
}

/**
 * The wheel steps through every option in list order while the closed trigger
 * has focus (rule 14), and each bump of `count` shakes it once.
 */
export function useTriggerMotion<T extends string>(
  trigger: Ref<HTMLElement | null>,
  o: {
    all: () => SelectOption<T>[];
    value: () => T | null;
    inert: () => boolean;
    onChange: (value: T) => void;
    shakeCount: () => number;
  },
) {
  let stopWheel: (() => void) | undefined;
  watch(
    trigger,
    (el) => {
      stopWheel?.();
      stopWheel = el
        ? enableWheelStep(el, (delta) => {
            if (o.inert()) return;
            const next = wheelValue(o.all(), o.value(), delta);
            if (next !== undefined) o.onChange(next);
          })
        : undefined;
    },
    { immediate: true },
  );
  watch(o.shakeCount, (n, _, onCleanup) => {
    if (trigger.value && n > 0) onCleanup(shake(trigger.value));
  });
  onScopeDispose(() => stopWheel?.());
}
