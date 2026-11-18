import { createSignal, Show } from "solid-js";
import { Button, PickerWindow } from "@glimstone/solid";
import { CHANNEL_GROUPS, CHANNEL_TEXT, channelItems, pickedLine } from "../channelData";
import { Glyph } from "../solid/glyph";

export default function PickerWindowChannels() {
  const [open, setOpen] = createSignal(false);
  const [picked, setPicked] = createSignal<string[]>([]);
  return (
    <div style={{ display: "flex", "align-items": "center", gap: "12px" }}>
      <Button label="Add a channel" labelKey="add" onClick={() => setOpen(true)} />
      <output>{pickedLine(picked())}</output>
      <Show when={open()}>
        <PickerWindow
          title="Add a channel"
          hint="Where a message goes. Pick a service, then fill in its few fields."
          items={channelItems(<Glyph name="IconMail" />, <Glyph name="IconLink" />)}
          groups={CHANNEL_GROUPS}
          text={CHANNEL_TEXT}
          onPick={(id) => {
            setOpen(false);
            setPicked((p) => [...p, id]);
          }}
          onClose={() => setOpen(false)}
        />
      </Show>
    </div>
  );
}
