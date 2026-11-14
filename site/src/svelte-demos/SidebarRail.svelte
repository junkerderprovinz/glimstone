<script lang="ts">
  import { SidebarRow, useLabelMode } from "@glimstone/svelte";
  import { glyph } from "../svelte/glyph";

  const MAIN = [
    { id: "overview", label: "Overview", glyph: "IconDashboard" },
    { id: "backups", label: "Backups", glyph: "IconArchive", count: { value: 3, label: "3 need attention" } },
    { id: "restore", label: "Restore", glyph: "IconRestore" },
  ];
  const FOOT = [{ id: "settings", label: "Settings", glyph: "IconGear" }];

  let here = $state("overview");
  // The rail narrows in glyph mode only; reactive keeps its width.
  const mode = useLabelMode("sidebar");
</script>

{#snippet row(r: (typeof MAIN)[number], i: number)}
  <SidebarRow
    label={r.label}
    glyph={glyph(r.glyph)}
    href={`#/${r.id}`}
    active={here === r.id}
    hueIndex={i}
    count={r.count}
    onclick={(e) => {
      e.preventDefault();
      here = r.id;
    }}
  />
{/snippet}

<nav
  aria-label="Main"
  style="display: flex; flex-direction: column; justify-content: space-between; gap: 24px; width: {mode.current === 'glyph'
    ? 'var(--rail-narrow)'
    : '14rem'}; height: 300px; padding: 12px; border-radius: var(--radius-card); background: var(--carbon-sidebar)"
>
  <div style="display: flex; flex-direction: column; gap: 4px">
    {#each MAIN as r, i (r.id)}{@render row(r, i)}{/each}
  </div>
  <div style="display: flex; flex-direction: column; gap: 4px">
    {#each FOOT as r, i (r.id)}{@render row(r, MAIN.length + i)}{/each}
  </div>
</nav>
