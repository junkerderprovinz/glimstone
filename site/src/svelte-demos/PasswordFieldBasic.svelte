<script lang="ts">
  import { Button, PasswordField } from "@glimstone/svelte";

  let secret = $state("correct horse");
  let field = $state<HTMLInputElement | null>(null);
</script>

<div style="display: grid; gap: 8px; width: 320px">
  <input class="glim-input" aria-label="User name" value="anna" />
  <PasswordField bind:ref={field} aria-label="Password" eyeAttrs={{ "data-hook": "eye" }} bind:value={secret} />
  <PasswordField aria-label="Token" value="read-only token" disabled readonly />
  <div>
    <Button label="Focus the password" labelKey={null} onClick={() => field?.focus()} />
  </div>
</div>
