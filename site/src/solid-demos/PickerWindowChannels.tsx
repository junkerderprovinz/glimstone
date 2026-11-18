import { createSignal, Show } from "solid-js";
import { Button, PickerWindow } from "@glimstone/solid";
import { CHANNEL_TEXT, channelPicker, pickedLine } from "../channelData";
import { Glyph } from "../solid/glyph";

export default function PickerWindowChannels() {
  const channels = channelPicker((name) => <Glyph name={name} />);
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
          items={channels.items}
          groups={channels.groups}
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
