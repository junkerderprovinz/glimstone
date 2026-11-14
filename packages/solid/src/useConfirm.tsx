import { createEffect, createSignal, onCleanup, Show, type JSX } from "solid-js";
import { focusedAsker, returnFocus, trapDialogKeys } from "@glimstone/core";
import { ConfirmDialog } from "./ConfirmDialog.tsx";
import { Lift } from "./Lift.tsx";

// useConfirm replaces window.confirm() with ConfirmDialog, keeping the
// one-question-in, boolean-out shape, only async:
//
//   const { confirm, confirmDialog } = useConfirm({ title, cancel, confirm });
//   if (!(await confirm("Delete the snapshot?", { confirmLabel: "Delete" }))) return;
//   return <>... {confirmDialog}</>;
//
// The hook owns everything that needs `document`, so ConfirmDialog stays a plain
// component: the portal, a document-level Escape listener, a Tab trap, and
// returning focus to the control that asked on every way out.
//
// One pending question per instance is enough: the dialog is modal, so a second
// confirm() cannot be triggered while one is open.

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
  confirmGlyph?: JSX.Element;
  /** A switch or two the answer needs, shown under the question. */
  extra?: JSX.Element;
}

interface Pending extends ConfirmOptions {
  message: string;
}

export function useConfirm(text: ConfirmText) {
  const [pending, setPending] = createSignal<Pending | null>(null);
  let resolve: ((value: boolean) => void) | null = null;
  let dialog: HTMLDivElement | undefined;
  let asker: HTMLElement | null = null;

  const confirm = (message: string, options?: ConfirmOptions) => {
    asker = focusedAsker();
    return new Promise<boolean>((r) => {
      resolve = r;
      setPending({ message, ...options });
    });
  };

  const settle = (result: boolean) => {
    resolve?.(result);
    resolve = null;
    setPending(null);
    returnFocus(asker);
    asker = null;
  };

  /** For a caller whose question stopped making sense while it was open. */
  const dismiss = () => settle(false);
  useDialogKeys(() => pending() !== null, () => dialog ?? null, dismiss);

  // An ancestor with a transform would confine a fixed backdrop to its own box,
  // so the dialog goes to <body>.
  const confirmDialog = (
    <Show when={pending()}>
      {(p) => (
        <Lift>
          <ConfirmDialog
            ref={dialog}
            title={text.title}
            message={p().message}
            confirmLabel={p().confirmLabel ?? text.confirm}
            confirmLabelKey={p().confirmLabelKey}
            confirmGlyph={p().confirmGlyph}
            cancelLabel={text.cancel}
            extra={p().extra}
            onConfirm={() => settle(true)}
            onCancel={() => settle(false)}
          />
        </Lift>
      )}
    </Show>
  );

  return { confirm, confirmDialog, dismiss };
}

/** Escape from anywhere and a Tab trap over the dialog's own controls, so focus
 *  never reaches the page it covers. Exported for any other modal window. */
export function useDialogKeys(open: () => boolean, dialog: () => HTMLElement | null, onCancel: () => void): void {
  createEffect(() => {
    if (open()) onCleanup(trapDialogKeys(dialog, onCancel));
  });
}
