import { createSignal, Show } from "solid-js";
import { Button, PickerWindow } from "@glimstone/solid";
import { VPN_TEXT, vpnLine, vpnPicker } from "../vpnData";
import { Glyph } from "../solid/glyph";

function VpnWindow(props: { onPick: (id: string) => void; onClose: () => void }) {
  const { items, groups } = vpnPicker((name) => <Glyph name={name} />);
  return (
    <PickerWindow
      title="Add a VPN"
      hint="Where the traffic goes. Pick your provider, or a WireGuard server of your own."
      items={items}
      groups={groups}
      text={VPN_TEXT}
      onPick={props.onPick}
      onClose={props.onClose}
    />
  );
}

export default function PickerWindowVpn() {
  const [open, setOpen] = createSignal(false);
  const [picked, setPicked] = createSignal<string | null>(null);
  return (
    <div style={{ display: "flex", "align-items": "center", gap: "12px" }}>
      <Button label="Add a VPN" labelKey="add" onClick={() => setOpen(true)} />
      <output>{vpnLine(picked())}</output>
      <Show when={open()}>
        <VpnWindow
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
