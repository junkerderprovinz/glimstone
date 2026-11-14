<script lang="ts">
  import { FieldRow, NumberField, PasswordField, TextField } from "@glimstone/svelte";

  let port = $state("8080");
  let job = $state("nightly");
  const portError = $derived(/^\d{1,5}$/.test(port) && Number(port) <= 65535 ? undefined : "A port is a number up to 65535");
</script>

<div data-column style="display: grid; gap: 12px; width: 420px; justify-items: start">
  <TextField label="Port" width="short" bind:value={port} error={portError} />
  <div style="width: 100%">
    <FieldRow label="Job name">
      <TextField width="medium" bind:value={job} error={job.trim() ? undefined : "A job needs a name"} />
    </FieldRow>
  </div>
  <PasswordField aria-label="Token" value="short" error="A token has 32 characters" />
  <NumberField aria-label="Keep" value={0} min={0} error="Keep at least one copy" />
</div>
