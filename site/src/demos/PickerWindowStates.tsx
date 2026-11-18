import { useState } from "react";
import { Button, FieldRow, PickerWindow, TextField } from "@glimstone/react";
import { STORAGE_GROUPS, STORAGE_TEXT, placeOf, storageItems } from "../placeData";
import { Glyph } from "../glyph";

const ITEMS = storageItems((name) => <Glyph name={name} />);

export default function PickerWindowStates() {
  const [open, setOpen] = useState(false);
  const [picked, setPicked] = useState<string | null>(null);
  const [last, setLast] = useState<string | undefined>();
  const [path, setPath] = useState("");
  const [saved, setSaved] = useState("No place yet");
  const close = () => {
    setOpen(false);
    setPicked(null);
  };
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <Button label="Choose a place" labelKey="add" onClick={() => setOpen(true)} />
      <output>{saved}</output>
      {open && (
        <PickerWindow
          title={picked ? placeOf(picked) : "Choose a place"}
          items={ITEMS}
          groups={STORAGE_GROUPS}
          text={STORAGE_TEXT}
          selected={last}
          onPick={(id) => {
            setPicked(id);
            setLast(id);
          }}
          actions={[
            {
              label: "Save",
              labelKey: "save",
              primary: true,
              onClick: () => setSaved(`Saved: ${placeOf(picked!)} at ${path}`),
            },
          ]}
          onBack={() => setPicked(null)}
          onClose={close}
        >
          {picked && (
            <FieldRow label="Path" hint="Where on the place the backups go.">
              <TextField width="medium" value={path} onChange={(e) => setPath(e.target.value)} />
            </FieldRow>
          )}
        </PickerWindow>
      )}
    </div>
  );
}
