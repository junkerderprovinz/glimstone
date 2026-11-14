import { Show, type JSX } from "solid-js";

/**
 * Boxes a disabled trigger with a tip in a span that still sees the pointer,
 * since a disabled <button> emits no mouse events. Otherwise the trigger
 * renders as it is.
 */
export function TipWrap(props: { on: boolean; show: () => void; hide: () => void; children: JSX.Element }) {
  const node = props.children;
  return (
    <Show when={props.on} fallback={node}>
      <span class="glim-tip-wrap" onMouseEnter={props.show} onMouseLeave={props.hide}>
        {node}
      </span>
    </Show>
  );
}
