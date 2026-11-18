import { useState } from "react";
import { Button, PickerWindow } from "@glimstone/react";
import { CHANNEL_GROUPS, CHANNEL_TEXT, channelItems, pickedLine } from "../channelData";
import { Glyph } from "../glyph";

const ITEMS = channelItems(<Glyph name="IconMail" />, <Glyph name="IconLink" />);

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
          items={ITEMS}
          groups={CHANNEL_GROUPS}
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
