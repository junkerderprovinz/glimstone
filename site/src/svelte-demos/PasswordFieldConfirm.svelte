<script lang="ts">
  import { Button, FieldRow, PasswordField } from "@glimstone/svelte";

  let password = $state("");
  let confirmed = $state(false);
  let said = $state("");
  function save() {
    password = "";
    said = "Password set";
  }
</script>

<div style="display: grid; gap: 8px; width: 100%; max-width: 480px">
  <FieldRow label="New password">
    <PasswordField width="medium" confirm onConfirmedChange={(c) => (confirmed = c)} bind:value={password} />
  </FieldRow>
  <div>
    <Button label="Set password" labelKey={null} tone="accent" disabled={!confirmed} onClick={save} />
  </div>
  <output>{said}</output>
</div>
