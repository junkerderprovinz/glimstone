// A connected service or account as a compact row ("Connections" in the design
// language): its mark lit on a tile the row's whole height, its name and how
// it stands, and its test, edit and remove at the end.

import type { ButtonTone } from "./button.ts";
import { isTileMark } from "./picker.ts";

/** Where the row's test stands, as on a window's test action. */
export interface ConnectionTest {
  /** The busy ring in place of the glyph while it runs. The words, and so the width, stay. */
  busy?: boolean;
  /** How the last run came out. */
  tone?: "ok" | "danger";
  /** What the last run found, such as where the traffic leaves, in the button's bubble. */
  title?: string;
}

export interface ConnectionRowText {
  test: string;
  edit: string;
  remove: string;
}

/** The label keys behind the row's buttons, which pick their glyphs (see Button). */
export interface ConnectionRowLabelKeys {
  test: string;
  edit: string;
  remove: string;
}

export const CONNECTION_ROW_KEYS: ConnectionRowLabelKeys = { test: "test", edit: "edit", remove: "remove" };

/**
 * What the tile draws: a brand's mark as the lit picker tile shows it, with
 * its colour pair, or nothing for one of the app's glyphs, whose tile takes
 * the accent.
 */
export function connectionTile(mark: unknown): { svg?: string; style?: Record<string, string> } {
  if (!isTileMark(mark)) return {};
  return {
    svg: mark.hover ?? mark.svg,
    style: mark.tile && mark.ink ? { "--tile": mark.tile, "--tile-ink": mark.ink } : undefined,
  };
}

/**
 * The test button's fill and the glyph that says how the last run came out,
 * so the colour is never the only sign. A failure shakes the button, as any
 * failed click does ("Failure feedback").
 */
export function connectionTestFace(test: ConnectionTest | undefined): { tone: ButtonTone; outcome?: "check" | "cross"; shake: boolean } {
  const tone = test?.busy ? undefined : test?.tone;
  if (tone === "ok") return { tone, outcome: "check", shake: false };
  if (tone === "danger") return { tone, outcome: "cross", shake: true };
  return { tone: "neutral", outcome: undefined, shake: false };
}
