import { createSignal, Show } from "solid-js";
import { Button, FieldRow, PickerWindow, TextField } from "@glimstone/solid";
import { STORAGE_GROUPS, STORAGE_TEXT, placeOf, storageItems } from "../storageData";
import { Glyph } from "../solid/glyph";

export default function PickerWindowStates() {
  const [open, setOpen] = createSignal(false);
  const [picked, setPicked] = createSignal<string | null>(null);
  const [last, setLast] = createSignal<string | undefined>();
  const [path, setPath] = createSignal("");
  const [saved, setSaved] = createSignal("No place yet");
  return (
    <div style={{ display: "flex", "align-items": "center", gap: "12px" }}>
      <Button label="Choose a place" labelKey="add" onClick={() => setOpen(true)} />
      <output>{saved()}</output>
      <Show when={open()}>
        <PickerWindow
          title={picked() ? placeOf(picked()!) : "Choose a place"}
          items={storageItems((name) => <Glyph name={name} />)}
          groups={STORAGE_GROUPS}
          text={STORAGE_TEXT}
          selected={last()}
          onPick={(id) => {
            setPicked(id);
            setLast(id);
          }}
          actions={[
            {
              label: "Save",
              labelKey: "save",
              primary: true,
              onClick: () => {
                setSaved(`Saved: ${placeOf(picked()!)} at ${path()}`);
              },
            },
          ]}
          onBack={() => setPicked(null)}
          onClose={() => {
            setOpen(false);
            setPicked(null);
          }}
        >
          <Show when={picked()}>
            <FieldRow label="Path" hint="Where on the place the backups go.">
              <TextField width="medium" value={path()} onInput={(e) => setPath(e.currentTarget.value)} />
            </FieldRow>
          </Show>
        </PickerWindow>
      </Show>
    </div>
  );
}
