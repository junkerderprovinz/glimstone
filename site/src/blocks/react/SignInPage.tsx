import { SignInCard } from "@glimstone/react";
import { signInTextEn, type SignInAnswer } from "@glimstone/core";
import logo from "../../../../.github/assets/logo.svg?url";

// "letmein" signs in, and any other password is refused.
async function signIn({ password }: { password: string }): Promise<SignInAnswer> {
  if (password !== "letmein") return { error: "That password is not right" };
  return { ok: true };
}

export default function SignInPage() {
  return (
    <SignInCard
      className="block-signin"
      logo={logo}
      appName="GlimStone"
      text={signInTextEn}
      passkey
      reset
      minPassword={12}
      onSignIn={signIn}
      onPasskey={async () => ({ error: "No passkey is set up on this device" })}
      onAskCode={async () => ({ ok: true })}
      onSetPassword={async () => ({ ok: true })}
    />
  );
}
