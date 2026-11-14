import { Show, splitProps, type JSX } from "solid-js";
import { takePageHue } from "@glimstone/core";
import { IconTipButton } from "./IconTipButton.tsx";

// A glyph in a square in every label mode, for a row or a dense toolbar that
// keeps its text. Everything else with one action is a Button with
// variant="icon", which follows the label mode. The other props of a <button>
// go to the button.

export interface IconButtonProps extends Omit<JSX.ButtonHTMLAttributes<HTMLButtonElement>, "children" | "type" | "class" | "disabled"> {
  /** The hover and focus explanation, and the button's accessible name. */
  tip: string;
  glyph: JSX.Element;
  /** Makes it a link in the same square. */
  href?: string;
  /** Set for a button that stays on or off: it says so, and the accent washes it while it is on. */
  pressed?: boolean;
  /** Draws no button and keeps its square, so the others of a row stay where they are. */
  absent?: boolean;
  disabled?: boolean;
  type?: "button" | "submit";
  class?: string;
}

const reach = (e: Event) => takePageHue(e.currentTarget as HTMLElement);

export function IconButton(props: IconButtonProps) {
  const [own, rest] = splitProps(props, ["tip", "glyph", "pressed", "absent", "class"]);
  return (
    <Show when={!own.absent} fallback={<span data-glim="IconButton" class="glim-icon-btn-gap" aria-hidden="true" />}>
      <IconTipButton
        data-glim="IconButton"
        {...rest}
        tip={own.tip}
        ariaPressed={own.pressed}
        class={`glim-btn-bare glim-icon-btn ${own.class ?? ""}`.trim()}
        onPointerEnter={reach}
        onFocusIn={reach}
      >
        {own.glyph}
      </IconTipButton>
    </Show>
  );
}
