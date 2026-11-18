<script lang="ts">
  import { Button, PickerWindow } from "@glimstone/svelte";
  import { STORAGE_TEXT, storageLine, storagePicker } from "../storageData";
  import { glyph } from "../svelte/glyph";

  const { items, groups } = storagePicker(glyph);

  let open = $state(false);
  let picked = $state<string | null>(null);
</script>

<div style="display: flex; align-items: center; gap: 12px">
  <Button label="Add storage" labelKey="add" onClick={() => (open = true)} />
  <output>{storageLine(picked)}</output>
  {#if open}
    <PickerWindow
      title="Add storage"
      hint="Where the files go. Pick a cloud, a bucket store or a server."
      {items}
      {groups}
      text={STORAGE_TEXT}
      onPick={(id) => {
        open = false;
        picked = id;
      }}
      onClose={() => (open = false)}
    />
  {/if}
</div>
