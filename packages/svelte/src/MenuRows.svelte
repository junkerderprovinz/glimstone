<script lang="ts">
  import { isMenuHead, menuRowView } from "@glimstone/core";
  import type { MenuEntry } from "./ContextMenu.svelte";
  import { IconCheck, IconExpand } from "./glyphs.js";
  import Kbd from "./Kbd.svelte";
  import MenuHeadEdit from "./MenuHeadEdit.svelte";

  // The rows of one menu, the first or a submenu. ContextMenu decides what a
  // pick does; every row carries its index as `data-row` for that.
  let { entries, openAt, onPick }: { entries: MenuEntry[]; openAt?: number; onPick: (row: number) => void } = $props();
</script>

{#each entries as entry, i}
  {#if entry === "-"}
    <div class="glim-menu-sep" role="separator"></div>
  {:else if isMenuHead(entry)}
    <div class="glim-menu-head" role="presentation">
      <span>{entry.head}</span>
      {#if entry.edit}
        {@const edit = entry.edit}
        <MenuHeadEdit tip={edit.tip} glyph={edit.glyph} row={i} onPress={() => onPick(i)} />
      {/if}
    </div>
  {:else}
    {@const view = menuRowView(entry)}
    <button
      type="button"
      role={view.role}
      tabindex="-1"
      aria-checked={view.role === "menuitem" ? undefined : entry.checked}
      aria-haspopup={entry.sub ? "menu" : undefined}
      aria-expanded={entry.sub ? openAt === i : undefined}
      disabled={entry.disabled}
      class={view.current ? "glim-menu-item glim-menu-item--current" : "glim-menu-item"}
      data-row={i}
      onclick={() => onPick(i)}
    >
      {#if view.lead === "box"}
        <span class="glim-checkbox-box" aria-hidden="true">{@render IconCheck()}</span>
      {:else if view.lead === "dot"}
        <span class="glim-menu-dot" style={`background-color: ${entry.color}`} aria-hidden="true"></span>
      {:else}
        <span class="glim-menu-glyph" aria-hidden="true">{#if view.lead === "glyph"}{@render entry.glyph?.()}{/if}</span>
      {/if}
      <span class="glim-menu-label">{entry.label}</span>
      {#if view.end === "submenu"}
        <span class="glim-menu-end glim-menu-caret" aria-hidden="true">{@render IconExpand()}</span>
      {:else if view.end === "tick"}
        <span class="glim-menu-end glim-menu-tick" aria-hidden="true">{@render IconCheck()}</span>
      {:else if view.end === "shortcut"}
        <Kbd class="glim-menu-end">{entry.shortcut}</Kbd>
      {:else if view.end === "count"}
        <span class="glim-menu-end glim-menu-count glim-num">{entry.count}</span>
      {/if}
    </button>
  {/if}
{/each}
