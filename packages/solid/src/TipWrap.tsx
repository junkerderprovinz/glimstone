import { children, createEffect, Show, type JSX } from "solid-js";

/**
 * Boxes a disabled trigger with a tip in a span that still sees the pointer,
 * since a disabled <button> emits no mouse events. Otherwise the trigger
 * renders as it is.
 */
export function TipWrap(props: { on: boolean; show: () => void; hide: () => void; children: JSX.Element }) {
  const node = children(() => props.children);
  return (
    <Show when={props.on} fallback={node()}>
      {(() => {
        const span = (<span class="glim-tip-wrap" onMouseEnter={props.show} onMouseLeave={props.hide} />) as HTMLSpanElement;
        // The trigger moves in once the span has taken its place. Moved in at
        // once, it would sit inside the span the parent is about to insert in
        // its stead, and the parent would lose both.
        createEffect(() => span.replaceChildren(...(node.toArray() as Node[])));
        return span;
      })()}
    </Show>
  );
}
