import type { FocusEvent, MouseEvent, ReactNode, Ref } from "react";
import { buttonView, takePageHue, type ButtonTone, type ButtonVariant, type WidthStage } from "@glimstone/core";
import { useLabelMode } from "./useLabelMode";
import { useTipBubble } from "./useTipBubble";
import { glyphFor, IconClose } from "./glyphs";

export type { ButtonTone, ButtonVariant } from "@glimstone/core";

// The one clickable control; what it shows and how wide it is come from
// buttonView() in the core.

export function Button({
  label,
  labelKey,
  glyph,
  onClick,
  tone = "neutral",
  variant = "default",
  disabled = false,
  type = "button",
  className = "",
  title,
  hueIndex,
  busy = false,
  autoFocus = false,
  stage: stageOverride,
  keepLabel = false,
  ref,
}: {
  /** The button's words, present in every mode: visible, or hidden but
   *  announced and shown as the tooltip. Keep it stable, since a label that
   *  changes while the button works would resize it; put changing state in
   *  `title`. */
  label: string;
  /** The translation key behind `label`, or `null` when the label is data such
   *  as a path. It picks the glyph by meaning (glyphFor), so the same verb
   *  wears the same symbol everywhere; an explicit `glyph` wins.
   *
   *  It is required so every call site answers "this key" or "none" instead of
   *  silently falling back to text in glyph mode. When the label branches, the
   *  key branches with it. */
  labelKey: string | null;
  /** Optional icon, overriding whatever `labelKey` would have chosen. Without
   *  either, glyph mode shows this button's text instead of an empty box. */
  glyph?: ReactNode;
  onClick?: () => void;
  tone?: ButtonTone;
  /** "chip" inside a pill, "icon" for a row action; see ButtonVariant. */
  variant?: ButtonVariant;
  disabled?: boolean;
  type?: "button" | "submit";
  className?: string;
  /** Extra explanation, and the place for anything that changes: the running
   *  state, or why the button is unavailable. It shows in the hover and focus
   *  bubble, joined with the label where the label is hidden, and still
   *  reaches a disabled button through useTipBubble's `wrap`. */
  title?: string;
  /** This button's own rainbow position, as on Badge. Usually unnecessary: a
   *  Card with a `hueIndex` rebinds `--accent` for everything inside it, and
   *  passing the card's own index changes nothing. Pass it only for a
   *  colour different from the card's, such as a row that owns its position. */
  hueIndex?: number;
  /** Forwarded to the underlying <button>, so a dialog can move focus to it. */
  ref?: Ref<HTMLButtonElement>;
  /** Shows a spinner in place of the glyph. Separate from `disabled`, since a
   *  caller may want one without the other. */
  busy?: boolean;
  /** For a dialog that opens with focus on one of its buttons. */
  autoFocus?: boolean;
  /** Forces a width stage instead of deriving one from the label, for two
   *  buttons rendered by different components that should match: pass
   *  `groupStage([labelA, labelB])` to both. Use it only for such a pair.
   *  Ignored in glyph and reactive mode, which take no stage. */
  stage?: WidthStage;
  /** Keeps the label visible in every mode, for a button whose label is
   *  content rather than a verb, such as a directory row in a folder browser.
   *  The glyph still shows beside it. */
  keepLabel?: boolean;
}) {
  const mode = useLabelMode("buttons");
  // A chip always closes, so it has a glyph even when no call site passes one.
  const resolved =
    glyph ?? (labelKey ? glyphFor(labelKey) : undefined) ?? (variant === "chip" ? <IconClose /> : undefined);
  const view = buttonView({
    mode,
    label,
    hasGlyph: !!resolved || busy,
    tone,
    variant,
    disabled,
    keepLabel,
    title,
    hueIndex,
    stage: stageOverride,
  });
  const tooltip = useTipBubble(view.tip, disabled);
  const handlers = view.pageHue
    ? {
        ...tooltip.handlers,
        onMouseEnter: (e: MouseEvent<HTMLElement>) => {
          takePageHue(e.currentTarget);
          tooltip.handlers.onMouseEnter();
        },
        onFocus: (e: FocusEvent<HTMLElement>) => {
          takePageHue(e.currentTarget);
          tooltip.handlers.onFocus();
        },
      }
    : tooltip.handlers;

  return (
    <>
      {/* `wrap` boxes only a disabled button with a tip, since a disabled
          <button> emits no mouse events. */}
      {tooltip.wrap(
        <button
          ref={mergeRefs(ref, tooltip.ref)}
          type={type}
          onClick={onClick}
          disabled={disabled}
          autoFocus={autoFocus}
          aria-busy={busy || undefined}
          aria-describedby={tooltip.describedBy}
          {...handlers}
          style={view.style}
          className={`${view.className} ${className}`.trim()}
        >
          {view.showGlyph && (
            <span className="glim-btn-glyph">
              {busy ? <span className="glim-spinner" /> : resolved}
            </span>
          )}
          <span className={view.labelClass}>{label}</span>
        </button>,
      )}
      {tooltip.bubble}
    </>
  );
}

/**
 * Feeds one element to both the caller's `ref`, a callback or an object, and
 * the tooltip's, which places the bubble against it.
 */
function mergeRefs(
  outer: Ref<HTMLButtonElement> | undefined,
  inner: (el: HTMLElement | null) => void,
): (el: HTMLButtonElement | null) => void {
  return (el) => {
    inner(el);
    if (typeof outer === "function") outer(el);
    else if (outer) outer.current = el;
  };
}
