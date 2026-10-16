import { useSyncExternalStore } from "react";
import {
  applyAccent,
  applyMotion,
  applyRainbow,
  applyShape,
  DEFAULT_ACCENT,
  DEFAULT_MOTION,
  DEFAULT_SHAPE,
  type Motion,
  type Shape,
} from "@gs/appearance";
import { CONTROL_AXES, DEFAULT_LABEL_MODE, setLabelMode, type LabelMode } from "@gs/controls";
import { labelModeChanged } from "@gs/react/useLabelMode";

export type Theme = "system" | "dark" | "light";
export type Rainbow = "off" | "on" | "reactive";

export interface Look {
  theme: Theme;
  shape: Shape;
  accent: string;
  rainbow: Rainbow;
  motion: Motion;
  labels: LabelMode;
}

const KEY = "gs-docs-look";
const DEFAULT: Look = {
  theme: "system",
  shape: DEFAULT_SHAPE,
  accent: DEFAULT_ACCENT,
  rainbow: "off",
  motion: DEFAULT_MOTION,
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
  applyShape(l.shape);
  applyAccent(l.accent);
  applyMotion(l.motion);
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

apply(look);
