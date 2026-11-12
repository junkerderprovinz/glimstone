import { useState } from "react";
import { ListTable, Pill, type ListColumn } from "@glimstone/react";

const ROWS = [
  { name: "nextcloud", kind: "Container", size: 20.4, state: "Settled" },
  { name: "immich", kind: "Container", size: 312, state: "Running" },
  { name: "vaultwarden", kind: "Container", size: 0.8, state: "Settled" },
  { name: "Windows 11", kind: "VM", size: 64, state: "Failed" },
  { name: "adguard", kind: "Container", size: 1.2, state: "Settled" },
];
type Row = (typeof ROWS)[number];

const COLUMNS: ListColumn[] = [
  { key: "name", label: "Name" },
  { key: "kind", label: "Kind", filter: true, tone: "muted" },
  { key: "size", label: "Size", end: true },
  { key: "state", label: "State", filter: true },
];
const TONE = { Settled: "ok", Running: "state", Failed: "fail" } as const;

export default function ListTableBackups() {
  const [picked, setPicked] = useState(0);
  const [opened, setOpened] = useState("");
  return (
    <div style={{ display: "grid", gap: 8, width: "100%", maxWidth: 640 }}>
      <ListTable<Row>
        label="Backups"
        columns={COLUMNS}
        rows={ROWS}
        rowKey={(r) => r.name}
        text={{ search: "Search backups", hint: "Click a heading to sort, ▾ to filter, type to search", noMatch: "No backup matches", filterOf: (c) => `Filter ${c}` }}
        cell={(row, c) =>
          c.key === "size" ? `${row.size} GB` : c.key === "state" ? <Pill tone={TONE[row.state as keyof typeof TONE]}>{row.state}</Pill> : undefined
        }
        onSelect={(rows) => setPicked(rows.length)}
        onOpen={(row) => setOpened(row.name)}
      />
      <output>
        {picked} picked{opened && `, opened ${opened}`}
      </output>
    </div>
  );
}
