// The label, colour, motion and density engines as composables. Each value belongs to
// the document, not a component: a button and a nav row far apart in the tree
// read the same mode, so every composable follows the document and writes back
// through the core.

import { computed, onScopeDispose, shallowRef, type Ref, type WritableComputedRef } from "vue";
import {
  applyAccent,
  applyDensity,
  applyMotion,
  applyRainbow,
  applyShape,
  DEFAULT_DENSITY,
  DEFAULT_MOTION,
  DEFAULT_SHAPE,
  getLabelMode,
  hueVars,
  labelModeChanged,
  rainbowState,
  setLabelMode,
  subscribeLabelMode,
  subscribeRainbow,
  type Density,
  type LabelAxis,
  type LabelMode,
  type Motion,
  type RainbowState,
  type Shape,
} from "@glimstone/core";

/** One axis of the label engine. Writing it stores the mode and tells every control. */
export function useLabelMode(axis: LabelAxis): WritableComputedRef<LabelMode> {
  const mode = shallowRef(getLabelMode(axis));
  onScopeDispose(subscribeLabelMode(() => (mode.value = getLabelMode(axis))));
  return computed({
    get: () => mode.value,
    set: (next) => {
      setLabelMode(axis, next);
      labelModeChanged();
    },
  });
}

/** The rainbow state. Writing it applies the new state to the document. */
export function useRainbow(): WritableComputedRef<RainbowState> {
  const state = shallowRef(rainbowState());
  onScopeDispose(subscribeRainbow(() => (state.value = rainbowState())));
  return computed({ get: () => state.value, set: (next) => applyRainbow(next) });
}

/** The custom properties that put an element at a rainbow position. */
export function useHue(index: () => number | undefined): Ref<Record<string, string> | undefined> {
  return computed(() => {
    const i = index();
    return i === undefined ? undefined : hueVars(i);
  });
}

// Shape, motion, density and accent live on the root element only, so a reader watches
// the attribute rather than waiting for a call that told it.
function rootValue<T>(attribute: string, read: () => T): Ref<T> {
  const value = shallowRef(read());
  const observer = new MutationObserver(() => (value.value = read()));
  observer.observe(document.documentElement, { attributes: true, attributeFilter: [attribute] });
  onScopeDispose(() => observer.disconnect());
  return value;
}

export function useShape(): WritableComputedRef<Shape> {
  const shape = rootValue("data-shape", () => (document.documentElement.getAttribute("data-shape") as Shape) ?? DEFAULT_SHAPE);
  return computed({ get: () => shape.value, set: applyShape });
}

export function useMotion(): WritableComputedRef<Motion> {
  const motion = rootValue("data-motion", () => (document.documentElement.getAttribute("data-motion") as Motion) ?? DEFAULT_MOTION);
  return computed({ get: () => motion.value, set: applyMotion });
}

export function useDensity(): WritableComputedRef<Density> {
  const density = rootValue("data-density", () => (document.documentElement.getAttribute("data-density") as Density) ?? DEFAULT_DENSITY);
  return computed({ get: () => density.value, set: applyDensity });
}

/** The accent the user chose, or "" for the default. */
export function useAccent(): WritableComputedRef<string> {
  const accent = rootValue("style", () => document.documentElement.style.getPropertyValue("--accent"));
  return computed({ get: () => accent.value, set: (hex) => applyAccent(hex || undefined) });
}
