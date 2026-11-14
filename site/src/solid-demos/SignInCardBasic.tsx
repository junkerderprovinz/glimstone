import { createSignal } from "solid-js";
import { SignInCard } from "@glimstone/solid";
import { signInTextEn, type SignInAnswer } from "@glimstone/core";
import logo from "../../../.github/assets/logo.svg?url";

// "letmein" signs in, "two-step" asks for a code, which is 123456, and
// "too-many" is refused with a reason two lines long. Any code from the log
// works, and the new password needs 12 characters.
export default function SignInCardBasic() {
  const [said, setSaid] = createSignal("Nothing yet");

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
    <div class="signin-demo">
      <SignInCard
        logo={logo}
        appName="GlimStone"
        text={signInTextEn}
        passkey
        reset
        minPassword={12}
        onSignIn={signIn}
        onPasskey={async () => ({ needCode: true })}
        onAskCode={async () => ({ ok: true })}
        onSetPassword={async () => {
          setSaid("Password set");
          return { ok: true };
        }}
      />
      <output data-hook="said">{said()}</output>
    </div>
  );
}
