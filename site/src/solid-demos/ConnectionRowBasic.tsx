import { createSignal, For, Show } from "solid-js";
import { Badge, Card, ConnectionRow, type ConnectionTest } from "@glimstone/solid";
import { CONNECTION_TEXT, CONNECTIONS, testConnection, type DemoConnection } from "../connectionData";
import { Glyph } from "../solid/glyph";

export default function ConnectionRowBasic() {
  const [rows, setRows] = createSignal(CONNECTIONS);
  const [tests, setTests] = createSignal<Record<string, ConnectionTest>>({});
  const [said, setSaid] = createSignal("Nothing pressed yet");
  const test = async (c: DemoConnection) => {
    setTests((t) => ({ ...t, [c.id]: { busy: true } }));
    const found = await testConnection(c);
    setTests((t) => ({ ...t, [c.id]: found }));
  };
  return (
    <div style={{ width: "100%", "max-width": "640px", "padding-top": "12px" }}>
      <Card title="Connections">
        <For each={rows()}>
          {(c) => (
            <ConnectionRow
              name={c.name}
              mark={typeof c.mark === "string" ? <Glyph name={c.mark} /> : c.mark}
              status={c.status}
              badges={c.badge && <Badge tone="fail">{c.badge}</Badge>}
              test={tests()[c.id]}
              text={CONNECTION_TEXT}
              onTest={c.untested ? undefined : () => void test(c)}
              onEdit={() => setSaid(`Editing ${c.name}`)}
              onRemove={() => {
                setRows((all) => all.filter((r) => r.id !== c.id));
                setSaid(`Removed ${c.name}`);
              }}
            >
              <Show when={c.more}>
                <span>{c.more}</span>
              </Show>
            </ConnectionRow>
          )}
        </For>
        <output>{said()}</output>
      </Card>
    </div>
  );
}
