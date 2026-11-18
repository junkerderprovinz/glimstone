<script lang="ts">
  import { Button, PickerWindow } from "@glimstone/svelte";
  import { CHANNEL_TEXT, channelPicker, pickedLine } from "../channelData";
  import { glyph } from "../svelte/glyph";

  const { items, groups } = channelPicker(glyph);

  let open = $state(false);
  let picked = $state<string[]>([]);
</script>

<div style="display: flex; align-items: center; gap: 12px">
  <Button label="Add a channel" labelKey="add" onClick={() => (open = true)} />
  <output>{pickedLine(picked)}</output>
  {#if open}
    <PickerWindow
      title="Add a channel"
      hint="Where a message goes. Pick a service, then fill in its few fields."
      {items}
      {groups}
      text={CHANNEL_TEXT}
      onPick={(id) => {
        open = false;
        picked = [...picked, id];
      }}
      onClose={() => (open = false)}
    />
  {/if}
</div>
