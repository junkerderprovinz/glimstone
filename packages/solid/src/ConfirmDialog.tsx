// The styled confirmation dialog that replaces window.confirm(): an anchored
// header, a scrolling message and a footer with Cancel and Confirm. A backdrop
// click, the header close button and Cancel all call onCancel.
//
// The component holds no state and never touches `document`. The companion
// hook useConfirm owns the queue, the promise, the portal, Escape, the focus
// trap and returning focus on close, because Escape and the trap must work
// after focus has left this subtree.
import { children, onMount, Show, type JSX } from "solid-js";
import { Badge } from "./Badge.tsx";
import { Button } from "./Button.tsx";
import { IconCancel, IconClose } from "./glyphs.tsx";

export interface ConfirmDialogProps {
  /** A generic title such as "Confirm"; the call site's own text is `message`. */
  title: string;
  /** The question or explanation, also the dialog's accessible description. */
  message: string;
  confirmLabel: string;
  /** Translation key behind `confirmLabel`, so the confirm button can pick
   *  a glyph. Optional: a caller passing a composed or data label has none. */
  confirmLabelKey?: string;
  cancelLabel: string;
  /** A control the confirming action needs an answer to, such as "also remove
   *  X?", shown under the message so the question is asked in one window.
   *  Keep it to a switch or two. */
  extra?: JSX.Element;
  /** Glyph for the confirm button. The action changes per call site, so no
   *  fixed key can name it; without one the button beside a glyphed Cancel
   *  looks unfinished. */
  confirmGlyph?: JSX.Element;
  /** Accessible name for the header close button, separate from cancelLabel so
   *  the two controls are not announced alike. Leave it out and the button is
   *  not drawn, since a corner close beside Cancel reads as a second choice. */
  closeLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  /** The dialog card's root DOM node, for useConfirm's focus trap. */
  ref?: HTMLDivElement | ((el: HTMLDivElement) => void);
}

export function ConfirmDialog(props: ConfirmDialogProps) {
  const extra = children(() => props.extra);
  let cancel: HTMLButtonElement | undefined;
  // Focus lands on Cancel, the answer that changes nothing.
  onMount(() => cancel?.focus());
  return (
    <div
      class="glim-modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) props.onCancel();
      }}
    >
      <div
        data-glim="ConfirmDialog"
        data-glim-title={props.title}
        ref={props.ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirmdialog-title"
        aria-describedby="confirmdialog-message"
        class="glim-modal-card"
      >
        <div class="glim-modal-head">
          {/* The title is a heading badge that straddles the card's top edge
              against the outer box, which does not scroll and so does not clip it. */}
          <h2 id="confirmdialog-title" class="glim-modal-title">
            <Badge tone="heading" size="heading" wrap>
              {props.title}
            </Badge>
          </h2>
          <Show when={props.closeLabel !== undefined}>
            <Button
              label={props.closeLabel!}
              labelKey="common.close"
              glyph={<IconClose />}
              tone="neutral"
              onClick={() => props.onCancel()}
              class="glim-modal-close"
            />
          </Show>
        </div>

        <div class="glim-modal-body">
          <p id="confirmdialog-message" class="glim-modal-text">
            {props.message}
          </p>
          <Show when={extra() !== undefined}>
            <div class="glim-modal-extra">{extra()}</div>
          </Show>
        </div>

        <div class="glim-modal-foot">
          <Button
            ref={(el) => (cancel = el)}
            label={props.cancelLabel}
            labelKey="common.cancel"
            glyph={<IconCancel />}
            tone="neutral"
            onClick={() => props.onCancel()}
          />
          {/* Not red: the dialog's sentence is the warning, and neither button is recommended. */}
          <Button
            label={props.confirmLabel}
            labelKey={props.confirmLabelKey ?? null}
            glyph={props.confirmGlyph}
            tone="neutral"
            onClick={() => props.onConfirm()}
          />
        </div>
      </div>
    </div>
  );
}
