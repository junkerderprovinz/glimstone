<script lang="ts">
  import { SignInTile } from "@glimstone/svelte";
  import { demoKit, demoTime, IDENTITY_PROVIDERS, TILE_TEXT } from "../signInData";

  // An app without a password: everyone who reaches it is an admin, and every
  // lasting way in waits for the first password.
  const api = demoKit("open");
  let said = $state("Nothing yet");
</script>

<div class="signin-tile-demo">
  <SignInTile {api} text={TILE_TEXT} lang="en" providers={IDENTITY_PROVIDERS} time={demoTime} notify={(m) => (said = m)} />
  <output data-hook="said">{said}</output>
</div>
