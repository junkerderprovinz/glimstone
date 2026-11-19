import { useState } from "react";
import { Button, PickerWindow } from "@glimstone/react";
import { IDENTITY_TEXT, identityLine, identityPicker } from "../identityData";
import { Glyph } from "../glyph";

const { items, groups } = identityPicker((name) => <Glyph name={name} />);

export default function PickerWindowIdentity() {
  const [open, setOpen] = useState(false);
  const [picked, setPicked] = useState<string | null>(null);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <Button label="Add single sign-on" labelKey="add" onClick={() => setOpen(true)} />
      <output>{identityLine(picked)}</output>
      {open && (
        <PickerWindow
          title="Add single sign-on"
          hint="The service people sign in through, over OpenID Connect."
          items={items}
          groups={groups}
          text={IDENTITY_TEXT}
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
