<script lang="ts">
  import { IconButton, Meter, SidebarRow } from "@glimstone/svelte";
  import { glyph } from "../svelte/glyph";

  let note = $state("Nothing yet");
  let unpinned = $state(0);
  const folder = glyph("IconFolder");
</script>

{#snippet before()}<span data-slot="before">›</span>{/snippet}
{#snippet after()}
  <span data-slot="after" style="display: inline-flex; align-items: center; gap: 4px">
    <Meter label="Media is 40% full" value={0.4} quiet size="small" />
    <IconButton tip="Unpin" glyph={glyph("IconPin")} onclick={() => unpinned++} />
  </span>
{/snippet}
{#snippet toggle()}<span data-toggle>›</span>{/snippet}

<div style="display: grid; gap: 4px; width: 300px">
  <SidebarRow
    label="Media"
    glyph={folder}
    href="#/components/sidebar-row"
    onclick={(e) => {
      e.preventDefault();
      note = "Opened Media";
    }}
    {before}
    {after}
  />
  {#each ["mnt", "user", "Big Buck Bunny and the other films"] as name, depth (name)}
    <SidebarRow data-depth={depth} label={name} glyph={folder} {depth} onclick={() => (note = `Opened ${name}`)} before={toggle} />
  {/each}
  <SidebarRow label="Trash" glyph={glyph("IconTrash")} onclick={() => (note = "Opened Trash")} />
  <output>{unpinned ? `Unpinned ${unpinned}` : note}</output>
</div>
