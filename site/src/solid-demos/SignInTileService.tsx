import { createSignal } from "solid-js";
import { SignInTile } from "@glimstone/solid";
import { demoKit, demoTime, IDENTITY_PROVIDERS, TILE_TEXT } from "../signInData";

// An account that signs in through Pocket ID and has no password here: the
// password, two-factor and passkeys live at Pocket ID, and tokens still work.
export default function SignInTileService() {
  const api = demoKit("service");
  const [said, setSaid] = createSignal("Nothing yet");
  return (
    <div class="signin-tile-demo">
      <SignInTile api={api} text={TILE_TEXT} lang="en" providers={IDENTITY_PROVIDERS} cards={["password", "twoFactor", "passkeys", "tokens"]} time={demoTime} notify={setSaid} />
      <output data-hook="said">{said()}</output>
    </div>
  );
}
