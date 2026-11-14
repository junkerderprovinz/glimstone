<script lang="ts">
  import { SignInCard } from "@glimstone/svelte";
  import { signInTextEn, type SignInAnswer } from "@glimstone/core";
  import logo from "../../../.github/assets/logo.svg?url";

  // "letmein" signs in, "two-step" asks for a code, which is 123456, and
  // "too-many" is refused with a reason two lines long. Any code from the log
  // works, and the new password needs 12 characters.
  let said = $state("Nothing yet");

  async function signIn({ password, code }: { password: string; code?: string }): Promise<SignInAnswer> {
    if (code !== undefined) {
      if (code !== "123456") return { needCode: true, error: "That code is not valid" };
      said = "Signed in with a code";
      return { ok: true };
    }
    if (password === "two-step") return { needCode: true };
    if (password === "too-many") return { error: "Too many tries in a row. Wait five minutes before you try again." };
    if (password !== "letmein") return { error: "That password is not right" };
    said = "Signed in";
    return { ok: true };
  }
</script>

<div class="signin-demo">
  <SignInCard
    {logo}
    appName="GlimStone"
    text={signInTextEn}
    passkey
    reset
    minPassword={12}
    onSignIn={signIn}
    onPasskey={async () => ({ needCode: true })}
    onAskCode={async () => ({ ok: true })}
    onSetPassword={async () => {
      said = "Password set";
      return { ok: true };
    }}
  />
  <output data-hook="said">{said}</output>
</div>
