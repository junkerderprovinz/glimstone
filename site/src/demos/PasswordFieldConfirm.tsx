import { useState } from "react";
import { Button, FieldRow, PasswordField } from "@glimstone/react";

export default function PasswordFieldConfirm() {
  const [password, setPassword] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [said, setSaid] = useState("");
  const save = () => {
    setPassword("");
    setSaid("Password set");
  };
  return (
    <div style={{ display: "grid", gap: 8, width: "100%", maxWidth: 480 }}>
      <FieldRow label="New password">
        <PasswordField width="medium" confirm onConfirmedChange={setConfirmed} value={password} onChange={(e) => setPassword(e.target.value)} />
      </FieldRow>
      <div>
        <Button label="Set password" labelKey={null} tone="accent" disabled={!confirmed} onClick={save} />
      </div>
      <output>{said}</output>
    </div>
  );
}
