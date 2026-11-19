import { useState } from "react";
import { Badge, Card, ConnectionRow, type ConnectionTest } from "@glimstone/react";
import { CONNECTION_TEXT, CONNECTIONS, testConnection, type DemoConnection } from "../connectionData";
import { Glyph } from "../glyph";

export default function ConnectionRowBasic() {
  const [rows, setRows] = useState(CONNECTIONS);
  const [tests, setTests] = useState<Record<string, ConnectionTest>>({});
  const [said, setSaid] = useState("Nothing pressed yet");
  const test = async (c: DemoConnection) => {
    setTests((t) => ({ ...t, [c.id]: { busy: true } }));
    const found = await testConnection(c);
    setTests((t) => ({ ...t, [c.id]: found }));
  };
  return (
    <div style={{ width: "100%", maxWidth: 1280, paddingTop: 12 }}>
      <Card title="Connections">
        {rows.map((c) => (
          <ConnectionRow
            key={c.id}
            name={c.name}
            mark={typeof c.mark === "string" ? <Glyph name={c.mark} /> : c.mark}
            status={c.status}
            badges={c.badge && <Badge tone="fail">{c.badge}</Badge>}
            test={tests[c.id]}
            text={CONNECTION_TEXT}
            onTest={c.untested ? undefined : () => void test(c)}
            onEdit={() => setSaid(`Editing ${c.name}`)}
            onRemove={() => {
              setRows((all) => all.filter((r) => r.id !== c.id));
              setSaid(`Removed ${c.name}`);
            }}
          >
            {c.more && <span>{c.more}</span>}
          </ConnectionRow>
        ))}
        <output>{said}</output>
      </Card>
    </div>
  );
}
