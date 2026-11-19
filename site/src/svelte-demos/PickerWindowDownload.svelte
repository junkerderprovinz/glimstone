<script lang="ts">
  import { Button, PickerWindow } from "@glimstone/svelte";
  import { DOWNLOAD_TEXT, downloadLine, downloadPicker } from "../downloadData";
  import { glyph } from "../svelte/glyph";

  const { items, groups } = downloadPicker(glyph);

  let open = $state(false);
  let picked = $state<string | null>(null);
</script>

<div style="display: flex; align-items: center; gap: 12px">
  <Button label="Add an account" labelKey="add" onClick={() => (open = true)} />
  <output>{downloadLine(picked)}</output>
  {#if open}
    <PickerWindow
      title="Add an account"
      hint="Where the links are unlocked. Pick a debrid service or a hoster you have a login at."
      {items}
      {groups}
      text={DOWNLOAD_TEXT}
      onPick={(id) => {
        open = false;
        picked = id;
      }}
      onClose={() => (open = false)}
    />
  {/if}
</div>
