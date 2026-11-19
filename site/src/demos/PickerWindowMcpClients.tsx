import { useState } from "react";
import { Button, PickerWindow } from "@glimstone/react";
import { MCP_TEXT, mcpLine, mcpPicker } from "../mcpData";
import { Glyph } from "../glyph";

const { items, groups } = mcpPicker((name) => <Glyph name={name} />);

export default function PickerWindowMcpClients() {
  const [open, setOpen] = useState(false);
  const [picked, setPicked] = useState<string | null>(null);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <Button label="Connect a client" labelKey="add" onClick={() => setOpen(true)} />
      <output>{mcpLine(picked)}</output>
      {open && (
        <PickerWindow
          title="Connect a client"
          hint="The AI app that connects to this server, so the steps that follow fit it."
          items={items}
          groups={groups}
          text={MCP_TEXT}
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
