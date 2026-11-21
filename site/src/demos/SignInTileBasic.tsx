import { useState } from "react";
import { SignInReauthWindow, SignInTile } from "@glimstone/react";
import { signInReauthTextEn } from "@glimstone/core";
import { demoKit, demoTime, IDENTITY_PROVIDERS, TILE_TEXT } from "../signInData";

// The owner signed in a while ago, so a new token, two-factor or a passkey asks
// for the password first, which is "letmein". The code for two-factor is
// 123456, and a test sign-in comes back as if it had worked.
export default function SignInTileBasic() {
  const [api] = useState(() => demoKit());
  const [said, setSaid] = useState("Nothing yet");
  const [arrived, setArrived] = useState<string | null>(null);
  return (
    <div className="signin-tile-demo">
      <SignInTile
        api={api}
        text={TILE_TEXT}
        lang="en"
        providers={IDENTITY_PROVIDERS}
        time={demoTime}
        returnTo="/components/sign-in-tile"
        arrived={arrived}
        notify={setSaid}
        onLeave={(url) => {
          api.leave(url);
          setArrived(null);
          queueMicrotask(() => setArrived("testOk"));
        }}
      />
      <SignInReauthWindow api={api} text={signInReauthTextEn} />
      <output data-hook="said">{said}</output>
    </div>
  );
}
