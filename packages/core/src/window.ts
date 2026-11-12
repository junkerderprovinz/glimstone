// What every Window shares, whatever it holds ("Windows" in the design
// language): a foot that always offers a way out, a stack in which Escape and
// Tab belong to the window in front, and where focus lands when one opens.

import { keepTabInside } from "./dialog.ts";
import { menuIsOpen } from "./menu.ts";

export type WindowSize = "normal" | "wide" | "full";

export interface WindowActionBase {
  /** The forward action, filled with the accent. Its presence makes the way out Cancel rather than Close. */
  primary?: boolean;
  /** This action already leaves the window, so no Cancel or Close is added. */
  wayOut?: boolean;
}

/**
 * The foot's buttons in order. A window whose foot has anything in it can be
 * left from there: without a way out among its actions it gets Cancel when
 * one of them goes forward and Close otherwise, before the others, so the
 * forward action stays last.
 */
export function windowFoot<A extends WindowActionBase>(
  actions: readonly A[],
  hasStart: boolean,
  wayOut: { cancel: A; close: A },
): A[] {
  if ((actions.length === 0 && !hasStart) || actions.some((a) => a.wayOut)) return [...actions];
  return [actions.some((a) => a.primary) ? wayOut.cancel : wayOut.close, ...actions];
}

interface Stacked {
  card: () => HTMLElement | null;
  close: () => void;
}

const stack: Stacked[] = [];

// A key that an open menu or a Select inside the window already handled is
// left alone, so Escape closes one thing at a time from the front.
function onKey(e: KeyboardEvent) {
  const top = stack[stack.length - 1];
  if (!top || e.defaultPrevented) return;
  if (e.key === "Escape") {
    if (menuIsOpen()) return;
    e.preventDefault();
    top.close();
  } else if (e.key === "Tab") keepTabInside(top.card(), e);
}

/**
 * Puts a window on the stack. Escape closes the one in front and Tab stays
 * inside it. Returns the removal, to call however the window closes.
 */
export function stackWindow(card: () => HTMLElement | null, close: () => void): () => void {
  const entry = { card, close };
  stack.push(entry);
  if (stack.length === 1) document.addEventListener("keydown", onKey);
  return () => {
    const at = stack.indexOf(entry);
    if (at >= 0) stack.splice(at, 1);
    if (stack.length === 0) document.removeEventListener("keydown", onKey);
  };
}

/** Whether a window is open, for a key handler of the app's that should leave the page alone. */
export function windowIsOpen(): boolean {
  return stack.length > 0;
}

const FIELD = 'input:not([type="file"]):not([type="hidden"]):not([disabled]), textarea:not([disabled])';

/**
 * Where focus goes as a window opens: its first field, so typing can start at
 * once, or else the last button of its foot, the forward action.
 */
export function windowFocusTarget(card: HTMLElement): HTMLElement | null {
  const foot = card.querySelectorAll<HTMLElement>(".glim-modal-foot button:not([disabled])");
  return card.querySelector<HTMLElement>(FIELD) ?? foot[foot.length - 1] ?? null;
}
