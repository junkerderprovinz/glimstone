import { useState } from "react";
import { PasswordField } from "@glimstone/react";

export default function PasswordFieldBasic() {
  const [secret, setSecret] = useState("correct horse");
  return (
    <div style={{ display: "grid", gap: 8, width: 320 }}>
      <input className="glim-input" aria-label="User name" defaultValue="anna" />
      <PasswordField aria-label="Password" value={secret} onChange={(e) => setSecret(e.target.value)} />
      <PasswordField aria-label="Token" value="read-only token" disabled readOnly />
    </div>
  );
}
