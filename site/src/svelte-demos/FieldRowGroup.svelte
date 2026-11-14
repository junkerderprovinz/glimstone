<script lang="ts">
  import { FieldRow, FieldRowGroup, PasswordField, TextField, Toggle } from "@glimstone/svelte";

  let notify = $state(true);
</script>

<div style="width: 100%; max-width: 480px">
  <FieldRowGroup>
    <FieldRow label="Find">
      <TextField width="grow" value="report" />
    </FieldRow>
    <FieldRow label="Replace with">
      <TextField width="grow" value="summary" />
    </FieldRow>
    <FieldRow label="Password">
      <PasswordField width="grow" />
    </FieldRow>
    <FieldRow label="Notify">
      <Toggle bind:checked={notify} />
    </FieldRow>
    <FieldRow label="Hours">
      <TextField label="From" width="short" value="08:00" />
      <TextField label="To" width="short" value="17:00" />
    </FieldRow>
    <FieldRow label="Last run" value="2 hours ago" />
  </FieldRowGroup>
</div>
