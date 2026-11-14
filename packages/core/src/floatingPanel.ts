// The words of a FloatingPanel. Zag's floating-panel machine moves, sizes and
// stacks the panel; an app passes its own names for the head's buttons.

import { en } from "./componentLocales/en.ts";

export interface FloatingPanelText {
  minimize: string;
  maximize: string;
  restore: string;
  close: string;
}

export const FLOATING_PANEL_TEXT: FloatingPanelText = en.floatingPanel;

/** A panel's size, in pixels. */
export interface PanelSize {
  width: number;
  height: number;
}
