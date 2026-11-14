<script lang="ts" generics="T extends string">
  import { onMount } from "svelte";
  import * as menu from "@zag-js/menu";
  import { mergeProps, normalizeProps, useMachine } from "@zag-js/svelte";
  import { pageDir, type SelectRowParts } from "@glimstone/core";
  import { IconExpand } from "./glyphs.js";
  import { lift } from "./lift.js";
  import MenuChoice from "./MenuChoice.svelte";
  import type { PortalHue } from "./portalHue.svelte.js";
  import type { SelectSubmenu } from "./selectParts.svelte.js";

  // A row of a list with submenus that opens a list of its own beside it.
  let {
    parent,
    parentApi,
    triggerId,
    entry,
    value,
    onChange,
    parts,
    hue,
  }: {
    parent: menu.Service;
    parentApi: menu.Api;
    triggerId: string;
    entry: SelectSubmenu<T>;
    value: T | null;
    onChange: (value: T) => void;
    parts: SelectRowParts;
    hue: PortalHue;
  } = $props();

  const id = $props.id();
  const service = useMachine(menu.machine, () => ({
    id,
    ids: { trigger: triggerId },
    dir: pageDir(),
    "aria-label": entry.label,
  }));
  const api = $derived(menu.connect(service, normalizeProps));
  // The parent's machine starts in its own onMount, which Svelte runs after
  // this one, and a machine that has not started drops what it is sent.
  onMount(() =>
    queueMicrotask(() => {
      parentApi.setChild(service);
      api.setParent(parent);
    }),
  );
</script>

<div {...parentApi.getTriggerItemProps(api)} class={parts.item}>
  {#if parts.glyph}
    <span class={parts.glyph}>{@render entry.glyph?.()}</span>
  {/if}
  <span class={parts.label}>{entry.label}</span>
  <span aria-hidden="true" class={parts.caret}>{@render IconExpand()}</span>
</div>
<div {@attach lift} {...mergeProps(api.getPositionerProps(), { style: hue.style })} class={`glim-select-positioner ${hue.className}`.trim()}>
  <div {...api.getContentProps()} class={parts.content}>
    {#each entry.options as o (o.value)}
      <MenuChoice {api} option={o} {value} {onChange} {parts} />
    {/each}
  </div>
</div>
