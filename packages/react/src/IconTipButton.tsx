import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from "react";
import { useTipBubble } from "./useTipBubble.tsx";

// An icon-only <button> whose accessible name and hover or focus explanation is
// a `.glim-bubble` tooltip rather than the native `title=` balloon. `tip` is
// required because an icon-only button has no other way to say what it does.
//
// Unlike Button, this control has no label to hide: a bare glyph in a box the
// caller sizes, with no width stage, no tone fill and no place in the label
// mode engine. The other props of a <button> go to the button.
export interface IconTipButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "type"> {
  /** The hover and focus explanation, and the button's `aria-label`. */
  tip: string;
  disabled?: boolean;
  className?: string;
  /** `aria-pressed` for a trigger that toggles rather than acts once. Omitted,
   *  no attribute is rendered. */
  ariaPressed?: boolean;
  /** `aria-expanded` for a trigger that opens a disclosure panel. Omitted, no
   *  attribute is rendered. */
  ariaExpanded?: boolean;
  /** Inline style, so a hued Badge can set its `--item-hue*` properties. */
  style?: CSSProperties;
  children: ReactNode;
  type?: "button" | "submit";
}

export function IconTipButton({ tip, disabled, className, style, children, type = "button", ariaPressed, ariaExpanded, ...rest }: IconTipButtonProps) {
  const tooltip = useTipBubble(tip, disabled);

  return (
    <>
      {tooltip.wrap(
        <button
          {...rest}
          ref={tooltip.ref}
          type={type}
          disabled={disabled}
          aria-label={tip}
          aria-pressed={ariaPressed}
          aria-expanded={ariaExpanded}
          aria-describedby={tooltip.describedBy}
          {...tooltip.handlers}
          className={className}
          style={style}
        >
          {children}
        </button>,
      )}
      {tooltip.bubble}
    </>
  );
}
