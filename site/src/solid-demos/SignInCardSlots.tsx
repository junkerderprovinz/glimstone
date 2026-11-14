import { createSignal, Show } from "solid-js";
import { Button, FieldRow, SignInCard, SignInField, TextField, Toggle } from "@glimstone/solid";
import { signInTextEn } from "@glimstone/core";
import logo from "../../../.github/assets/logo.svg?url";

// A name and a switch above the password, a second way in under Sign in, and a
// step of the app's own once the new password is set.
export default function SignInCardSlots() {
  const [name, setName] = createSignal("");
  const [stay, setStay] = createSignal(true);
  const [done, setDone] = createSignal(false);

  return (
    <div class="signin-demo">
      <SignInCard
        logo={logo}
        appName="GlimStone"
        text={signInTextEn}
        reset
        autoFocus={false}
        idPrefix="solid-slots"
        fields={
          <>
            <SignInField label="Name" htmlFor="solid-slots-name">
              <TextField id="solid-slots-name" value={name()} onInput={(e) => setName(e.currentTarget.value)} autocomplete="username" />
            </SignInField>
            <FieldRow label="Stay signed in">
              <Toggle checked={stay()} onChange={setStay} />
            </FieldRow>
          </>
        }
        actions={<Button label="Sign in with Authentik" labelKey={null} />}
        step={
          <Show when={done()}>
            <div class="glim-signin-form" role="status">
              <p>Your new password is set.</p>
              <Button label="Done" labelKey={null} tone="accent" onClick={() => setDone(false)} />
            </div>
          </Show>
        }
        onSignIn={async () => ({ error: "That password is not right" })}
        onAskCode={async () => ({ ok: true })}
        onSetPassword={async () => {
          setDone(true);
          return { ok: true };
        }}
      />
    </div>
  );
}
