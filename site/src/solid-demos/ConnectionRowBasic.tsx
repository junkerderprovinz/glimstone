import { createSignal, For, Show } from "solid-js";
import { Badge, Card, ConnectionRow, type ConnectionTest } from "@glimstone/solid";
import { CONNECTION_TEXT, CONNECTIONS, mountAction, testConnection, toggleMount, type DemoConnection, type DemoMount } from "../connectionData";
import { Glyph } from "../solid/glyph";

export default function ConnectionRowBasic() {
  const [rows, setRows] = createSignal(CONNECTIONS);
  const [tests, setTests] = createSignal<Record<string, ConnectionTest>>({});
  const [mounts, setMounts] = createSignal<Record<string, DemoMount>>({});
  const [said, setSaid] = createSignal("Nothing pressed yet");
  const test = async (c: DemoConnection) => {
    setTests((t) => ({ ...t, [c.id]: { busy: true } }));
    const found = await testConnection(c);
    setTests((t) => ({ ...t, [c.id]: found }));
  };
  const mount = async (c: DemoConnection) => {
    const mounted = mounts()[c.id]?.mounted ?? false;
    setMounts((m) => ({ ...m, [c.id]: { mounted, busy: true } }));
    const now = await toggleMount(mounted);
    setMounts((m) => ({ ...m, [c.id]: { mounted: now } }));
  };
  const actions = (c: DemoConnection) => {
    if (!c.mountable) return undefined;
    const a = mountAction(mounts()[c.id]);
    return [{ ...a, glyph: <Glyph name={a.glyph} />, onClick: () => void mount(c) }];
  };
  return (
    <div style={{ width: "100%", "max-width": "1280px", "padding-top": "12px" }}>
      <Card title="Connections">
        <For each={rows()}>
          {(c) => (
            <ConnectionRow
              name={c.name}
              mark={typeof c.mark === "string" ? <Glyph name={c.mark} /> : c.mark}
              status={c.status}
              badges={c.badge && <Badge tone={c.tone ?? "fail"}>{c.badge}</Badge>}
              test={tests()[c.id]}
              actions={actions(c)}
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
