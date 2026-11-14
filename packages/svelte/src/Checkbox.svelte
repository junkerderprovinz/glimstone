<script lang="ts" module>
  export interface CheckboxProps {
    /** The state, bound with `bind:checked`. */
    checked: boolean;
    /** Called with the flipped value when the box is activated. */
    onChange?: (next: boolean) => void;
    /** Always the accessible name; shown beside the box unless hideLabel. */
    label: string;
    /** For a grid whose row and column headings already say it, such as permissions. */
    hideLabel?: boolean;
    /** The box alone, without the frame and its hover ground, for a row or a cell of a dense list. Hides the label. */
    slim?: boolean;
    disabled?: boolean;
    class?: string;
  }
</script>

<script lang="ts">
  import { IconCheck } from "./glyphs.js";

  // The checkbox, for the places a box stands instead of a switch (rule 39):
  // "Don't show again" under a notice, and choices that are applied together,
  // such as which columns a list shows. Every setting is a Toggle. It is a
  // button for its look, and like a native checkbox only Space flips it.
  let { checked = $bindable(), onChange, label, hideLabel = false, slim = false, disabled, class: className }: CheckboxProps = $props();

  const bare = $derived(hideLabel || slim);

  function flip() {
    checked = !checked;
    onChange?.(checked);
  }
</script>

<button
  data-glim="Checkbox"
  type="button"
  role="checkbox"
  aria-checked={checked}
  aria-label={bare ? label : undefined}
  {disabled}
  onclick={flip}
  onkeydown={(e) => e.key === "Enter" && e.preventDefault()}
  class={["glim-checkbox", slim && "glim-checkbox--slim", className].filter(Boolean).join(" ")}
>
  <span class="glim-checkbox-box" aria-hidden="true">{@render IconCheck()}</span>
  {#if !bare}<span>{label}</span>{/if}
</button>
