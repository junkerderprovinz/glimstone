<script lang="ts">
  import { SignInCard } from "@glimstone/svelte";
  import { signInServiceLabel, signInTextEn, signInTileTextEn, type SignInAnswer } from "@glimstone/core";
  import { IDENTITY_PROVIDERS } from "@glimstone/core/identityProviders";
  import logo from "../../../.github/assets/logo.svg?url";

  // "letmein" signs in, "two-step" asks for a code, which is 123456, and
  // "too-many" is refused with a reason two lines long. Any code from the log
  // works, and the new password needs 12 characters. The browser offers its
  // passkeys in the password field, and Pocket ID is the second way in.
  let said = $state("Nothing yet");

  // The kit sends no name for a service set up without one, so the catalog names it.
  const pocket = signInServiceLabel({ name: "", provider: "pocket-id" }, IDENTITY_PROVIDERS, signInTileTextEn);
  const POCKET_ID = { name: `Sign in with ${pocket.name}`, mark: pocket.mark ?? undefined };

  // No passkey answers here, so the offer runs until the card ends it.
  const offer = (signal: AbortSignal) => new Promise<SignInAnswer>((done) => signal.addEventListener("abort", () => done({})));

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
    reset
    minPassword={12}
    service={POCKET_ID}
    onService={() => (said = "Off to Pocket ID")}
    onSignIn={signIn}
    onPasskeyOffer={offer}
    onAskCode={async () => ({ ok: true })}
    onSetPassword={async () => {
      said = "Password set";
      return { ok: true };
    }}
  />
  <output data-hook="said">{said}</output>
</div>
