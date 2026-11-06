import { useState } from "react";
import { Button, FieldRow, SignInCard, SignInField, TextField, Toggle } from "@glimstone/react";
import { signInTextEn } from "@glimstone/core";
import logo from "../../../.github/assets/logo.svg?url";

// A name and a switch above the password, a second way in under Sign in, and a
// step of the app's own once the new password is set.
export default function SignInCardSlots() {
  const [name, setName] = useState("");
  const [stay, setStay] = useState(true);
  const [done, setDone] = useState(false);

  return (
    <div className="signin-demo">
      <SignInCard
        logo={logo}
        appName="GlimStone"
        text={signInTextEn}
        reset
        autoFocus={false}
        idPrefix="slots"
        fields={
          <>
            <SignInField label="Name" htmlFor="slots-name">
              <TextField id="slots-name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="username" />
            </SignInField>
            <FieldRow label="Stay signed in">
              <Toggle checked={stay} onChange={setStay} />
            </FieldRow>
          </>
        }
        actions={<Button label="Sign in with Authentik" labelKey={null} />}
        step={
          done ? (
            <div className="glim-signin-form" role="status">
              <p>Your new password is set.</p>
              <Button label="Done" labelKey={null} tone="accent" onClick={() => setDone(false)} />
            </div>
          ) : undefined
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
