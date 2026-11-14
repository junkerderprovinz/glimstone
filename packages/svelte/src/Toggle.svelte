<script lang="ts" module>
  import type { HTMLButtonAttributes } from "svelte/elements";

  export interface ToggleProps extends Omit<HTMLButtonAttributes, "onchange" | "children" | "type" | "role" | "class" | "style"> {
    /** Current on/off state, bound with `bind:checked`. */
    checked: boolean;
    /** Called with the flipped value when the switch is activated. */
    onChange?: (next: boolean) => void;
    /** Always used as the accessible name; shown as visible text unless hideLabel. Inside a FieldRow the row gives it. */
    label?: string;
    /** Suppress the visible caption; the text stays as aria-label. Use it only
     *  when the caller draws the same text right next to the switch, never
     *  because a card title further up already says it. */
    hideLabel?: boolean;
    disabled?: boolean;
    /** Why the switch cannot be flipped right now, as OLED while Light is chosen
     *  (`oledRefusal`). It keeps its state and its focus, its track dims, a press
     *  shakes it, and the reason is its bubble, or a line under the row on a
     *  touch screen. */
    refused?: string;
    /** Extra classes for the outer wrapper (e.g. row-alignment nudges). */
    class?: string;
    style?: string;
  }
</script>

<script lang="ts">
  import { shake } from "@glimstone/core";
  import { useFieldName } from "./fieldName.js";
  import { useTipBubble } from "./bubble.svelte.js";
  import TipBubble from "./TipBubble.svelte";

  // The shared switch control. The label is always the accessible name;
  // `hideLabel` only drops the visible caption. The other props of a <button>
  // go to the switch, which is what a script asks for its state; `class` and
  // `style` go to the frame, which carries the row's layout. Inside a FieldRow
  // the row names the switch and draws the words.
  let { checked = $bindable(), onChange, label, hideLabel = false, disabled, refused, class: className, style, onclick, ...rest }: ToggleProps = $props();

  const name = useFieldName(() => label);
  const tip = useTipBubble(() => refused);
  const reason = $props.id();
  let frame: HTMLSpanElement;
  let stopShake: (() => void) | undefined;
  $effect(() => () => stopShake?.());

  function press(e: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement }) {
    onclick?.(e);
    if (!refused) {
      checked = !checked;
      onChange?.(checked);
      return;
    }
    stopShake?.();
    stopShake = shake(frame);
  }
</script>

<span data-glim="Toggle" bind:this={frame} class={`glim-toggle${className ? ` ${className}` : ""}`} {style}>
  {#if label !== undefined && !hideLabel}<span class="glim-toggle-label">{label}</span>{/if}
  <!-- No title: the label is always visible beside the switch, so a tooltip
       would only repeat it. A refused switch's bubble says why. -->
  <button
    {...rest}
    bind:this={tip.trigger}
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={name()}
    aria-disabled={refused ? true : undefined}
    aria-describedby={refused ? reason : rest["aria-describedby"]}
    {disabled}
    onclick={press}
    onmouseenter={() => refused && tip.show()}
    onmouseleave={tip.hide}
    onfocus={() => refused && tip.showOnFocus()}
    onblur={tip.hide}
    class="glim-toggle-track"
  >
    <span class="glim-toggle-thumb"></span>
  </button>
</span>
{#if refused}<span id={reason} class="glim-toggle-refusal">{refused}</span>{/if}
<TipBubble state={tip} />
