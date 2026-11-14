<script lang="ts">
  import { Button, FieldRow, SignInCard, SignInField, TextField, Toggle } from "@glimstone/svelte";
  import { signInTextEn } from "@glimstone/core";
  import logo from "../../../.github/assets/logo.svg?url";

  // A name and a switch above the password, a second way in under Sign in, and a
  // step of the app's own once the new password is set.
  let name = $state("");
  let stay = $state(true);
  let done = $state(false);
</script>

{#snippet fields()}
  <SignInField label="Name" htmlFor="svelte-slots-name">
    <TextField id="svelte-slots-name" bind:value={name} autocomplete="username" />
  </SignInField>
  <FieldRow label="Stay signed in">
    <Toggle bind:checked={stay} />
  </FieldRow>
{/snippet}

{#snippet actions()}
  <Button label="Sign in with Authentik" labelKey={null} />
{/snippet}

{#snippet step()}
  <div class="glim-signin-form" role="status">
    <p>Your new password is set.</p>
    <Button label="Done" labelKey={null} tone="accent" onClick={() => (done = false)} />
  </div>
{/snippet}

<div class="signin-demo">
  <SignInCard
    {logo}
    appName="GlimStone"
    text={signInTextEn}
    reset
    autoFocus={false}
    idPrefix="svelte-slots"
    {fields}
    {actions}
    step={done ? step : undefined}
    onSignIn={async () => ({ error: "That password is not right" })}
    onAskCode={async () => ({ ok: true })}
    onSetPassword={async () => {
      done = true;
      return { ok: true };
    }}
  />
</div>
