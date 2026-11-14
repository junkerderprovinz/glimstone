<script lang="ts">
  import { TextArea, TextField } from "@glimstone/svelte";

  let name = $state("backup-weekly");
  let notes = $state("");
</script>

<div data-column style="display: grid; gap: 8px; width: 400px; justify-items: start">
  <TextField label="Job name" width="wide" bind:value={name} />
  <TextField label="Group" width="medium" placeholder="None" />
  <TextField label="Port" width="short" mono value="8080" maxlength={5} data-hook="port" />
  <TextField label="Address" mono placeholder="smb://server/share" />
  <TextArea label="Notes" rows={3} placeholder="What this job is for" bind:value={notes} />
  <output>{name}</output>
</div>
