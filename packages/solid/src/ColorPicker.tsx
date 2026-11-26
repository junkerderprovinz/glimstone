import { createEffect, createSignal, For, mergeProps, on, onCleanup, onMount, Show } from "solid-js";
import {
  canPickFromScreen,
  COLOR_NAMES_DE,
  COLOR_PICKER_TEXT,
  colorPicker,
  floatColorPicker,
  MARKS,
  nearestColorName,
  normalizeHex,
  pickFromScreen,
  rainbowSwatches,
  type ColorName,
  type ColorPickerPanelText,
} from "@glimstone/core";
import { Button } from "./Button.tsx";
import { IconButton } from "./IconButton.tsx";
import { IconCheck, MarkSvg } from "./glyphs.tsx";
import { Lift } from "./Lift.tsx";

export type { ColorName, ColorPickerPanelText } from "@glimstone/core";

// The colour picker as a component: the core's square and hue bar, a preview
// with the name the colour proposes, a row of ready colours, the hex field, an
// eyedropper where the browser has one, and Apply. Nothing changes
// until Apply, so a caller can show the colour live through onInput and still
// keep the old one when the picker closes without it.

export interface ColorPickerProps {
  /** The colour the picker starts from, as `#rrggbb`. */
  value: string;
  /** Apply or Enter, with the colour and the name it proposes. */
  onApply: (hex: string, name: string | null) => void;
  /** Every step of a drag, a key or a valid hex, for a live preview. */
  onInput?: (hex: string) => void;
  /** The control that opened the picker. With it the picker floats beside it
   *  and closes on Escape, on a click beside it and after Apply. */
  anchor?: HTMLElement | null;
  /** Called when a floating picker closes, however it closes. */
  onClose?: () => void;
  /** The names a colour is matched against, nearest in OKLab. `false` shows none. */
  names?: readonly ColorName[] | false;
  /** The ready colours under the hue bar, as `#rrggbb`. The page's rainbow unless given, and `false` shows none. */
  swatches?: string[] | false;
  /** The words, read when the picker opens. */
  text?: Partial<ColorPickerPanelText>;
  class?: string;
}

export function ColorPicker(props: ColorPickerProps) {
  const merged = mergeProps({ names: COLOR_NAMES_DE }, props);
  const words = { ...COLOR_PICKER_TEXT, ...merged.text };
  const [draft, setDraft] = createSignal(normalizeHex(merged.value) ?? "#000000");
  const [typed, setTyped] = createSignal(draft());
  const [ready, setReady] = createSignal<string[]>([]);
  const dropper = canPickFromScreen();
  const widget = colorPicker(
    draft(),
    (hex) => {
      setDraft(hex);
      setTyped(hex);
      merged.onInput?.(hex);
    },
    { text: words },
  );
  let panel!: HTMLDivElement;
  let host!: HTMLDivElement;

  onMount(() => {
    host.appendChild(widget.el);
    onCleanup(() => widget.el.remove());
  });

  createEffect(
    on(
      () => merged.value,
      (value) => {
        const hex = normalizeHex(value);
        if (!hex) return;
        setDraft(hex);
        setTyped(hex);
        widget.setValue(hex);
      },
    ),
  );

  createEffect(() => {
    const anchor = merged.anchor;
    if (!anchor) return;
    onCleanup(floatColorPicker(panel, anchor, () => merged.onClose?.()));
    widget.focus();
  });

  createEffect(() => {
    const given = merged.swatches;
    setReady(given === false ? [] : (given ?? rainbowSwatches()).flatMap((c) => normalizeHex(c) ?? []));
  });

  /** A colour from a ready swatch or from the screen, taken as a drag on the square would be. */
  function take(hex: string) {
    setDraft(hex);
    setTyped(hex);
    widget.setValue(hex);
    merged.onInput?.(hex);
  }

  const name = () => (merged.names === false ? null : nearestColorName(draft(), merged.names));

  function apply() {
    merged.onApply(draft(), name());
    if (merged.anchor) {
      merged.anchor.focus();
      merged.onClose?.();
    }
  }

  function onKeyDown(e: KeyboardEvent) {
    if (e.key === "Enter" && !(e.target instanceof HTMLButtonElement)) {
      e.preventDefault();
      apply();
    }
  }

  function onTyped(e: InputEvent & { currentTarget: HTMLInputElement }) {
    setTyped(e.currentTarget.value);
    const hex = normalizeHex(e.currentTarget.value);
    if (!hex) return;
    setDraft(hex);
    widget.setValue(hex);
    merged.onInput?.(hex);
  }

  const body = (
    <div
      data-glim="ColorPicker"
      ref={panel}
      class={["glim-picker-panel", merged.anchor && "glim-picker-panel--float", merged.class].filter(Boolean).join(" ")}
      style={{ "--glim-picker-colour": draft() }}
      onKeyDown={onKeyDown}
    >
      <div ref={host} style={{ display: "contents" }} />
      <Show when={ready().length > 0}>
        <div role="group" aria-label={words.swatches} class="glim-picker-swatches">
          <For each={ready()}>
            {(hex) => (
              <button
                type="button"
                aria-label={hex}
                aria-pressed={hex === draft()}
                class="glim-picker-preset"
                style={{ "--glim-preset": hex }}
                onClick={() => take(hex)}
              />
            )}
          </For>
        </div>
      </Show>
      <div class="glim-picker-foot">
        <span class="glim-picker-swatch" aria-hidden="true" />
        <Show when={name() !== null}>
          <span class="glim-picker-name">{name()}</span>
        </Show>
        <input class="glim-picker-hex" value={typed()} maxlength={7} spellcheck={false} aria-label={words.hex} onInput={onTyped} />
        <Show when={dropper}>
          <IconButton
            tip={words.eyedropper}
            glyph={<MarkSvg mark={MARKS.eyedropper} class="glim-mark" />}
            onClick={async () => {
              const hex = await pickFromScreen();
              if (hex) take(hex);
            }}
          />
        </Show>
      </div>
      <div class="glim-picker-actions">
        <Button label={words.apply} labelKey="apply" glyph={<IconCheck />} tone="accent" onClick={apply} />
      </div>
    </div>
  );
  return (
    <Show when={merged.anchor} fallback={body}>
      <Lift>{body}</Lift>
    </Show>
  );
}
