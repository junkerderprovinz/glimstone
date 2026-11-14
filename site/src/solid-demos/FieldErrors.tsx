import { createSignal } from "solid-js";
import { FieldRow, NumberField, PasswordField, TextField } from "@glimstone/solid";

export default function FieldErrors() {
  const [port, setPort] = createSignal("8080");
  const [job, setJob] = createSignal("nightly");
  const portError = () => (/^\d{1,5}$/.test(port()) && Number(port()) <= 65535 ? undefined : "A port is a number up to 65535");
  return (
    <div data-column style={{ display: "grid", gap: "12px", width: "420px", "justify-items": "start" }}>
      <TextField label="Port" width="short" value={port()} onInput={(e) => setPort(e.currentTarget.value)} error={portError()} />
      <div style={{ width: "100%" }}>
        <FieldRow label="Job name">
          <TextField width="medium" value={job()} onInput={(e) => setJob(e.currentTarget.value)} error={job().trim() ? undefined : "A job needs a name"} />
        </FieldRow>
      </div>
      <PasswordField aria-label="Token" value="short" error="A token has 32 characters" />
      <NumberField aria-label="Keep" value={0} min={0} error="Keep at least one copy" />
    </div>
  );
}
