<script lang="ts" generics="T extends string">
  import type * as menu from "@zag-js/menu";
  import type { SelectRowParts } from "@glimstone/core";
  import { IconCheck } from "./glyphs.js";
  import type { SelectOption } from "./selectParts.svelte.js";

  // One option of a list with submenus, a radio item of Zag's menu machine.
  let { api, option, value, onChange, parts }: { api: menu.Api; option: SelectOption<T>; value: T | null; onChange: (value: T) => void; parts: SelectRowParts } =
    $props();

  const checked = $derived(option.value === value);
  const item = $derived({
    type: "radio" as const,
    value: option.value,
    valueText: option.label,
    checked,
    disabled: option.disabled,
    onCheckedChange: () => {
      if (!checked) onChange(option.value);
    },
  });
</script>

<div {...api.getOptionItemProps(item)} class={parts.item}>
  {#if parts.glyph}
    <span class={parts.glyph}>{@render option.glyph?.()}</span>
  {/if}
  <span {...api.getItemTextProps(item)} class={parts.label}>{option.label}</span>
  <span aria-hidden="true" data-state={checked ? "checked" : "unchecked"} class={parts.check}>{@render IconCheck()}</span>
</div>
