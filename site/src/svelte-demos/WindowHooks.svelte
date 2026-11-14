<script lang="ts">
  import { Button, Window } from "@glimstone/svelte";
  import { glyph } from "../svelte/glyph";

  const TEXT = { cancel: "Cancel", close: "Close" };

  let open = $state(false);
  let card = $state<HTMLElement | null>(null);
  let width = $state(0);
  $effect(() => {
    if (open && card) width = card.offsetWidth;
  });
</script>

{#snippet moveTitle()}Move files <span data-count>1,204</span>{/snippet}

<Button label="Move files" labelKey={null} glyph={glyph("IconFolder")} onClick={() => (open = true)} />
{#if open}
  <Window
    bind:ref={card}
    title="Move files"
    drawn={moveTitle}
    text={TEXT}
    start="1,204 files from /mnt/user/media to /mnt/user/archive, about 38 GB, and both panels stay usable while they move"
    actions={[{ label: "Move all 1,204 files to the archive", labelKey: null, glyph: glyph("IconFolder"), primary: true, attrs: { "data-action": "move" } }]}
    onClose={() => (open = false)}
  >
    <p style="margin: 0">{width} px wide</p>
  </Window>
{/if}
