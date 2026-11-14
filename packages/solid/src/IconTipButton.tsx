import { mergeProps, splitProps, type JSX } from "solid-js";
import { Dynamic } from "solid-js/web";
import { TipWrap } from "./TipWrap.tsx";
import { useTipBubble } from "./useTipBubble.tsx";

// An icon-only <button> whose accessible name and hover or focus explanation is
// a `.glim-bubble` tooltip rather than the native `title=` balloon. `tip` is
// required because an icon-only button has no other way to say what it does.
//
// Unlike Button, this control has no label to hide: a bare glyph in a box the
// caller sizes, with no width stage, no tone fill and no place in the label
// mode engine. The other props of a <button> go to the button.
export interface IconTipButtonProps extends Omit<JSX.ButtonHTMLAttributes<HTMLButtonElement>, "children" | "type" | "class" | "disabled" | "style"> {
  /** The hover and focus explanation, and the button's `aria-label`. */
  tip: string;
  disabled?: boolean;
  class?: string;
  /** `aria-pressed` for a trigger that toggles rather than acts once. Omitted,
   *  no attribute is rendered. */
  ariaPressed?: boolean;
  /** `aria-expanded` for a trigger that opens a disclosure panel. Omitted, no
   *  attribute is rendered. */
  ariaExpanded?: boolean;
  /** Inline style, so a hued Badge can set its `--item-hue*` properties. */
  style?: JSX.CSSProperties | string;
  children: JSX.Element;
  /** Makes it a link. A disabled one stays a disabled button. */
  href?: string;
  type?: "button" | "submit";
}

export function IconTipButton(props: IconTipButtonProps) {
  const merged = mergeProps({ type: "button" } as const, props);
  const [own, rest] = splitProps(merged, ["tip", "disabled", "class", "style", "children", "href", "type", "ariaPressed", "ariaExpanded", "ref"]);
  const tooltip = useTipBubble(() => own.tip, () => !!own.disabled);
  const link = () => !!own.href && !own.disabled;
  const attach = (el: HTMLButtonElement) => {
    tooltip.ref(el);
    if (typeof own.ref === "function") own.ref(el);
  };

  return (
    <>
      <TipWrap on={!!own.disabled && !!own.tip} show={tooltip.show} hide={tooltip.hide}>
        <Dynamic
          component={link() ? "a" : "button"}
          data-glim="IconTipButton"
          {...rest}
          href={link() ? own.href : undefined}
          type={link() ? undefined : own.type}
          disabled={link() ? undefined : own.disabled}
          ref={attach}
          aria-label={own.tip}
          aria-pressed={own.ariaPressed}
          aria-expanded={own.ariaExpanded}
          aria-describedby={tooltip.describedBy()}
          {...tooltip.handlers}
          class={own.class}
          style={own.style}
        >
          {own.children}
        </Dynamic>
      </TipWrap>
      {tooltip.bubble}
    </>
  );
}
