import { createSignal, Show } from "solid-js";
import { Button, FieldRow, PickerWindow, TextField } from "@glimstone/solid";
import { CHANNEL_GROUPS, CHANNEL_TEXT, channelItems, labelOf } from "../channelData";
import { Glyph } from "../solid/glyph";

export default function PickerWindowForm() {
  const [open, setOpen] = createSignal(false);
  const [picked, setPicked] = createSignal<string | null>(null);
  const [address, setAddress] = createSignal("");
  const [saved, setSaved] = createSignal("Nothing saved yet");
  const close = () => {
    setOpen(false);
    setPicked(null);
  };
  return (
    <div style={{ display: "flex", "align-items": "center", gap: "12px" }}>
      <Button label="Connect a service" labelKey="add" onClick={() => setOpen(true)} />
      <output>{saved()}</output>
      <Show when={open()}>
        <PickerWindow
          title={picked() ? labelOf(picked()!) : "Connect a service"}
          items={channelItems(<Glyph name="IconMail" />, <Glyph name="IconLink" />)}
          groups={CHANNEL_GROUPS}
          text={CHANNEL_TEXT}
          onPick={setPicked}
          actions={[
            {
              label: "Save",
              labelKey: "save",
              primary: true,
              onClick: () => {
                setSaved(`Saved: ${labelOf(picked()!)} at ${address()}`);
              },
            },
          ]}
          onBack={() => setPicked(null)}
          onClose={close}
        >
          <Show when={picked()}>
            <FieldRow label="Address" hint="Where the service takes its messages.">
              <TextField width="medium" value={address()} onInput={(e) => setAddress(e.currentTarget.value)} />
            </FieldRow>
          </Show>
        </PickerWindow>
      </Show>
    </div>
  );
}
