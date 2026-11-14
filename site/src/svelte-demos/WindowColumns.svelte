<script lang="ts">
  import { Button, Checkbox, Window } from "@glimstone/svelte";
  import { glyph } from "../svelte/glyph";

  const COLUMNS = ["Name", "Size", "Modified", "Kind", "Owner"];
  const TEXT = { cancel: "Cancel", close: "Close" };

  let open = $state(false);
  let about = $state(false);
  let shown = $state(["Name", "Size", "Modified"]);
  let query = $state("");
  const flip = (c: string) => (shown = shown.includes(c) ? shown.filter((x) => x !== c) : [...shown, c]);
</script>

<Button label="Choose columns" labelKey="settings" onClick={() => (open = true)} />
{#if open}
  <Window
    title="Columns"
    size="wide"
    text={TEXT}
    start="Drag a column's header to move it"
    actions={[
      {
        label: "Reset",
        labelKey: "reset",
        // The reset shows in the boxes, so the window stays for a second look.
        onClick: () => {
          shown = ["Name", "Size", "Modified"];
          return false;
        },
      },
      { label: "Apply", labelKey: null, glyph: glyph("IconApply"), primary: true },
    ]}
    onClose={() => (open = false)}
  >
    <input class="field" type="search" placeholder="Find a column" aria-label="Find a column" bind:value={query} />
    <div style="display: flex; flex-wrap: wrap; gap: 4px">
      {#each COLUMNS.filter((c) => c.toLowerCase().includes(query.toLowerCase())) as c (c)}
        <Checkbox label={c} checked={shown.includes(c)} disabled={c === "Name"} onChange={() => flip(c)} />
      {/each}
    </div>
    <div>
      <Button label="About columns" labelKey={null} tone="subtle" onClick={() => (about = true)} />
    </div>
  </Window>
{/if}
{#if about}
  <Window title="About columns" text={TEXT} actions={[{ label: "Got it", labelKey: "confirm", wayOut: true }]} onClose={() => (about = false)}>
    <p style="margin: 0">Each panel keeps its own columns, and the name always stays.</p>
  </Window>
{/if}
