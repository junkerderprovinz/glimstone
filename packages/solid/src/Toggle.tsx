import { createUniqueId, mergeProps, onCleanup, Show, splitProps, type JSX } from "solid-js";
import { shake } from "@glimstone/core";
import { useFieldName } from "./fieldName.ts";
import { useTipBubble } from "./useTipBubble.tsx";

// The shared switch control.
//
// The label is always the accessible name; `hideLabel` only drops the visible
// caption. Indenting a sub-switch is the caller's layout, per the design
// language's "flush, no indent" rule. The other props of a <button> go to the
// switch, which is what a script asks for its state; `class` and `style` go to
// the frame, which carries the row's layout. Inside a FieldRow the row names
// the switch and draws the words.

export interface ToggleProps extends Omit<JSX.ButtonHTMLAttributes<HTMLButtonElement>, "onChange" | "children" | "type" | "role" | "class" | "style"> {
  /** Current on/off state. */
  checked: boolean;
  /** Called with the flipped value when the switch is activated. */
  onChange: (next: boolean) => void;
  /** Always used as the accessible name; shown as visible text unless hideLabel. Inside a FieldRow the row gives it. */
  label?: string;
  /** Suppress the visible caption; the text stays as aria-label. Use it only
   *  when the caller draws the same text right next to the switch, never
   *  because a card title further up already says it. */
  hideLabel?: boolean;
  disabled?: boolean;
  /** Why the switch cannot be flipped right now, as OLED while Light is chosen
   *  (`oledRefusal`). It keeps its state and its focus, its track dims, a press
   *  shakes it, and the reason is its bubble, or a line under the row on a
   *  touch screen. */
  refused?: string;
  /** Extra classes for the outer wrapper (e.g. row-alignment nudges). */
  class?: string;
  style?: JSX.CSSProperties | string;
}

export function Toggle(props: ToggleProps) {
  const merged = mergeProps({ hideLabel: false }, props);
  const [own, rest] = splitProps(merged, ["checked", "onChange", "label", "hideLabel", "disabled", "refused", "class", "style", "onClick"]);
  const name = useFieldName(() => own.label);
  const tip = useTipBubble(() => own.refused);
  const reason = createUniqueId();
  let frame!: HTMLSpanElement;
  let stopShake: (() => void) | undefined;
  onCleanup(() => stopShake?.());

  const press: JSX.EventHandler<HTMLButtonElement, MouseEvent> = (e) => {
    if (typeof own.onClick === "function") own.onClick(e);
    if (!own.refused) return own.onChange(!own.checked);
    stopShake?.();
    stopShake = shake(frame);
  };

  return (
    <>
      <span data-glim="Toggle" ref={frame} class={`glim-toggle${own.class ? ` ${own.class}` : ""}`} style={own.style}>
        <Show when={own.label !== undefined && !own.hideLabel}>
          <span class="glim-toggle-label">{own.label}</span>
        </Show>
        {/* No `title=`: the label is always visible beside the switch, so a
            tooltip would only repeat it. A refused switch's bubble says why. */}
        <button
          {...rest}
          ref={tip.ref}
          type="button"
          role="switch"
          aria-checked={own.checked}
          aria-label={name()}
          aria-disabled={own.refused ? true : undefined}
          aria-describedby={own.refused ? reason : rest["aria-describedby"]}
          disabled={own.disabled}
          onClick={press}
          onMouseEnter={() => own.refused && tip.show()}
          onMouseLeave={tip.hide}
          onFocus={() => own.refused && tip.handlers.onFocus()}
          onBlur={tip.hide}
          class="glim-toggle-track"
        >
          <span class="glim-toggle-thumb" />
        </button>
      </span>
      <Show when={own.refused}>
        <span id={reason} class="glim-toggle-refusal">
          {own.refused}
        </span>
      </Show>
      {tip.bubble}
    </>
  );
}
