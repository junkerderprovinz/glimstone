import { useState } from "react";
import { CopyField, FieldRow, NumberField, PasswordField, Selector, TextField, Toggle } from "@glimstone/react";
import { Select } from "@glimstone/react/Select";

const LEVELS = [
  { id: "fast", label: "Fast" },
  { id: "even", label: "Even" },
  { id: "small", label: "Small" },
];
const KEEP = [
  { value: "week", label: "One week" },
  { value: "month", label: "One month" },
  { value: "year", label: "One year" },
];

export default function FieldRowBasic() {
  const [notify, setNotify] = useState(true);
  const [level, setLevel] = useState("even");
  const [keep, setKeep] = useState("month");
  return (
    <div style={{ display: "grid", gap: 8, width: "100%", maxWidth: 560 }}>
      <FieldRow label="Name" hint="Shown in the list of jobs.">
        <TextField width="medium" defaultValue="backup-weekly" />
      </FieldRow>
      <FieldRow label="Notify">
        <Toggle checked={notify} onChange={setNotify} />
      </FieldRow>
      <FieldRow label="Compression">
        <Selector items={LEVELS} value={level} onChange={setLevel} activation="manual" size="sm" buttonHeight />
      </FieldRow>
      <FieldRow label="Keep">
        <Select options={KEEP} value={keep} onChange={setKeep} />
      </FieldRow>
      <FieldRow label="Password">
        <PasswordField width="medium" />
      </FieldRow>
      <FieldRow label="Copies">
        <NumberField defaultValue={3} min={1} max={9} />
      </FieldRow>
      <FieldRow label="Link">
        <CopyField value="smb://bottich/media" className="glim-field--wide" />
      </FieldRow>
      <FieldRow label="Token" drawn={<>Token <small>optional</small></>}>
        <TextField width="medium" />
      </FieldRow>
      <FieldRow label="Mirror">
        <TextField width="medium" label="Its own name" />
      </FieldRow>
      <FieldRow label="Address">
        <TextField width="wide" mono defaultValue="smb://bottich/media" />
      </FieldRow>
      <FieldRow label="Last run" value="2 hours ago" />
      <FieldRow label="Failed" value="3" tone="fail" />
    </div>
  );
}
