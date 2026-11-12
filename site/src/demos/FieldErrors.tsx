import { useState } from "react";
import { FieldRow, NumberField, PasswordField, TextField } from "@glimstone/react";

export default function FieldErrors() {
  const [port, setPort] = useState("8080");
  const [job, setJob] = useState("nightly");
  const portError = /^\d{1,5}$/.test(port) && Number(port) <= 65535 ? undefined : "A port is a number up to 65535";
  return (
    <div data-column style={{ display: "grid", gap: 12, width: 420, justifyItems: "start" }}>
      <TextField label="Port" width="short" value={port} onChange={(e) => setPort(e.target.value)} error={portError} />
      <div style={{ width: "100%" }}>
        <FieldRow label="Job name">
          <TextField width="medium" value={job} onChange={(e) => setJob(e.target.value)} error={job.trim() ? undefined : "A job needs a name"} />
        </FieldRow>
      </div>
      <PasswordField aria-label="Token" defaultValue="short" error="A token has 32 characters" />
      <NumberField aria-label="Keep" defaultValue={0} min={0} error="Keep at least one copy" />
    </div>
  );
}
