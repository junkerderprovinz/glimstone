import { createSignal } from "solid-js";
import { Button, FieldRow, PasswordField } from "@glimstone/solid";

export default function PasswordFieldConfirm() {
  const [password, setPassword] = createSignal("");
  const [confirmed, setConfirmed] = createSignal(false);
  const [said, setSaid] = createSignal("");
  const save = () => {
    setPassword("");
    setSaid("Password set");
  };
  return (
    <div style={{ display: "grid", gap: "8px", width: "100%", "max-width": "480px" }}>
      <FieldRow label="New password">
        <PasswordField width="medium" confirm onConfirmedChange={setConfirmed} value={password()} onInput={(e) => setPassword(e.currentTarget.value)} />
      </FieldRow>
      <div>
        <Button label="Set password" labelKey={null} tone="accent" disabled={!confirmed()} onClick={save} />
      </div>
      <output>{said()}</output>
    </div>
  );
}
