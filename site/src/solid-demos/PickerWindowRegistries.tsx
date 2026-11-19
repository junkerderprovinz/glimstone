import { createSignal, Show } from "solid-js";
import { Button, PickerWindow } from "@glimstone/solid";
import { REGISTRY_TEXT, registryLine, registryPicker } from "../registryData";
import { Glyph } from "../solid/glyph";

function RegistriesWindow(props: { onPick: (id: string) => void; onClose: () => void }) {
  const { items, groups } = registryPicker((name) => <Glyph name={name} />);
  return (
    <PickerWindow
      title="Add a registry"
      hint="Where private images come from. Pick the registry to sign in to."
      items={items}
      groups={groups}
      text={REGISTRY_TEXT}
      onPick={props.onPick}
      onClose={props.onClose}
    />
  );
}

export default function PickerWindowRegistries() {
  const [open, setOpen] = createSignal(false);
  const [picked, setPicked] = createSignal<string | null>(null);
  return (
    <div style={{ display: "flex", "align-items": "center", gap: "12px" }}>
      <Button label="Add a registry" labelKey="add" onClick={() => setOpen(true)} />
      <output>{registryLine(picked())}</output>
      <Show when={open()}>
        <RegistriesWindow
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
