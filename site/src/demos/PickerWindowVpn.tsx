import { useState } from "react";
import { Button, PickerWindow } from "@glimstone/react";
import { VPN_TEXT, vpnLine, vpnPicker } from "../vpnData";
import { Glyph } from "../glyph";

const { items, groups } = vpnPicker((name) => <Glyph name={name} />);

export default function PickerWindowVpn() {
  const [open, setOpen] = useState(false);
  const [picked, setPicked] = useState<string | null>(null);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <Button label="Add a VPN" labelKey="add" onClick={() => setOpen(true)} />
      <output>{vpnLine(picked)}</output>
      {open && (
        <PickerWindow
          title="Add a VPN"
          hint="Where the traffic goes. Pick your provider, or a WireGuard server of your own."
          items={items}
          groups={groups}
          text={VPN_TEXT}
          onPick={(id) => {
            setOpen(false);
            setPicked(id);
          }}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}
