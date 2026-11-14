import { Match, mergeProps, Switch, type JSX } from "solid-js";
import { badgeClassName, hueVars, type BadgeForm, type BadgeShape, type BadgeSize, type BadgeTone, type NotchInset } from "@glimstone/core";
import { IconTipButton } from "./IconTipButton.tsx";
import { css } from "./style.ts";

export type { BadgeForm, BadgeShape, BadgeSize, BadgeTone, NotchInset } from "@glimstone/core";

// The shared status chip; sizes, tones and the heading notch are described in
// badgeClassName() in the core.
//
// `as="button"` and `as="a"` resolve to the same box as a span at the same
// stage. `as="a"` is a real anchor, so copying the link and opening it in a new
// tab work. A numbered heading is two badges, never one split pill: `inFlow`
// keeps the notch's look but drops its positioning, so the caller positions
// its <h2> and lays the badges out side by side.

export interface BadgeProps {
  children: JSX.Element;
  /** Status colour. Defaults to the neutral chip. */
  tone?: BadgeTone;
  /** Size stage; see badgeClassName in the core. A square icon-only badge is always
   *  `"icon"`. */
  size?: BadgeSize;
  /** The corners: rounded, square, pill or circle. Without it they follow the
   *  shape setting. */
  form?: BadgeForm;
  /** @deprecated Use `form`. Only "circle" has an effect: it makes the badge
   *  icon-only. */
  shape?: BadgeShape;
  /** Render as a <button> or a real <a href>, with the same box as a span. */
  as?: "span" | "button" | "a";
  onClick?: () => void;
  disabled?: boolean;
  title?: string;
  /** Accessible name for an icon-only badge whose glyph is aria-hidden. */
  ariaLabel?: string;
  /** `as="a"` only: passed straight through to the underlying <a>. */
  href?: string;
  target?: string;
  rel?: string;
  /** Let content that wraps grow the box instead of overflowing it. */
  wrap?: boolean;
  /** Extra classes, such as `tabular-nums` for a count, or `max-w-full` with
   *  `wrap` in a narrow column. */
  class?: string;
  /** Rainbow position, by the caller's list index among the badges visible at
   *  once. Only `heading` and `active` take it, since the other tones are
   *  status signals. Omit it for the only such badge on a page, which keeps
   *  the single accent. */
  hueIndex?: number;
  /** `as="button"` only. The tooltip and accessible name of an icon-only
   *  button, rendered through IconTipButton; it also makes the badge
   *  icon-only for sizing, and replaces `title` and `ariaLabel`. */
  tip?: string;
  /** Heading notch only: the card's content padding in quarter-rem steps
   *  (`insetStart={5}` for 1.25rem), for the two cases NotchInset describes.
   *  Omit it where the static position already lands right. */
  insetStart?: NotchInset;
  /** Heading notch only: keep the notch's look without positioning it, for
   *  several heading badges that straddle one card edge together inside a
   *  caller-positioned <h2>. `insetStart` is ignored alongside it. A heading
   *  badge in normal flow is a `tone="heading"` badge at another size. */
  inFlow?: boolean;
}

export function Badge(props: BadgeProps) {
  const merged = mergeProps({ tone: "neutral", size: "medium", as: "span" } as const, props);
  // Rainbow never colours text: --accent-ink is not redefined under .glim-hue,
  // so a hued active badge's text keeps the single accent's ink while its
  // background follows the hue.
  const hueOn = () => merged.hueIndex !== undefined && (merged.tone === "heading" || merged.tone === "active");
  const classes = () =>
    [
      hueOn() && "glim-hue",
      // `.glim-notch-hue` drives the card-wide reactive hover in tokens.css, so
      // it is only set on a heading-sized badge.
      hueOn() && merged.size === "heading" && "glim-notch-hue",
      badgeClassName({
        tone: merged.tone,
        size: merged.size,
        form: merged.form,
        shape: merged.shape,
        wrap: merged.wrap,
        iconOnly: merged.tip !== undefined,
        inFlow: merged.inFlow,
        insetStart: merged.insetStart,
        action: merged.as !== "span",
      }),
      merged.class,
    ]
      .filter(Boolean)
      .join(" ");
  const hueStyle = () => (hueOn() ? css(hueVars(merged.hueIndex!)) : undefined);
  const click = () => merged.onClick?.();

  return (
    <Switch
      fallback={
        <span data-glim="Badge" title={merged.title} aria-label={merged.ariaLabel} style={hueStyle()} class={classes()}>
          {merged.children}
        </span>
      }
    >
      <Match when={merged.as === "button" && merged.tip !== undefined}>
        <IconTipButton data-glim="Badge" tip={merged.tip!} onClick={click} disabled={merged.disabled} style={hueStyle()} class={classes()}>
          {merged.children}
        </IconTipButton>
      </Match>
      <Match when={merged.as === "button"}>
        <button
          data-glim="Badge"
          type="button"
          onClick={click}
          disabled={merged.disabled}
          title={merged.title}
          aria-label={merged.ariaLabel}
          style={hueStyle()}
          class={classes()}
        >
          {merged.children}
        </button>
      </Match>
      <Match when={merged.as === "a"}>
        <a data-glim="Badge" href={merged.href} target={merged.target} rel={merged.rel} title={merged.title} aria-label={merged.ariaLabel} style={hueStyle()} class={classes()}>
          {merged.children}
        </a>
      </Match>
    </Switch>
  );
}
