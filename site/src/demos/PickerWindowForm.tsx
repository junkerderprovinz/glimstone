import { useState } from "react";
import { Button, PickerWindow, TextField } from "@glimstone/react";
import { CHANNEL_GROUPS, CHANNEL_TEXT, channelItems, labelOf } from "../channelData";
import { Glyph } from "../glyph";

const ITEMS = channelItems(<Glyph name="IconMail" />, <Glyph name="IconLink" />);

export default function PickerWindowForm() {
  const [open, setOpen] = useState(false);
  const [picked, setPicked] = useState<string | null>(null);
  const [address, setAddress] = useState("");
  const [saved, setSaved] = useState("Nothing saved yet");
  const close = () => {
    setOpen(false);
    setPicked(null);
  };
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <Button label="Connect a service" labelKey="add" onClick={() => setOpen(true)} />
      <output>{saved}</output>
      {open && (
        <PickerWindow
          title={picked ? labelOf(picked) : "Connect a service"}
          items={ITEMS}
          groups={CHANNEL_GROUPS}
          text={CHANNEL_TEXT}
          onPick={setPicked}
          actions={[{ label: "Save", labelKey: "save", primary: true, onClick: () => setSaved(`Saved: ${labelOf(picked!)} at ${address}`) }]}
          onBack={() => setPicked(null)}
          onClose={close}
        >
          {picked && <TextField label="Address" value={address} onChange={(e) => setAddress(e.target.value)} />}
        </PickerWindow>
      )}
    </div>
  );
}
