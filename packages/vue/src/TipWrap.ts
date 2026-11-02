import { h, type FunctionalComponent } from "vue";

/**
 * Boxes a disabled trigger with a tip in a span that still sees the pointer,
 * since a disabled <button> emits no mouse events. Otherwise the trigger
 * renders as it is.
 */
export const TipWrap: FunctionalComponent<{ on: boolean; show: () => void; hide: () => void }> = (props, { slots }) =>
  props.on
    ? h("span", { class: "glim-tip-wrap", onMouseenter: props.show, onMouseleave: props.hide }, slots.default?.())
    : slots.default?.();

TipWrap.props = ["on", "show", "hide"];
