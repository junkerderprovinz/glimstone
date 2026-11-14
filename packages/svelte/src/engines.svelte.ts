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

// The label, colour, shape, motion and density engines as reactive boxes. Each value
// belongs to the document, not a component, so every box follows the document
// and writes back through the core through its `current`.

export interface Box<T> {
  current: T;
}

function follow<T>(read: () => T, subscribe: (changed: () => void) => () => void, write: (next: T) => void): Box<T> {
  let value = $state(read());
  $effect(() => subscribe(() => (value = read())));
  return {
    get current() {
      return value;
    },
    set current(next) {
      write(next);
    },
  };
}

/** One axis of the label engine. Writing it stores the mode and tells every control. */
export function useLabelMode(axis: LabelAxis): Box<LabelMode> {
  return follow(() => getLabelMode(axis), subscribeLabelMode, (next) => {
    setLabelMode(axis, next);
    labelModeChanged();
  });
}

/** The rainbow state. Writing it applies the new state to the document. */
export function useRainbow(): Box<RainbowState> {
  return follow(rainbowState, subscribeRainbow, applyRainbow);
}

/** The custom properties that put an element at a rainbow position. */
export function useHue(index: () => number | undefined): { readonly current: Record<string, string> | undefined } {
  const vars = $derived.by(() => {
    const i = index();
    return i === undefined ? undefined : hueVars(i);
  });
  return {
    get current() {
      return vars;
    },
  };
}

// Shape, motion, density and accent live on the root element only, so a reader watches
// the attribute rather than waiting for a call that told it.
const watchRoot = (attribute: string) => (changed: () => void) => {
  const observer = new MutationObserver(changed);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: [attribute] });
  return () => observer.disconnect();
};

export function useShape(): Box<Shape> {
  return follow(() => (document.documentElement.getAttribute("data-shape") as Shape | null) ?? DEFAULT_SHAPE, watchRoot("data-shape"), applyShape);
}

export function useMotion(): Box<Motion> {
  return follow(() => (document.documentElement.getAttribute("data-motion") as Motion | null) ?? DEFAULT_MOTION, watchRoot("data-motion"), applyMotion);
}

/** The row density of lists and tables. */
export function useDensity(): Box<Density> {
  return follow(() => (document.documentElement.getAttribute("data-density") as Density | null) ?? DEFAULT_DENSITY, watchRoot("data-density"), applyDensity);
}

/** The accent the user chose, or "" for the default. */
export function useAccent(): Box<string> {
  return follow(() => document.documentElement.style.getPropertyValue("--accent"), watchRoot("style"), (hex) => applyAccent(hex || undefined));
}
