// useConfirm replaces window.confirm() with ConfirmDialog, keeping the
// one-question-in, boolean-out shape, only async:
//
//   const { confirm, ConfirmHost } = useConfirm({ title, cancel, confirm: "Confirm" });
//   if (!(await confirm("Delete the snapshot?", { confirmLabel: "Delete" }))) return;
//   <ConfirmHost /> once in the template
//
// One pending question per instance is enough: the dialog is modal, so a second
// confirm() cannot be triggered while one is open.

import { defineComponent, h, shallowRef, Teleport, watch, type Component } from "vue";
import { focusedAsker, returnFocus, trapDialogKeys, portalTarget } from "@glimstone/core";
import ConfirmDialog from "./ConfirmDialog.vue";

export interface ConfirmText {
  /** The dialog's title, the same for every question, such as "Confirm". */
  title: string;
  cancel: string;
  /** The confirm button's words where a question passes none of its own. */
  confirm: string;
}

export interface ConfirmOptions {
  confirmLabel?: string;
  confirmLabelKey?: string;
  confirmGlyph?: Component;
  /** A switch or two the answer needs, shown under the question. */
  extra?: Component;
}

export function useConfirm(text: ConfirmText) {
  const pending = shallowRef<(ConfirmOptions & { message: string }) | null>(null);
  const card = shallowRef<HTMLElement | null>(null);
  let resolve: ((value: boolean) => void) | null = null;
  let asker: HTMLElement | null = null;

  function confirm(message: string, options?: ConfirmOptions): Promise<boolean> {
    asker = focusedAsker();
    return new Promise((r) => {
      resolve = r;
      pending.value = { message, ...options };
    });
  }

  function settle(result: boolean) {
    resolve?.(result);
    resolve = null;
    pending.value = null;
    returnFocus(asker);
    asker = null;
  }

  /** For a caller whose question stopped making sense while it was open. */
  const dismiss = () => settle(false);

  watch(pending, (open, _, onCleanup) => {
    if (open) onCleanup(trapDialogKeys(() => card.value, dismiss));
  });

  // An ancestor with a transform would confine a fixed backdrop to its own
  // box, so the dialog goes to <body>.
  const ConfirmHost = defineComponent(() => () => {
    const p = pending.value;
    if (!p) return null;
    return h(Teleport, { to: portalTarget() }, [
      h(
        ConfirmDialog,
        {
          ref: (c: unknown) => (card.value = (c as { card?: HTMLElement } | null)?.card ?? null),
          title: text.title,
          message: p.message,
          confirmLabel: p.confirmLabel ?? text.confirm,
          confirmLabelKey: p.confirmLabelKey,
          confirmGlyph: p.confirmGlyph,
          cancelLabel: text.cancel,
          onConfirm: () => settle(true),
          onCancel: () => settle(false),
        },
        p.extra ? { extra: () => h(p.extra!) } : undefined,
      ),
    ]);
  });

  return { confirm, dismiss, ConfirmHost };
}
