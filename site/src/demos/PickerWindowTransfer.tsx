import { useState } from "react";
import { Button, PickerWindow } from "@glimstone/react";
import { TRANSFER_TEXT, transferLine, transferPicker } from "../transferData";
import { Glyph } from "../glyph";

const { items, groups } = transferPicker((name) => <Glyph name={name} />);

export default function PickerWindowTransfer() {
  const [open, setOpen] = useState(false);
  const [picked, setPicked] = useState<string | null>(null);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <Button label="Add a transfer link" labelKey="add" onClick={() => setOpen(true)} />
      <output>{transferLine(picked)}</output>
      {open && (
        <PickerWindow
          title="Add a transfer link"
          hint="The service that sent the file. Its link downloads without an account."
          items={items}
          groups={groups}
          text={TRANSFER_TEXT}
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
