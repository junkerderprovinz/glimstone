<script lang="ts">
  import { Button, PickerWindow } from "@glimstone/svelte";
  import { TRANSFER_TEXT, transferLine, transferPicker } from "../transferData";
  import { glyph } from "../svelte/glyph";

  const { items, groups } = transferPicker(glyph);

  let open = $state(false);
  let picked = $state<string | null>(null);
</script>

<div style="display: flex; align-items: center; gap: 12px">
  <Button label="Add a transfer link" labelKey="add" onClick={() => (open = true)} />
  <output>{transferLine(picked)}</output>
  {#if open}
    <PickerWindow
      title="Add a transfer link"
      hint="The service that sent the file. Its link downloads without an account."
      {items}
      {groups}
      text={TRANSFER_TEXT}
      onPick={(id) => {
        open = false;
        picked = id;
      }}
      onClose={() => (open = false)}
    />
  {/if}
</div>
