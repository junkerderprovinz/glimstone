import { useState } from "react";
import { Button, PickerWindow } from "@glimstone/react";
import { STORAGE_TEXT, storageLine, storagePicker } from "../storageData";
import { Glyph } from "../glyph";

const { items, groups } = storagePicker((name) => <Glyph name={name} />);

export default function PickerWindowStorage() {
  const [open, setOpen] = useState(false);
  const [picked, setPicked] = useState<string | null>(null);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <Button label="Add storage" labelKey="add" onClick={() => setOpen(true)} />
      <output>{storageLine(picked)}</output>
      {open && (
        <PickerWindow
          title="Add storage"
          hint="Where the files go. Pick a cloud, a bucket store or a server."
          items={items}
          groups={groups}
          text={STORAGE_TEXT}
          onPick={(id) => {
            setOpen(false);
            setPicked(id);
          }}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}
