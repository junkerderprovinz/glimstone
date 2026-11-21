import { useState } from "react";
import { SignInTile } from "@glimstone/react";
import { demoKit, demoTime, IDENTITY_PROVIDERS, TILE_TEXT } from "../signInData";

// An app without a password: everyone who reaches it is an admin, and every
// lasting way in waits for the first password.
export default function SignInTileOpen() {
  const [api] = useState(() => demoKit("open"));
  const [said, setSaid] = useState("Nothing yet");
  return (
    <div className="signin-tile-demo">
      <SignInTile api={api} text={TILE_TEXT} lang="en" providers={IDENTITY_PROVIDERS} time={demoTime} notify={setSaid} />
      <output data-hook="said">{said}</output>
    </div>
  );
}
