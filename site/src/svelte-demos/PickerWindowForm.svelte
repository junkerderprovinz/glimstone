<script lang="ts">
  import { Button, Card, FieldRow, PickerWindow, TextField } from "@glimstone/svelte";
  import { CHANNEL_TEXT, channelPicker, labelOf, testAddress } from "../channelData";
  import { glyph } from "../svelte/glyph";

  const { items, groups } = channelPicker(glyph);

  let open = $state(false);
  let picked = $state<string | null>(null);
  let address = $state("");
  let testing = $state(false);
  let reached = $state<boolean | null>(null);
  let saved = $state("Nothing saved yet");
  function back() {
    picked = null;
    reached = null;
  }
  async function test() {
    testing = true;
    reached = await testAddress(address);
    testing = false;
  }
</script>

{#snippet form()}
  <FieldRow label="Address" hint="Where the service takes its messages.">
    <TextField width="medium" bind:value={address} />
  </FieldRow>
{/snippet}

<Card title="Storage" hueIndex={2}>
  <div style="display: flex; align-items: center; gap: 12px">
    <Button label="Connect a service" labelKey="add" onClick={() => (open = true)} />
    <output>{saved}</output>
  </div>
  {#if open}
    <PickerWindow
      title={picked ? labelOf(picked) : "Connect a service"}
      {items}
      {groups}
      text={CHANNEL_TEXT}
      onPick={(id) => (picked = id)}
      start={reached === null ? undefined : reached ? "Reached" : "Not reached"}
      actions={[
        {
          label: "Test connection",
          labelKey: "confirm",
          tone: reached === null ? undefined : reached ? "ok" : "danger",
          busy: testing,
          title: reached === null ? undefined : reached ? "Reached" : "Not reached",
          onClick: () => {
            void test();
            return false;
          },
        },
        {
          label: "Save",
          labelKey: "save",
          primary: true,
          onClick: () => {
            saved = `Saved: ${labelOf(picked!)} at ${address}`;
          },
        },
      ]}
      onBack={back}
      onClose={() => {
        open = false;
        back();
      }}
      children={picked ? form : undefined}
    />
  {/if}
</Card>
