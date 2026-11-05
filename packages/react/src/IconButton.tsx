import type { ButtonHTMLAttributes, ReactNode, SyntheticEvent } from "react";
import { takePageHue } from "@glimstone/core";
import { IconTipButton } from "./IconTipButton.tsx";

// A glyph in a square in every label mode, for a row or a dense toolbar that
// keeps its text. Everything else with one action is a Button with
// variant="icon", which follows the label mode. The other props of a <button>
// go to the button.

export interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "type"> {
  /** The hover and focus explanation, and the button's accessible name. */
  tip: string;
  glyph: ReactNode;
  /** Makes it a link in the same square. */
  href?: string;
  /** Set for a button that stays on or off: it says so, and the accent washes it while it is on. */
  pressed?: boolean;
  disabled?: boolean;
  type?: "button" | "submit";
  className?: string;
}

const reach = (e: SyntheticEvent<HTMLElement>) => takePageHue(e.currentTarget);

export function IconButton({ tip, glyph, pressed, className, ...rest }: IconButtonProps) {
  return (
    <IconTipButton
      {...rest}
      tip={tip}
      ariaPressed={pressed}
      className={`glim-btn-bare glim-icon-btn ${className ?? ""}`.trim()}
      onPointerEnter={reach}
      onFocusCapture={reach}
    >
      {glyph}
    </IconTipButton>
  );
}
