import { createSignal, Show } from "solid-js";
import { Button, PickerWindow } from "@glimstone/solid";
import { MCP_TEXT, mcpLine, mcpPicker } from "../mcpData";
import { Glyph } from "../solid/glyph";

function McpClientsWindow(props: { onPick: (id: string) => void; onClose: () => void }) {
  const { items, groups } = mcpPicker((name) => <Glyph name={name} />);
  return (
    <PickerWindow
      title="Connect a client"
      hint="The AI app that connects to this server, so the steps that follow fit it."
      items={items}
      groups={groups}
      text={MCP_TEXT}
      onPick={props.onPick}
      onClose={props.onClose}
    />
  );
}

export default function PickerWindowMcpClients() {
  const [open, setOpen] = createSignal(false);
  const [picked, setPicked] = createSignal<string | null>(null);
  return (
    <div style={{ display: "flex", "align-items": "center", gap: "12px" }}>
      <Button label="Connect a client" labelKey="add" onClick={() => setOpen(true)} />
      <output>{mcpLine(picked())}</output>
      <Show when={open()}>
        <McpClientsWindow
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
