// useConfirm replaces window.confirm() with ConfirmDialog, keeping the
// one-question-in, boolean-out shape, only async:
//
//   const ask = useConfirm({ title, cancel, confirm: "Confirm" });
//   if (!(await ask.confirm("Delete the snapshot?", { confirmLabel: "Delete" }))) return;
//   <ask.confirmDialog /> once in the template
//
// The hook owns everything that needs `document`, so ConfirmDialog stays a plain
// component: the portal, a document-level Escape listener, a Tab trap, and
// returning focus to the control that asked on every way out.
//
// One pending question per instance is enough: the dialog is modal, so a second
// confirm() cannot be triggered while one is open.

import type { Component, Snippet } from "svelte";
import { focusedAsker, returnFocus, trapDialogKeys } from "@glimstone/core";
import ConfirmHost from "./ConfirmHost.svelte";

export interface ConfirmText {
  /** The dialog's title, the same for every question, such as "Confirm". */
  title: string;
  cancel: string;
  /** The confirm button's words where a question passes none of its own. */
  confirm: string;
}

export interface ConfirmOptions {
  /** The words of the action being confirmed, so the answer repeats "Delete"
   *  rather than a bare "Confirm". */
  confirmLabel?: string;
  /** Translation key behind confirmLabel, so the confirm button shows its glyph. */
  confirmLabelKey?: string;
  confirmGlyph?: Snippet;
  /** A switch or two the answer needs, shown under the question. */
  extra?: Snippet;
}

export interface PendingQuestion extends ConfirmOptions {
  message: string;
}

/** What the host component reads and answers through. */
export interface ConfirmHostState {
  readonly text: ConfirmText;
  readonly pending: PendingQuestion | null;
  dialog: HTMLElement | null;
  settle: (result: boolean) => void;
}

export function useConfirm(text: ConfirmText) {
  let pending = $state.raw<PendingQuestion | null>(null);
  let resolve: ((value: boolean) => void) | null = null;
  let dialog: HTMLElement | null = null;
  let asker: HTMLElement | null = null;

  function confirm(message: string, options?: ConfirmOptions): Promise<boolean> {
    asker = focusedAsker();
    return new Promise((r) => {
      resolve = r;
      pending = { message, ...options };
    });
  }

  function settle(result: boolean) {
    resolve?.(result);
    resolve = null;
    pending = null;
    returnFocus(asker);
    asker = null;
  }

  /** For a caller whose question stopped making sense while it was open. */
  const dismiss = () => settle(false);
  useDialogKeys(() => pending !== null, () => dialog, dismiss);

  const host: ConfirmHostState = {
    text,
    get pending() {
      return pending;
    },
    get dialog() {
      return dialog;
    },
    set dialog(el) {
      dialog = el;
    },
    settle,
  };
  const confirmDialog: Component = (internals) => ConfirmHost(internals, { host });

  return { confirm, confirmDialog, dismiss };
}

/** Escape from anywhere and a Tab trap over the dialog's own controls while
 *  it is open, so focus never reaches the page it covers. For any other modal
 *  window too. */
export function useDialogKeys(open: () => boolean, dialog: () => HTMLElement | null, onCancel: () => void): void {
  $effect(() => {
    if (open()) return trapDialogKeys(dialog, onCancel);
  });
}
