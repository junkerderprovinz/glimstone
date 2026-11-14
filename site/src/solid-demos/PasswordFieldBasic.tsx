import { createSignal } from "solid-js";
import { Button, PasswordField } from "@glimstone/solid";

export default function PasswordFieldBasic() {
  const [secret, setSecret] = createSignal("correct horse");
  let field: HTMLInputElement | undefined;
  return (
    <div style={{ display: "grid", gap: "8px", width: "320px" }}>
      <input class="glim-input" aria-label="User name" value="anna" />
      <PasswordField ref={field} aria-label="Password" eyeAttrs={{ "data-hook": "eye" }} value={secret()} onInput={(e) => setSecret(e.currentTarget.value)} />
      <PasswordField aria-label="Token" value="read-only token" disabled readonly />
      <div>
        <Button label="Focus the password" labelKey={null} onClick={() => field?.focus()} />
      </div>
    </div>
  );
}
