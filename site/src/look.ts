import { useSyncExternalStore } from "react";
import {
  applyAccent,
  applyDensity,
  applyMotion,
  applyOled,
  applyRainbow,
  applyShape,
  DEFAULT_ACCENT,
  DEFAULT_DENSITY,
  DEFAULT_MOTION,
  DEFAULT_SHAPE,
  CONTROL_AXES,
  DEFAULT_LABEL_MODE,
  labelModeChanged,
  setLabelMode,
  setSystemAccent,
  watchBrowserAccent,
  type Density,
  type LabelMode,
  type Motion,
  type Shape,
} from "@glimstone/core";

export type Theme = "system" | "dark" | "light";
export type Rainbow = "off" | "on" | "reactive";
export type Contrast = "system" | "more";

export interface Look {
  theme: Theme;
  oled: boolean;
  shape: Shape;
  accent: string;
  rainbow: Rainbow;
  motion: Motion;
  density: Density;
  contrast: Contrast;
  labels: LabelMode;
}

const KEY = "gs-docs-look";
const DEFAULT: Look = {
  theme: "system",
  oled: false,
  shape: DEFAULT_SHAPE,
  accent: DEFAULT_ACCENT,
  rainbow: "off",
  motion: DEFAULT_MOTION,
  density: DEFAULT_DENSITY,
  contrast: "system",
  labels: DEFAULT_LABEL_MODE,
};

let look: Look = (() => {
  try {
    return { ...DEFAULT, ...JSON.parse(localStorage.getItem(KEY) || "{}") };
  } catch {
    return DEFAULT;
  }
})();
const listeners = new Set<() => void>();

function apply(l: Look) {
  const root = document.documentElement;
  if (l.theme === "system") root.removeAttribute("data-theme");
  else root.setAttribute("data-theme", l.theme);
  if (l.contrast === "more") root.setAttribute("data-contrast", "more");
  else root.removeAttribute("data-contrast");
  applyOled(l.oled);
  applyShape(l.shape);
  applyAccent(l.accent);
  applyMotion(l.motion);
  applyDensity(l.density);
  applyRainbow({ on: l.rainbow !== "off", reactive: l.rainbow === "reactive" });
  for (const axis of CONTROL_AXES) setLabelMode(axis, l.labels);
  labelModeChanged();
}

export function setLook(patch: Partial<Look>) {
  look = { ...look, ...patch };
  try {
    localStorage.setItem(KEY, JSON.stringify(look));
  } catch {
    // The look still applies until the tab closes.
  }
  apply(look);
  listeners.forEach((fn) => fn());
}

export function resetLook() {
  setLook(DEFAULT);
}

export function useLook(): Look {
  return useSyncExternalStore(
    (fn) => {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    () => look,
  );
}

watchBrowserAccent(setSystemAccent);
apply(look);
