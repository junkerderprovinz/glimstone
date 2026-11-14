<script lang="ts">
  import { Button, ContextMenu, type MenuEntry } from "@glimstone/svelte";
  import { glyph } from "../svelte/glyph";

  const FILES = ["holiday.mkv", "notes.pdf", "budget.ods"];

  let at = $state.raw<{ x: number; y: number; opener?: HTMLElement } | null>(null);
  let last = $state("nothing yet");
  let hidden = $state(false);
  let sort = $state("Name");
  let kind = $state(true);
  let more = $state<HTMLElement | null>(null);

  const items: MenuEntry[] = $derived([
    { label: "Open", glyph: glyph("IconFolderOpen"), shortcut: "Enter", onSelect: () => (last = "Open") },
    { label: "Rename", glyph: glyph("IconPencil"), shortcut: "F2", onSelect: () => (last = "Rename") },
    { label: "Paste", glyph: glyph("IconPaste"), disabled: true },
    "-",
    "-",
    {
      label: "Sort by",
      subId: "demo-sort-menu",
      glyph: glyph("IconSort"),
      sub: ["Name", "Size", "Modified"].map((s) => ({ label: s, checked: sort === s, radio: true, onSelect: () => (sort = s) })),
    },
    {
      label: "Group",
      glyph: glyph("IconFiles"),
      sub: [{ label: "By kind", checked: kind, onSelect: () => (kind = !kind) }],
    },
    { label: "Show hidden files", checked: hidden, onSelect: () => (hidden = !hidden) },
    { label: "Select the same kind", glyph: glyph("IconSelectAll"), count: 3, onSelect: () => (last = "Select the same kind") },
    { label: "Red label", color: "var(--status-fail-solid)", onSelect: () => (last = "Red label") },
    "-",
    { head: "Bookmarks", edit: { tip: "Edit bookmarks", onSelect: () => (last = "Edit bookmarks") } },
    { label: "Downloads", glyph: glyph("IconFolder"), onSelect: () => (last = "Downloads") },
    "-",
  ]);

  function openAt(e: MouseEvent) {
    e.preventDefault();
    at = { x: e.clientX, y: e.clientY };
  }
  function toggleMore() {
    const r = more!.getBoundingClientRect();
    at = at ? null : { x: r.left, y: r.bottom + 6, opener: more! };
  }
</script>

<div style="display: grid; gap: 12px; width: 100%">
  <div oncontextmenu={openAt} style="display: grid; gap: 2px" aria-label="Files" role="list">
    {#each FILES as f (f)}
      <div role="listitem" class="glim-well" style="padding: 6px 10px">{f}</div>
    {/each}
  </div>
  <div style="display: flex; gap: 12px; align-items: center">
    <Button bind:ref={more} label="More" labelKey="more" onClick={toggleMore} />
    <span data-last>Last choice: {last}. Sorted by {sort}. Hidden files {hidden ? "shown" : "hidden"}.</span>
  </div>
  {#if at}
    <ContextMenu id="demo-file-menu" x={at.x} y={at.y} {items} label="File" opener={at.opener} onClose={() => (at = null)} />
  {/if}
</div>
