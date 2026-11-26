// The error line the fields draw under themselves. Once the value is fixed it
// stays a moment with data-closing, so the stylesheet can close it as softly
// as it opened instead of the form jumping.

import { createEffect, createSignal, onCleanup, Show } from "solid-js";
import { TOAST_MARKS, whenFieldErrorClosed } from "@glimstone/core";
import { MarkSvg } from "./glyphs.tsx";

export function FieldErrorLine(props: { id: string | undefined; error: string | undefined }) {
  const [shown, setShown] = createSignal<{ id: string; error: string } | null>(props.id && props.error ? { id: props.id, error: props.error } : null);
  let line: HTMLSpanElement | undefined;
  createEffect(() => {
    const { id, error } = props;
    if (id && error) setShown({ id, error });
  });
  const closing = () => !props.error && shown() !== null;
  createEffect(() => {
    if (!closing() || !line) return;
    onCleanup(whenFieldErrorClosed(line, () => setShown(null)));
  });
  return (
    <Show when={shown()}>
      {(s) => (
        <span ref={line} data-glim="FieldError" id={closing() ? undefined : s().id} data-closing={closing() ? "" : undefined} class="glim-field-error">
          <MarkSvg mark={TOAST_MARKS.fail} />
          {s().error}
        </span>
      )}
    </Show>
  );
}
