import { useRef, useState } from "react";
import { Button, PasswordField } from "@glimstone/react";

export default function PasswordFieldBasic() {
  const [secret, setSecret] = useState("correct horse");
  const field = useRef<HTMLInputElement>(null);
  return (
    <div style={{ display: "grid", gap: 8, width: 320 }}>
      <input className="glim-input" aria-label="User name" defaultValue="anna" />
      <PasswordField ref={field} aria-label="Password" eyeAttrs={{ "data-hook": "eye" }} value={secret} onChange={(e) => setSecret(e.target.value)} />
      <PasswordField aria-label="Token" value="read-only token" disabled readOnly />
      <div>
        <Button label="Focus the password" labelKey={null} onClick={() => field.current?.focus()} />
      </div>
    </div>
  );
}
