import { useState } from "react";
import { Button, Card, FieldRow, PickerWindow, TextField } from "@glimstone/react";
import { CHANNEL_TEXT, channelPicker, labelOf, testAddress } from "../channelData";
import { Glyph } from "../glyph";

const { items, groups } = channelPicker((name) => <Glyph name={name} />);

export default function PickerWindowForm() {
  const [open, setOpen] = useState(false);
  const [picked, setPicked] = useState<string | null>(null);
  const [address, setAddress] = useState("");
  const [testing, setTesting] = useState(false);
  const [reached, setReached] = useState<boolean | null>(null);
  const [saved, setSaved] = useState("Nothing saved yet");
  const back = () => {
    setPicked(null);
    setReached(null);
  };
  const test = async () => {
    setTesting(true);
    setReached(await testAddress(address));
    setTesting(false);
  };
  return (
    <Card title="Storage" hueIndex={2}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <Button label="Connect a service" labelKey="add" onClick={() => setOpen(true)} />
        <output>{saved}</output>
      </div>
      {open && (
        <PickerWindow
          title={picked ? labelOf(picked) : "Connect a service"}
          items={items}
          groups={groups}
          text={CHANNEL_TEXT}
          onPick={setPicked}
          start={reached === null ? "" : reached ? "Reached" : "Not reached"}
          actions={[
            {
              label: "Test connection",
              labelKey: "confirm",
              tone: reached === null ? undefined : reached ? "ok" : "danger",
              busy: testing,
              title: reached === null ? undefined : reached ? "Reached" : "Not reached",
              onClick: () => {
                void test();
                return false;
              },
            },
            { label: "Save", labelKey: "save", primary: true, onClick: () => setSaved(`Saved: ${labelOf(picked!)} at ${address}`) },
          ]}
          onBack={back}
          onClose={() => {
            setOpen(false);
            back();
          }}
        >
          {picked && (
            <FieldRow label="Address" hint="Where the service takes its messages.">
              <TextField width="medium" value={address} onChange={(e) => setAddress(e.target.value)} />
            </FieldRow>
          )}
        </PickerWindow>
      )}
    </Card>
  );
}
