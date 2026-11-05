import { useState } from "react";
import { FieldRow, FieldRowGroup, PasswordField, TextField, Toggle } from "@glimstone/react";

export default function FieldRowGroupDemo() {
  const [notify, setNotify] = useState(true);
  return (
    <div style={{ width: "100%", maxWidth: 480 }}>
      <FieldRowGroup>
        <FieldRow label="Find">
          <TextField width="grow" defaultValue="report" />
        </FieldRow>
        <FieldRow label="Replace with">
          <TextField width="grow" defaultValue="summary" />
        </FieldRow>
        <FieldRow label="Password">
          <PasswordField width="grow" />
        </FieldRow>
        <FieldRow label="Notify">
          <Toggle checked={notify} onChange={setNotify} />
        </FieldRow>
        <FieldRow label="Hours">
          <TextField label="From" width="short" defaultValue="08:00" />
          <TextField label="To" width="short" defaultValue="17:00" />
        </FieldRow>
        <FieldRow label="Last run" value="2 hours ago" />
      </FieldRowGroup>
    </div>
  );
}
