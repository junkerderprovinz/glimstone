<script lang="ts">
  import { tick } from "svelte";
  import { SignInReauthWindow, SignInTile } from "@glimstone/svelte";
  import { signInReauthTextEn } from "@glimstone/core";
  import { demoKit, demoTime, IDENTITY_PROVIDERS, TILE_TEXT } from "../signInData";

  // The owner signed in a while ago, so a new token, two-factor or a passkey asks
  // for the password first, which is "letmein". The code for two-factor is
  // 123456, and a test sign-in comes back as if it had worked.
  const api = demoKit();
  let said = $state("Nothing yet");
  let arrived = $state<string | null>(null);

  function leave(url: string) {
    api.leave(url);
    arrived = null;
    void tick().then(() => (arrived = "testOk"));
  }
</script>

<div class="signin-tile-demo">
  <SignInTile
    {api}
    text={TILE_TEXT}
    lang="en"
    providers={IDENTITY_PROVIDERS}
    time={demoTime}
    returnTo="/components/sign-in-tile"
    {arrived}
    notify={(m) => (said = m)}
    onLeave={leave}
  />
  <SignInReauthWindow {api} text={signInReauthTextEn} />
  <output data-hook="said">{said}</output>
</div>
