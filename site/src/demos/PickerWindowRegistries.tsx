import { useState } from "react";
import { Button, PickerWindow } from "@glimstone/react";
import { REGISTRY_TEXT, registryLine, registryPicker } from "../registryData";
import { Glyph } from "../glyph";

const { items, groups } = registryPicker((name) => <Glyph name={name} />);

export default function PickerWindowRegistries() {
  const [open, setOpen] = useState(false);
  const [picked, setPicked] = useState<string | null>(null);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <Button label="Add a registry" labelKey="add" onClick={() => setOpen(true)} />
      <output>{registryLine(picked)}</output>
      {open && (
        <PickerWindow
          title="Add a registry"
          hint="Where private images come from. Pick the registry to sign in to."
          items={items}
          groups={groups}
          text={REGISTRY_TEXT}
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
