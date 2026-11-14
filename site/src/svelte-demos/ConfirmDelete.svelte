<script lang="ts">
  import { Button, Toggle, useConfirm } from "@glimstone/svelte";

  const ask = useConfirm({ title: "Confirm", cancel: "Cancel", confirm: "Confirm" });
  let alsoFiles = $state(false);

  async function remove() {
    alsoFiles = false;
    const yes = await ask.confirm("Delete the snapshot from 14 October? The archive on the target stays.", {
      confirmLabel: "Delete",
      confirmLabelKey: "delete",
      extra: alsoFilesSwitch,
    });
    if (yes) console.info(alsoFiles ? "snapshot and files deleted" : "snapshot deleted");
  }
</script>

<!-- The switch the answer needs, handed to the dialog as a snippet. -->
{#snippet alsoFilesSwitch()}
  <Toggle label="Also delete the files on the target" bind:checked={alsoFiles} />
{/snippet}

<Button label="Delete snapshot" labelKey="delete" onClick={remove} />
<ask.confirmDialog />
