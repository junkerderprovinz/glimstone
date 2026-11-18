import { createSignal, Show } from "solid-js";
import { Button, Card, FieldRow, PickerWindow, TextField } from "@glimstone/solid";
import { CHANNEL_GROUPS, CHANNEL_TEXT, channelItems, labelOf, testAddress } from "../channelData";
import { Glyph } from "../solid/glyph";

export default function PickerWindowForm() {
  const [open, setOpen] = createSignal(false);
  const [picked, setPicked] = createSignal<string | null>(null);
  const [address, setAddress] = createSignal("");
  const [testing, setTesting] = createSignal(false);
  const [reached, setReached] = createSignal<boolean | null>(null);
  const [saved, setSaved] = createSignal("Nothing saved yet");
  const back = () => {
    setPicked(null);
    setReached(null);
  };
  const test = async () => {
    setTesting(true);
    setReached(await testAddress(address()));
    setTesting(false);
  };
  return (
    <Card title="Storage" hueIndex={2}>
      <div style={{ display: "flex", "align-items": "center", gap: "12px" }}>
        <Button label="Connect a service" labelKey="add" onClick={() => setOpen(true)} />
        <output>{saved()}</output>
      </div>
      <Show when={open()}>
        <PickerWindow
          title={picked() ? labelOf(picked()!) : "Connect a service"}
          items={channelItems(<Glyph name="IconMail" />, <Glyph name="IconLink" />)}
          groups={CHANNEL_GROUPS}
          text={CHANNEL_TEXT}
          onPick={setPicked}
          actions={[
            {
              label: "Test connection",
              labelKey: "confirm",
              tone: reached() === null ? undefined : reached() ? "ok" : "danger",
              busy: testing(),
              title: reached() === null ? undefined : reached() ? "Reached" : "Not reached",
              onClick: () => {
                void test();
                return false;
              },
            },
            {
              label: "Save",
              labelKey: "save",
              primary: true,
              onClick: () => {
                setSaved(`Saved: ${labelOf(picked()!)} at ${address()}`);
              },
            },
          ]}
          onBack={back}
          onClose={() => {
            setOpen(false);
            back();
          }}
        >
          <Show when={picked()}>
            <FieldRow label="Address" hint="Where the service takes its messages.">
              <TextField width="medium" value={address()} onInput={(e) => setAddress(e.currentTarget.value)} />
            </FieldRow>
          </Show>
        </PickerWindow>
      </Show>
    </Card>
  );
}
