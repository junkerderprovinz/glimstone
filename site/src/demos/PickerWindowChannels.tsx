import { useState } from "react";
import { Button, PickerWindow } from "@glimstone/react";
import { CHANNEL_TEXT, channelPicker, pickedLine } from "../channelData";
import { Glyph } from "../glyph";

const { items, groups } = channelPicker((name) => <Glyph name={name} />);

export default function PickerWindowChannels() {
  const [open, setOpen] = useState(false);
  const [picked, setPicked] = useState<string[]>([]);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <Button label="Add a channel" labelKey="add" onClick={() => setOpen(true)} />
      <output>{pickedLine(picked)}</output>
      {open && (
        <PickerWindow
          title="Add a channel"
          hint="Where a message goes. Pick a service, then fill in its few fields."
          items={items}
          groups={groups}
          text={CHANNEL_TEXT}
          onPick={(id) => {
            setOpen(false);
            setPicked((p) => [...p, id]);
          }}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}
