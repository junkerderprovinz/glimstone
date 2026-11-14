<script lang="ts" module>
  import type { ColorName, ColorPickerPanelText } from "@glimstone/core";

  export type { ColorName, ColorPickerPanelText } from "@glimstone/core";

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
    /** The words, read when the picker opens. */
    text?: Partial<ColorPickerPanelText>;
    class?: string;
  }
</script>

<script lang="ts">
  import { COLOR_NAMES_DE, COLOR_PICKER_TEXT, colorPicker, floatColorPicker, nearestColorName, normalizeHex } from "@glimstone/core";
  import Button from "./Button.svelte";
  import { IconCheck } from "./glyphs.js";
  import { lift } from "./lift.js";

  // The colour picker as a component: the core's square and hue bar, a preview
  // with the name the colour proposes, the hex field and Apply. Nothing changes
  // until Apply, so a caller can show the colour live through onInput and still
  // keep the old one when the picker closes without it.
  let { value, onApply, onInput, anchor, onClose, names = COLOR_NAMES_DE, text, class: className }: ColorPickerProps = $props();

  // The words and the colour are read once, when the picker opens.
  // svelte-ignore state_referenced_locally
  const words = { ...COLOR_PICKER_TEXT, ...text };
  // svelte-ignore state_referenced_locally
  const start = normalizeHex(value) ?? "#000000";
  let draft = $state(start);
  let typed = $state(start);
  const widget = colorPicker(
    start,
    (hex) => {
      draft = hex;
      typed = hex;
      onInput?.(hex);
    },
    { text: words },
  );
  let panel: HTMLDivElement;
  let host: HTMLDivElement;

  $effect(() => {
    host.appendChild(widget.el);
    return () => widget.el.remove();
  });

  $effect.pre(() => {
    const hex = normalizeHex(value);
    if (!hex) return;
    draft = hex;
    typed = hex;
    widget.setValue(hex);
  });

  $effect(() => {
    if (!anchor) return;
    const done = floatColorPicker(panel, anchor, () => onClose?.());
    widget.focus();
    return done;
  });

  const name = $derived(names === false ? null : nearestColorName(draft, names));

  function apply() {
    onApply(draft, name);
    if (anchor) {
      anchor.focus();
      onClose?.();
    }
  }

  function onKeyDown(e: KeyboardEvent) {
    if (e.key === "Enter" && !(e.target instanceof HTMLButtonElement)) {
      e.preventDefault();
      apply();
    }
  }

  function onTyped(e: Event & { currentTarget: HTMLInputElement }) {
    typed = e.currentTarget.value;
    const hex = normalizeHex(typed);
    if (!hex) return;
    draft = hex;
    widget.setValue(hex);
    onInput?.(hex);
  }
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  {@attach anchor ? lift : undefined}
  data-glim="ColorPicker"
  bind:this={panel}
  class={["glim-picker-panel", anchor && "glim-picker-panel--float", className].filter(Boolean).join(" ")}
  style:--glim-picker-colour={draft}
  onkeydown={onKeyDown}
>
  <div bind:this={host} style="display: contents"></div>
  <div class="glim-picker-foot">
    <span class="glim-picker-swatch" aria-hidden="true"></span>
    {#if name !== null}<span class="glim-picker-name">{name}</span>{/if}
    <input class="glim-picker-hex" value={typed} maxlength={7} spellcheck={false} aria-label={words.hex} oninput={onTyped} />
  </div>
  <div class="glim-picker-actions">
    <Button label={words.apply} labelKey="apply" glyph={IconCheck} tone="accent" onClick={apply} />
  </div>
</div>
