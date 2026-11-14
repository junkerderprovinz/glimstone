<script lang="ts">
  import { Button } from "@glimstone/svelte";
  import { glyph } from "../svelte/glyph";

  const queued = glyph("IconQueued");
</script>

{#snippet count()}<span data-count class="glim-num">12</span>{/snippet}

<div style="display: flex; flex-wrap: wrap; align-items: center; gap: 8px">
  <Button label="Jobs" labelKey={null} glyph={queued} compact after={count} />
  <Button label="All jobs" labelKey={null} glyph={queued} compact />
  <Button label="Find" labelKey={null} glyph={glyph("IconSearch")} compactBelow={900} />
  <Button label="Sign in" labelKey={null} glyph={glyph("IconApply")} tone="accent" size="key" />
</div>
