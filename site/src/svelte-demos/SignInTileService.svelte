<script lang="ts">
  import { SignInTile } from "@glimstone/svelte";
  import { demoKit, demoTime, IDENTITY_PROVIDERS, TILE_TEXT } from "../signInData";

  // An account that signs in through Pocket ID and has no password here: the
  // password, two-factor and passkeys live at Pocket ID, and tokens still work.
  const api = demoKit("service");
  let said = $state("Nothing yet");
</script>

<div class="signin-tile-demo">
  <SignInTile {api} text={TILE_TEXT} lang="en" providers={IDENTITY_PROVIDERS} cards={["password", "twoFactor", "passkeys", "tokens"]} time={demoTime} notify={(m) => (said = m)} />
  <output data-hook="said">{said}</output>
</div>
