import { useCallback, useMemo, useSyncExternalStore } from "react";
import {
  applyAccent,
  applyDensity,
  applyMotion,
  applyRainbow,
  applyShape,
  DEFAULT_DENSITY,
  DEFAULT_MOTION,
  DEFAULT_SHAPE,
  hueVars,
  rainbowState,
  subscribeRainbow,
  type Density,
  type Motion,
  type RainbowState,
  type Shape,
} from "@glimstone/core";

// The colour, shape, motion and density engines as hooks, the twins of the Vue
// composables. Each value belongs to the document, not a component, so every
// hook follows the document and writes back through the core, in the
// [value, set] shape of useState.

/** The rainbow state. Setting it applies the new state to the document. */
export function useRainbow(): [RainbowState, (next: RainbowState) => void] {
  return [useSyncExternalStore(subscribeRainbow, rainbowState), applyRainbow];
}

/** The custom properties that put an element at a rainbow position. */
export function useHue(index: number | undefined): Record<string, string> | undefined {
  return useMemo(() => (index === undefined ? undefined : hueVars(index)), [index]);
}

// Shape, motion, density and accent live on the root element only, so a reader watches
// the attribute rather than waiting for a call that told it.
function useRoot<T>(attribute: string, read: () => T): T {
  const subscribe = useCallback(
    (changed: () => void) => {
      const observer = new MutationObserver(changed);
      observer.observe(document.documentElement, { attributes: true, attributeFilter: [attribute] });
      return () => observer.disconnect();
    },
    [attribute],
  );
  return useSyncExternalStore(subscribe, read);
}

const readShape = () => (document.documentElement.getAttribute("data-shape") as Shape | null) ?? DEFAULT_SHAPE;
const readMotion = () => (document.documentElement.getAttribute("data-motion") as Motion | null) ?? DEFAULT_MOTION;
const readDensity = () => (document.documentElement.getAttribute("data-density") as Density | null) ?? DEFAULT_DENSITY;
const readAccent = () => document.documentElement.style.getPropertyValue("--accent");

export function useShape(): [Shape, (next: Shape) => void] {
  return [useRoot("data-shape", readShape), applyShape];
}

export function useMotion(): [Motion, (next: Motion) => void] {
  return [useRoot("data-motion", readMotion), applyMotion];
}

export function useDensity(): [Density, (next: Density) => void] {
  return [useRoot("data-density", readDensity), applyDensity];
}

/** The accent the user chose, or "" for the default. */
export function useAccent(): [string, (hex: string) => void] {
  return [useRoot("style", readAccent), setAccent];
}

const setAccent = (hex: string) => applyAccent(hex || undefined);
