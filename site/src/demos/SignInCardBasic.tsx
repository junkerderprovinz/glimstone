import { useState } from "react";
import { SignInCard } from "@glimstone/react";
import { signInTextEn, type SignInAnswer } from "@glimstone/core";
import { IDENTITY_PROVIDERS } from "@glimstone/core/identityProviders";
import logo from "../../../.github/assets/logo.svg?url";

// "letmein" signs in, "two-step" asks for a code, which is 123456, and
// "too-many" is refused with a reason two lines long. Any code from the log
// works, and the new password needs 12 characters. The browser offers its
// passkeys in the password field, and Pocket ID is the second way in.
const POCKET_ID = { name: "Sign in with Pocket ID", mark: IDENTITY_PROVIDERS.entries.find((e) => e.id === "pocket-id")!.mark };

// No passkey answers here, so the offer runs until the card ends it.
const offer = (signal: AbortSignal) => new Promise<SignInAnswer>((done) => signal.addEventListener("abort", () => done({})));

export default function SignInCardBasic() {
  const [said, setSaid] = useState("Nothing yet");

  async function signIn({ password, code }: { password: string; code?: string }): Promise<SignInAnswer> {
    if (code !== undefined) {
      if (code !== "123456") return { needCode: true, error: "That code is not valid" };
      setSaid("Signed in with a code");
      return { ok: true };
    }
    if (password === "two-step") return { needCode: true };
  if (password === "too-many") return { error: "Too many tries in a row. Wait five minutes before you try again." };
    if (password !== "letmein") return { error: "That password is not right" };
    setSaid("Signed in");
    return { ok: true };
  }

  return (
    <div className="signin-demo">
      <SignInCard
        logo={logo}
        appName="GlimStone"
        text={signInTextEn}
        reset
        minPassword={12}
        service={POCKET_ID}
        onService={() => setSaid("Off to Pocket ID")}
        onSignIn={signIn}
        onPasskeyOffer={offer}
        onAskCode={async () => ({ ok: true })}
        onSetPassword={async () => {
          setSaid("Password set");
          return { ok: true };
        }}
      />
      <output data-hook="said">{said}</output>
    </div>
  );
}
