import { createSignal, onCleanup, type Accessor } from "solid-js";
import {
  applyAccent,
  applyMotion,
  applyRainbow,
  applyShape,
  DEFAULT_MOTION,
  DEFAULT_SHAPE,
  getLabelMode,
  hueVars,
  rainbowState,
  subscribeLabelMode,
  subscribeRainbow,
  type LabelAxis,
  type LabelMode,
  type Motion,
  type RainbowState,
  type Shape,
} from "@glimstone/core";

// The label, colour, shape and motion engines as primitives. Each value
// belongs to the document, not a component, so every primitive follows the
// document and writes back through the core, in the [value, set] shape of
// createSignal.

/**
 * The current label mode for one axis. The first value is read synchronously
 * so the first paint is already right.
 */
export function useLabelMode(axis: LabelAxis): Accessor<LabelMode> {
  const [mode, setMode] = createSignal(getLabelMode(axis));
  onCleanup(subscribeLabelMode(() => setMode(getLabelMode(axis))));
  return mode;
}

/** The rainbow state. Setting it applies the new state to the document. */
export function useRainbow(): [Accessor<RainbowState>, (next: RainbowState) => void] {
  const [state, setState] = createSignal(rainbowState());
  onCleanup(subscribeRainbow(() => setState(rainbowState())));
  return [state, applyRainbow];
}

/** The custom properties that put an element at a rainbow position. */
export function useHue(index: () => number | undefined): Accessor<Record<string, string> | undefined> {
  return () => {
    const i = index();
    return i === undefined ? undefined : hueVars(i);
  };
}

// Shape, motion and accent live on the root element only, so a reader watches
// the attribute rather than waiting for a call that told it.
function rootValue<T>(attribute: string, read: () => T): Accessor<T> {
  const [value, setValue] = createSignal(read());
  const observer = new MutationObserver(() => setValue(() => read()));
  observer.observe(document.documentElement, { attributes: true, attributeFilter: [attribute] });
  onCleanup(() => observer.disconnect());
  return value;
}

export function useShape(): [Accessor<Shape>, (next: Shape) => void] {
  return [rootValue("data-shape", () => (document.documentElement.getAttribute("data-shape") as Shape | null) ?? DEFAULT_SHAPE), applyShape];
}

export function useMotion(): [Accessor<Motion>, (next: Motion) => void] {
  return [rootValue("data-motion", () => (document.documentElement.getAttribute("data-motion") as Motion | null) ?? DEFAULT_MOTION), applyMotion];
}

/** The accent the user chose, or "" for the default. */
export function useAccent(): [Accessor<string>, (hex: string) => void] {
  return [rootValue("style", () => document.documentElement.style.getPropertyValue("--accent")), (hex) => applyAccent(hex || undefined)];
}
