<script lang="ts">
  import { DENSITIES, type Density } from "@glimstone/core";
  import { ListRow, Pill, Selector, useDensity } from "@glimstone/svelte";
  import { DENSITY_GLYPHS } from "../glyphData";
  import { glyph } from "../svelte/glyph";

  const NAMES: Record<Density, string> = { compact: "Compact", normal: "Normal", airy: "Airy" };
  const density = useDensity();
  const items = DENSITIES.map((d) => ({ id: d, label: NAMES[d], glyph: glyph(DENSITY_GLYPHS[d]) }));
  const folder = glyph("IconFolder");
  const cloud = glyph("IconCloud");
</script>

{#snippet size(text: string)}<Pill class="glim-num">{text}</Pill>{/snippet}
{#snippet big()}{@render size("2.4 GB")}{/snippet}
{#snippet mid()}{@render size("880 MB")}{/snippet}
{#snippet huge()}{@render size("12 GB")}{/snippet}

<div style="display: grid; gap: 12px; width: 100%; max-width: 560px">
  <Selector bind:value={density.current} label="Density" {items} variant="well" equalWidth />
  <div style="display: grid; gap: 2px">
    <ListRow name="nightly-backup" tile={folder} badges={big} />
    <ListRow name="archive-copy" tile={cloud} badges={mid} />
    <ListRow name="photos" tile={folder} badges={huge} />
  </div>
</div>
