import { createMemo, createRenderEffect, createSignal, mergeProps, onCleanup, Show, splitProps, type JSX } from "solid-js";
import { Dynamic } from "solid-js/web";
import { buttonView, mediaMatches, narrowerThan, subscribeMedia, takePageHue, type ButtonSize, type ButtonTone, type ButtonVariant, type WidthStage } from "@glimstone/core";
import { useLabelMode } from "./engines.ts";
import { TipWrap } from "./TipWrap.tsx";
import { useTipBubble } from "./useTipBubble.tsx";
import { BusyRing } from "./BusyRing.tsx";
import { glyphFor, IconClose } from "./glyphs.tsx";
import { css } from "./style.ts";

export type { ButtonSize, ButtonTone, ButtonVariant } from "@glimstone/core";

// The one clickable control; what it shows and how wide it is come from
// buttonView() in the core. The other props of a <button> go to the element.

export interface ButtonProps extends Omit<JSX.ButtonHTMLAttributes<HTMLButtonElement>, "children" | "class" | "disabled" | "onClick" | "title" | "type" | "autofocus" | "ref"> {
  /** The button's words, present in every mode: visible, or hidden but
   *  announced and shown as the tooltip. Keep it stable, since a label that
   *  changes while the button works would resize it; put changing state in
   *  `title`. */
  label: string;
  /** The translation key behind `label`, or `null` when the label is data such
   *  as a path. It picks the glyph by meaning (glyphFor), so the same verb
   *  wears the same symbol everywhere; an explicit `glyph` wins. */
  labelKey: string | null;
  /** Optional icon, overriding whatever `labelKey` would have chosen. Without
   *  either, glyph mode shows this button's text instead of an empty box. */
  glyph?: JSX.Element;
  onClick?: () => void;
  tone?: ButtonTone;
  /** "chip" inside a pill, "icon" for a row action; see ButtonVariant. */
  variant?: ButtonVariant;
  disabled?: boolean;
  /** Makes it a link with the button's look. A disabled one stays a disabled button. */
  href?: string;
  /** What stands before the glyph, such as a count. */
  before?: JSX.Element;
  /** What stands after the words, such as a key cap. */
  after?: JSX.Element;
  type?: "button" | "submit";
  /** Extra explanation, and the place for anything that changes: the running
   *  state, or why the button is unavailable. It shows in the hover and focus
   *  bubble, joined with the label where the label is hidden, and still
   *  reaches a disabled button. */
  title?: string;
  /** This button's own rainbow position, for a colour different from its card's. */
  hueIndex?: number;
  /** Receives the underlying <button>, so a dialog can move focus to it. */
  ref?: HTMLButtonElement | ((el: HTMLButtonElement) => void);
  /** Shows the busy ring in place of the glyph, at once. Separate from `disabled`, since a
   *  caller may want one without the other. */
  busy?: boolean;
  /** For a dialog that opens with focus on one of its buttons. */
  autofocus?: boolean;
  /** Forces a width stage, for two buttons in different components that should
   *  match: pass `groupStage([labelA, labelB])` to both. */
  stage?: WidthStage;
  /** Its glyph alone in a square in every label mode, where the words have no
   *  room. The label stays the name and the bubble. */
  compact?: boolean;
  /** Turns compact while the window is narrower than this many pixels. */
  compactBelow?: number;
  size?: ButtonSize;
  /** Keeps the label visible in every mode, for a label that is content rather than a verb. */
  keepLabel?: boolean;
  class?: string;
}

export function Button(props: ButtonProps) {
  const merged = mergeProps({ tone: "neutral", variant: "default", disabled: false, type: "button", class: "", busy: false, autofocus: false, keepLabel: false, compact: false } as const, props);
  const [own, rest] = splitProps(merged, [
    "label", "labelKey", "glyph", "onClick", "tone", "variant", "disabled", "type", "class", "title", "hueIndex", "busy",
    "autofocus", "stage", "keepLabel", "compact", "compactBelow", "size", "href", "before", "after", "ref",
  ]);
  const mode = useLabelMode("buttons");
  const [narrow, setNarrow] = createSignal(false);
  createRenderEffect(() => {
    const below = own.compactBelow;
    if (below === undefined) return setNarrow(false);
    const query = narrowerThan(below);
    setNarrow(mediaMatches(query));
    onCleanup(subscribeMedia(query, () => setNarrow(mediaMatches(query))));
  });
  // A chip always closes, so it has a glyph even when no call site passes one.
  const resolved = createMemo(
    () => own.glyph ?? (own.labelKey ? glyphFor(own.labelKey) : undefined) ?? (own.variant === "chip" ? <IconClose /> : undefined),
  );
  const view = createMemo(() =>
    buttonView({
      mode: mode(),
      label: own.label,
      hasGlyph: !!resolved() || own.busy,
      tone: own.tone,
      variant: own.variant,
      disabled: own.disabled,
      keepLabel: own.keepLabel,
      compact: own.compact || narrow(),
      size: own.size,
      title: own.title,
      hueIndex: own.hueIndex,
      stage: own.stage,
    }),
  );
  const tooltip = useTipBubble(() => view().tip, () => own.disabled);
  const link = () => !!own.href && !own.disabled;
  const attach = (el: HTMLButtonElement) => {
    tooltip.ref(el);
    if (typeof own.ref === "function") own.ref(el);
  };

  return (
    <>
      <TipWrap on={own.disabled && !!view().tip} show={tooltip.show} hide={tooltip.hide}>
        <Dynamic
          component={link() ? "a" : "button"}
          data-glim="Button"
          {...rest}
          href={link() ? own.href : undefined}
          type={link() ? undefined : own.type}
          disabled={link() ? undefined : own.disabled}
          autofocus={link() ? undefined : own.autofocus}
          ref={attach}
          onClick={() => own.onClick?.()}
          aria-busy={own.busy || undefined}
          aria-describedby={tooltip.describedBy()}
          onMouseEnter={(e: MouseEvent) => {
            if (view().pageHue) takePageHue(e.currentTarget as HTMLElement);
            tooltip.show();
          }}
          onMouseLeave={tooltip.hide}
          onFocus={(e: FocusEvent) => {
            if (view().pageHue) takePageHue(e.currentTarget as HTMLElement);
            tooltip.handlers.onFocus();
          }}
          onBlur={tooltip.hide}
          style={css(view().style)}
          class={`${view().className} ${own.class}`.trim()}
        >
          {own.before}
          <Show when={view().showGlyph}>
            <span class="glim-btn-glyph">
              <Show when={own.busy} fallback={resolved()}>
                <BusyRing size="small" delay={0} />
              </Show>
            </span>
          </Show>
          <span class={view().labelClass}>{own.label}</span>
          {own.after}
        </Dynamic>
      </TipWrap>
      {tooltip.bubble}
    </>
  );
}
