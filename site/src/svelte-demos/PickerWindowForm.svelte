<script lang="ts">
  import { Button, PickerWindow, TextField } from "@glimstone/svelte";
  import { CHANNEL_GROUPS, CHANNEL_TEXT, channelItems, labelOf } from "../channelData";
  import { glyph } from "../svelte/glyph";

  const ITEMS = channelItems(glyph("IconMail"), glyph("IconLink"));

  let open = $state(false);
  let picked = $state<string | null>(null);
  let address = $state("");
  let saved = $state("Nothing saved yet");
  function close() {
    open = false;
    picked = null;
  }
</script>

{#snippet form()}<TextField label="Address" bind:value={address} />{/snippet}

<div style="display: flex; align-items: center; gap: 12px">
  <Button label="Connect a service" labelKey="add" onClick={() => (open = true)} />
  <output>{saved}</output>
  {#if open}
    <PickerWindow
      title={picked ? labelOf(picked) : "Connect a service"}
      items={ITEMS}
      groups={CHANNEL_GROUPS}
      text={CHANNEL_TEXT}
      onPick={(id) => (picked = id)}
      actions={[
        {
          label: "Save",
          labelKey: "save",
          primary: true,
          onClick: () => {
            saved = `Saved: ${labelOf(picked!)} at ${address}`;
          },
        },
      ]}
      onBack={() => (picked = null)}
      onClose={close}
      children={picked ? form : undefined}
    />
  {/if}
</div>
