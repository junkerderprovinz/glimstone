import { mergeProps, Show } from "solid-js";
import { IconCheck } from "./glyphs.tsx";

// The checkbox, for the places a box stands instead of a switch (rule 39):
// "Don't show again" under a notice, and choices that are applied together,
// such as which columns a list shows. Every setting is a Toggle. It is a
// button for its look, and like a native checkbox only Space flips it.

export interface CheckboxProps {
  checked: boolean;
  /** Called with the flipped value when the box is activated. */
  onChange: (next: boolean) => void;
  /** Always the accessible name; shown beside the box unless hideLabel. */
  label: string;
  /** For a grid whose row and column headings already say it, such as permissions. */
  hideLabel?: boolean;
  /** The box alone, without the frame and its hover ground, for a row or a cell of a dense list. Hides the label. */
  slim?: boolean;
  disabled?: boolean;
  class?: string;
}

export function Checkbox(props: CheckboxProps) {
  const merged = mergeProps({ hideLabel: false, slim: false }, props);
  const bare = () => merged.hideLabel || merged.slim;
  return (
    <button
      data-glim="Checkbox"
      type="button"
      role="checkbox"
      aria-checked={merged.checked}
      aria-label={bare() ? merged.label : undefined}
      disabled={merged.disabled}
      onClick={() => merged.onChange(!merged.checked)}
      onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}
      class={["glim-checkbox", merged.slim && "glim-checkbox--slim", merged.class].filter(Boolean).join(" ")}
    >
      <span class="glim-checkbox-box" aria-hidden="true">
        <IconCheck />
      </span>
      <Show when={!bare()}>
        <span>{merged.label}</span>
      </Show>
    </button>
  );
}
