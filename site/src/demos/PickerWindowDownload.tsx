import { useState } from "react";
import { Button, PickerWindow } from "@glimstone/react";
import { DOWNLOAD_TEXT, downloadLine, downloadPicker } from "../downloadData";
import { Glyph } from "../glyph";

const { items, groups } = downloadPicker((name) => <Glyph name={name} />);

export default function PickerWindowDownload() {
  const [open, setOpen] = useState(false);
  const [picked, setPicked] = useState<string | null>(null);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <Button label="Add an account" labelKey="add" onClick={() => setOpen(true)} />
      <output>{downloadLine(picked)}</output>
      {open && (
        <PickerWindow
          title="Add an account"
          hint="Where the links are unlocked. Pick a debrid service or a hoster you have a login at."
          items={items}
          groups={groups}
          text={DOWNLOAD_TEXT}
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
