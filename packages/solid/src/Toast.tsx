import { createEffect, createMemo, For, Index, Show } from "solid-js";
import { announce, liveRegionAttrs, MARKS, softBreaks, TOAST_MARKS, toastPoliteness, type ToastAction, type ToastSeverity, type ToastViewportEntry } from "@glimstone/core";
import { Button } from "./Button.tsx";
import { MarkSvg } from "./glyphs.tsx";

export type { ToastViewportEntry } from "@glimstone/core";

// The toast system's presentational half (design-language.md, "Toasts"). These
// components hold no state, so a test can call them with props; the app keeps
// the queue with the core's toastEngine and its own timers.
//
// A toast never blocks the page: the viewport is `pointer-events: none` and only
// each card turns them back on, so clicks pass through the empty corner.
//
// The viewport holds the page's two live regions for good, and a new toast's
// message is read out through them. A card that carried a live role itself
// would be announced on arrival by some screen readers and not by others.

export interface ToastCardProps {
  id: string;
  message: string;
  severity: ToastSeverity;
  /** A button such as Undo. A press runs it and dismisses the toast. */
  action?: ToastAction;
  /** Accessible name for the dismiss button, the same for every toast. */
  dismissLabel: string;
  onDismiss: (id: string) => void;
  onMouseEnter: (id: string) => void;
  onMouseLeave: (id: string) => void;
  onFocus: (id: string) => void;
  onBlur: (id: string) => void;
}

export function ToastCard(props: ToastCardProps) {
  return (
    <div
      data-glim="ToastCard"
      // Focus is heard as it bubbles, so tabbing onto the dismiss button pauses
      // the countdown like a hover does.
      onMouseEnter={() => props.onMouseEnter(props.id)}
      onMouseLeave={() => props.onMouseLeave(props.id)}
      onFocusIn={() => props.onFocus(props.id)}
      onFocusOut={() => props.onBlur(props.id)}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          e.stopPropagation();
          props.onDismiss(props.id);
        }
      }}
      class="glim-toast glim-toast-card"
    >
      <MarkSvg mark={TOAST_MARKS[props.severity]} class={`glim-toast-glyph glim-toast-glyph--${props.severity}`} />
      <div class="glim-toast-body">
        <p class="glim-toast-message">
          <Index each={softBreaks(props.message)}>
            {(part, i) => (
              <>
                {i > 0 && <wbr />}
                {part()}
              </>
            )}
          </Index>
        </p>
        <Show when={props.action}>
          {(action) => (
            <Button
              class="glim-toast-action"
              tone="subtle"
              label={action().label}
              labelKey={null}
              onClick={() => {
                action().onClick();
                props.onDismiss(props.id);
              }}
            />
          )}
        </Show>
      </div>
      <button type="button" onClick={() => props.onDismiss(props.id)} aria-label={props.dismissLabel} class="glim-btn-bare glim-toast-dismiss">
        <MarkSvg mark={MARKS.dismiss} />
      </button>
    </div>
  );
}

export interface ToastViewportProps {
  toasts: ToastViewportEntry[];
  dismissLabel: string;
  onDismiss: (id: string) => void;
  // Four separate events rather than onPause and onResume, because the caller
  // resumes only once hover and focus have both ended (applyEngagement).
  onMouseEnter: (id: string) => void;
  onMouseLeave: (id: string) => void;
  onFocus: (id: string) => void;
  onBlur: (id: string) => void;
}

// Toasts render in array order, so the newest sits nearest the bottom edge.
export function ToastViewport(props: ToastViewportProps) {
  const heard = new Set<string>();
  createEffect(() => {
    const ids = new Set(props.toasts.map((t) => t.id));
    for (const id of heard) if (!ids.has(id)) heard.delete(id);
    for (const t of props.toasts) {
      if (heard.has(t.id)) continue;
      heard.add(t.id);
      announce(t.message, toastPoliteness(t.severity));
    }
  });
  // A paused toast arrives as a new object, so the cards are keyed by id and
  // the one under the pointer stays the same element.
  const ids = createMemo(() => props.toasts.map((t) => t.id));
  const entry = (id: string) => props.toasts.find((t) => t.id === id)!;
  return (
    <>
      <div class="glim-sr-only" {...liveRegionAttrs("polite")} />
      <div class="glim-sr-only" {...liveRegionAttrs("assertive")} />
      <div data-glim="ToastViewport" class="glim-toast-stack">
        <For each={ids()}>
          {(id) => (
            <ToastCard
              id={id}
              message={entry(id).message}
              severity={entry(id).severity}
              action={entry(id).action}
              dismissLabel={props.dismissLabel}
              onDismiss={(t) => props.onDismiss(t)}
              onMouseEnter={(t) => props.onMouseEnter(t)}
              onMouseLeave={(t) => props.onMouseLeave(t)}
              onFocus={(t) => props.onFocus(t)}
              onBlur={(t) => props.onBlur(t)}
            />
          )}
        </For>
      </div>
    </>
  );
}
