import { createSignal, Show } from "solid-js";
import { Button, PickerWindow } from "@glimstone/solid";
import { STORAGE_TEXT, storageLine, storagePicker } from "../storageData";
import { Glyph } from "../solid/glyph";

function StorageWindow(props: { onPick: (id: string) => void; onClose: () => void }) {
  const { items, groups } = storagePicker((name) => <Glyph name={name} />);
  return (
    <PickerWindow
      title="Add storage"
      hint="Where the files go. Pick a cloud, a bucket store or a server."
      items={items}
      groups={groups}
      text={STORAGE_TEXT}
      onPick={props.onPick}
      onClose={props.onClose}
    />
  );
}

export default function PickerWindowStorage() {
  const [open, setOpen] = createSignal(false);
  const [picked, setPicked] = createSignal<string | null>(null);
  return (
    <div style={{ display: "flex", "align-items": "center", gap: "12px" }}>
      <Button label="Add storage" labelKey="add" onClick={() => setOpen(true)} />
      <output>{storageLine(picked())}</output>
      <Show when={open()}>
        <StorageWindow
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
