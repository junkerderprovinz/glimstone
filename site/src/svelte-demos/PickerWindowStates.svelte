<script lang="ts">
  import { Button, FieldRow, PickerWindow, TextField } from "@glimstone/svelte";
  import { STORAGE_GROUPS, STORAGE_TEXT, placeOf, storageItems } from "../placeData";
  import { glyph } from "../svelte/glyph";

  const ITEMS = storageItems(glyph);

  let open = $state(false);
  let picked = $state<string | null>(null);
  let last = $state<string | undefined>();
  let path = $state("");
  let saved = $state("No place yet");
</script>

{#snippet form()}
  <FieldRow label="Path" hint="Where on the place the backups go.">
    <TextField width="medium" bind:value={path} />
  </FieldRow>
{/snippet}

<div style="display: flex; align-items: center; gap: 12px">
  <Button label="Choose a place" labelKey="add" onClick={() => (open = true)} />
  <output>{saved}</output>
  {#if open}
    <PickerWindow
      title={picked ? placeOf(picked) : "Choose a place"}
      items={ITEMS}
      groups={STORAGE_GROUPS}
      text={STORAGE_TEXT}
      selected={last}
      onPick={(id) => {
        picked = id;
        last = id;
      }}
      actions={[
        {
          label: "Save",
          labelKey: "save",
          primary: true,
          onClick: () => {
            saved = `Saved: ${placeOf(picked!)} at ${path}`;
          },
        },
      ]}
      onBack={() => (picked = null)}
      onClose={() => {
        open = false;
        picked = null;
      }}
      children={picked ? form : undefined}
    />
  {/if}
</div>
