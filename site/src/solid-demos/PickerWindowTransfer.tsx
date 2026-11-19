import { createSignal, Show } from "solid-js";
import { Button, PickerWindow } from "@glimstone/solid";
import { TRANSFER_TEXT, transferLine, transferPicker } from "../transferData";
import { Glyph } from "../solid/glyph";

function TransferWindow(props: { onPick: (id: string) => void; onClose: () => void }) {
  const { items, groups } = transferPicker((name) => <Glyph name={name} />);
  return (
    <PickerWindow
      title="Add a transfer link"
      hint="The service that sent the file. Its link downloads without an account."
      items={items}
      groups={groups}
      text={TRANSFER_TEXT}
      onPick={props.onPick}
      onClose={props.onClose}
    />
  );
}

export default function PickerWindowTransfer() {
  const [open, setOpen] = createSignal(false);
  const [picked, setPicked] = createSignal<string | null>(null);
  return (
    <div style={{ display: "flex", "align-items": "center", gap: "12px" }}>
      <Button label="Add a transfer link" labelKey="add" onClick={() => setOpen(true)} />
      <output>{transferLine(picked())}</output>
      <Show when={open()}>
        <TransferWindow
          onPick={(id) => {
            setOpen(false);
            setPicked(id);
          }}
          onClose={() => setOpen(false)}
        />
      </Show>
    </div>
  );
}
