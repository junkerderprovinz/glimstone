import { createSignal } from "solid-js";
import { CopyField, FieldRow, NumberField, PasswordField, Selector, TextField, Toggle } from "@glimstone/solid";
import { Combobox } from "@glimstone/solid/Combobox";
import { Select } from "@glimstone/solid/Select";
import { Slider } from "@glimstone/solid/Slider";

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

const ZONES = [
  { value: "vienna", label: "Vienna" },
  { value: "berlin", label: "Berlin" },
];

export default function FieldRowBasic() {
  const [notify, setNotify] = createSignal(true);
  const [level, setLevel] = createSignal("even");
  const [keep, setKeep] = createSignal("month");
  const [volume, setVolume] = createSignal(40);
  const [zone, setZone] = createSignal("vienna");
  return (
    <div style={{ display: "grid", gap: "8px", width: "100%", "max-width": "560px" }}>
      <FieldRow label="Name" hint="Shown in the list of jobs.">
        <TextField width="medium" value="backup-weekly" />
      </FieldRow>
      <FieldRow label="Notify">
        <Toggle checked={notify()} onChange={setNotify} />
      </FieldRow>
      <FieldRow label="Compression">
        <Selector items={LEVELS} value={level()} onChange={setLevel} activation="manual" size="sm" buttonHeight />
      </FieldRow>
      <FieldRow label="Keep">
        <Select options={KEEP} value={keep()} onChange={setKeep} />
      </FieldRow>
      <FieldRow label="Password">
        <PasswordField width="medium" />
      </FieldRow>
      <FieldRow label="Copies">
        <NumberField value={3} min={1} max={9} />
      </FieldRow>
      <FieldRow label="Link">
        <CopyField value="smb://bottich/media" width="wide" />
      </FieldRow>
      <FieldRow
        label="Token"
        drawn={
          <>
            Token <small>optional</small>
          </>
        }
      >
        <TextField width="medium" />
      </FieldRow>
      <FieldRow label="Mirror">
        <TextField width="medium" label="Its own name" />
      </FieldRow>
      <FieldRow label="Address">
        <TextField width="wide" mono value="smb://bottich/media" />
      </FieldRow>
      <FieldRow label="Share link">
        <TextField width="grow" mono value="https://bottich/s/3f9a" />
      </FieldRow>
      <FieldRow label="Hours">
        <TextField label="From" width="short" value="08:00" />
        <TextField label="To" width="short" value="17:00" />
      </FieldRow>
      <FieldRow label="Volume">
        <Slider value={volume()} onChange={setVolume} min={0} max={100} format={(v) => `${v}%`} />
      </FieldRow>
      <FieldRow label="Zone">
        <Combobox options={ZONES} value={zone()} onChange={setZone} empty="No match" toggleLabel="Show all zones" />
      </FieldRow>
      <FieldRow label="Last run" value="2 hours ago" />
      <FieldRow label="Failed" value="3" tone="fail" />
    </div>
  );
}
