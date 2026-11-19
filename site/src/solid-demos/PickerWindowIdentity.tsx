import { createSignal, Show } from "solid-js";
import { Button, PickerWindow } from "@glimstone/solid";
import { IDENTITY_TEXT, identityLine, identityPicker } from "../identityData";
import { Glyph } from "../solid/glyph";

function IdentityWindow(props: { onPick: (id: string) => void; onClose: () => void }) {
  const { items, groups } = identityPicker((name) => <Glyph name={name} />);
  return (
    <PickerWindow
      title="Add single sign-on"
      hint="The service people sign in through, over OpenID Connect."
      items={items}
      groups={groups}
      text={IDENTITY_TEXT}
      onPick={props.onPick}
      onClose={props.onClose}
    />
  );
}

export default function PickerWindowIdentity() {
  const [open, setOpen] = createSignal(false);
  const [picked, setPicked] = createSignal<string | null>(null);
  return (
    <div style={{ display: "flex", "align-items": "center", gap: "12px" }}>
      <Button label="Add single sign-on" labelKey="add" onClick={() => setOpen(true)} />
      <output>{identityLine(picked())}</output>
      <Show when={open()}>
        <IdentityWindow
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
