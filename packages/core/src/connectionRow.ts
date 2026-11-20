// A connected service or account as a compact row ("Connections" in the design
// language): its mark lit on a tile the row's whole height, its name and how
// it stands, and at the end any actions of the app's own, then its test, edit
// and remove.

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

/**
 * A button of the app's own in the row, such as Mount, standing before Test,
 * Edit and Remove. It reports on itself as the test does: `busy` while it
 * runs, then `tone` with a check or a cross and a `title` with what it did.
 */
export interface ConnectionAction<G> extends ConnectionTest {
  /** Tells the actions apart and names the button's `data-connection` hook. */
  id: string;
  label: string;
  /** The translation key behind `label`, which picks the glyph, or `null`. */
  labelKey: string | null;
  /** Wins over the glyph `labelKey` picks, and stands alone below 640px. */
  glyph?: G;
  disabled?: boolean;
  onClick: () => void;
}

export interface ConnectionRowText {
  test: string;
  edit: string;
  remove: string;
}

/** The translation keys behind the row's buttons. Their glyphs come with the row. */
export interface ConnectionRowLabelKeys {
  test: string;
  edit: string;
  remove: string;
}

export const CONNECTION_ROW_KEYS: ConnectionRowLabelKeys = { test: "test", edit: "edit", remove: "remove" };

/**
 * What the tile draws: a brand's mark as the lit picker tile shows it, with
 * its colour pair, or nothing for one of the app's glyphs, whose tile takes
 * the accent. A wordmark says so, since a name written out needs the tile's
 * width rather than the square a symbol fits in.
 */
export function connectionTile(mark: unknown): { svg?: string; style?: Record<string, string>; wordmark?: true } {
  if (!isTileMark(mark)) return {};
  const tile: { svg?: string; style?: Record<string, string>; wordmark?: true } = {
    svg: mark.hover ?? mark.svg,
    style: mark.tile && mark.ink ? { "--tile": mark.tile, "--tile-ink": mark.ink } : undefined,
  };
  if (mark.wordmark) tile.wordmark = true;
  return tile;
}

/**
 * The fill of the test button, or of an action of the app's, and the glyph
 * that says how the last run came out, so the colour is never the only sign.
 * A failure shakes the button, as any failed click does ("Failure feedback").
 */
export function connectionTestFace(test: ConnectionTest | undefined): { tone: ButtonTone; outcome?: "check" | "cross"; shake: boolean } {
  const tone = test?.busy ? undefined : test?.tone;
  if (tone === "ok") return { tone, outcome: "check", shake: false };
  if (tone === "danger") return { tone, outcome: "cross", shake: true };
  return { tone: "neutral", outcome: undefined, shake: false };
}

/** What a row is handed for its buttons, as each framework's props name it. */
export interface ConnectionRowButtons<G> {
  actions?: readonly ConnectionAction<G>[];
  test?: ConnectionTest;
  text: ConnectionRowText;
  labelKeys?: Partial<ConnectionRowLabelKeys>;
  onTest?: () => void;
  onEdit?: () => void;
  onRemove?: () => void;
}

/**
 * The row's buttons in order: the app's own actions first, then Test, Edit
 * and Remove where their handlers are passed, so the familiar three keep
 * their places at the end of every row. The three wear the package's
 * `glyphs`, so no resolver of an app can give them another.
 */
export function connectionButtons<G>(row: ConnectionRowButtons<G>, glyphs: { test: G; edit: G; remove: G }): ConnectionAction<G>[] {
  const keys = { ...CONNECTION_ROW_KEYS, ...row.labelKeys };
  const buttons = [...(row.actions ?? [])];
  if (row.onTest) buttons.push({ ...row.test, id: "test", label: row.text.test, labelKey: keys.test, glyph: glyphs.test, onClick: row.onTest });
  if (row.onEdit) buttons.push({ id: "edit", label: row.text.edit, labelKey: keys.edit, glyph: glyphs.edit, onClick: row.onEdit });
  if (row.onRemove) buttons.push({ id: "remove", label: row.text.remove, labelKey: keys.remove, glyph: glyphs.remove, onClick: row.onRemove });
  return buttons;
}
