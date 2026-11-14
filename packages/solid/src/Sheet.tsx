import { createEffect, createSignal, createUniqueId, mergeProps, onCleanup, Show, type JSX } from "solid-js";
import { openSheet } from "@glimstone/core";
import { Badge } from "./Badge.tsx";
import { WindowFootRow, type WindowAction } from "./WindowFootRow.tsx";

// A panel at the end edge, or rising from the bottom on a phone, for the
// details of a row or a longer form beside the list. It is a <dialog> shown
// modal: the page behind it is inert, Escape and a press on the scrim close it,
// and focus goes back to the control that opened it. Its foot works as a
// Window's, with Cancel or Close added, so it has no close mark in its head.

export interface SheetProps {
  open: boolean;
  /** The notch's words, also the sheet's accessible name. */
  title: string;
  children: JSX.Element;
  /** The foot's buttons, in reading order, as a Window's. */
  actions?: WindowAction[];
  /** A quiet line at the start of the foot. */
  start?: JSX.Element;
  /** The words of the way out the sheet adds. */
  text: { cancel: string; close: string };
  /** Called for every way out; the caller sets `open` back. */
  onClose: () => void;
  class?: string;
}

export function Sheet(props: SheetProps) {
  const merged = mergeProps({ actions: [] }, props);
  const [dialog, setDialog] = createSignal<HTMLDialogElement>();
  const titleId = createUniqueId();
  createEffect(() => {
    const el = dialog();
    if (!merged.open || !el) return;
    onCleanup(openSheet(el, () => merged.onClose()));
  });
  return (
    <Show when={merged.open}>
      <dialog
        data-glim="Sheet"
        data-glim-title={merged.title}
        ref={setDialog}
        aria-labelledby={titleId}
        class={merged.class ? `glim-sheet ${merged.class}` : "glim-sheet"}
      >
        <div class="glim-sheet-panel">
          <h2 id={titleId} class="glim-sheet-title">
            <Badge tone="heading" size="heading" wrap insetStart={5}>
              {merged.title}
            </Badge>
          </h2>
          <div class="glim-sheet-body">{merged.children}</div>
          <WindowFootRow actions={merged.actions} start={merged.start} text={merged.text} onClose={() => merged.onClose()} />
        </div>
      </dialog>
    </Show>
  );
}
