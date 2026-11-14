import { useEffect, useState } from "react";
import { Button, Card, EmptyState, IconButton, ListRow, Pill, SkeletonRow, TextField } from "@glimstone/react";
import { Glyph } from "../../glyph";

interface Backup {
  name: string;
  size: string;
  failed?: boolean;
}

const START: Backup[] = [
  { name: "appdata", size: "2.4 GB" },
  { name: "photos", size: "212 GB" },
  { name: "documents", size: "880 MB", failed: true },
];

export default function ListPage() {
  const [backups, setBackups] = useState(START);
  const [filter, setFilter] = useState("");
  const [added, setAdded] = useState(0);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const done = setTimeout(() => setLoading(false), 900);
    return () => clearTimeout(done);
  }, []);
  const shown = backups.filter((b) => b.name.includes(filter.trim().toLowerCase()));
  const add = () => {
    setBackups((list) => [...list, { name: `backup-${added + 1}`, size: "0 B" }]);
    setAdded((n) => n + 1);
    setFilter("");
  };
  return (
    <div style={{ display: "grid", gap: 28, width: "100%", maxWidth: 640 }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
        <TextField label="Filter" placeholder="Filter by name" width="grow" value={filter} onChange={(e) => setFilter(e.target.value)} />
        <Button label="Add a backup" labelKey="add" tone="accent" size="key" onClick={add} />
      </div>
      <Card title="Backups">
        {loading ? (
          <div role="group" aria-label="Backups" aria-busy="true">
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
          </div>
        ) : shown.length > 0 ? (
          <div style={{ display: "grid", gap: 2 }}>
            {shown.map((b) => (
              <ListRow
                key={b.name}
                name={b.name}
                tile={<Glyph name="IconArchive" />}
                badges={
                  <>
                    <Pill className="glim-num">{b.size}</Pill>
                    {b.failed && <Pill tone="fail">Failed</Pill>}
                  </>
                }
                actions={
                  <IconButton
                    tip={`Delete ${b.name}`}
                    glyph={<Glyph name="IconTrash" />}
                    onClick={() => setBackups((list) => list.filter((x) => x !== b))}
                  />
                }
              />
            ))}
          </div>
        ) : backups.length > 0 ? (
          <EmptyState
            nested
            glyph={<Glyph name="IconFilter" />}
            title="No backups match the filter"
            action={<Button label="Clear the filter" labelKey={null} glyph={<Glyph name="IconClose" />} onClick={() => setFilter("")} />}
          />
        ) : (
          <EmptyState
            nested
            glyph={<Glyph name="IconArchive" />}
            title="No backups yet"
            hint="Add one, and the first run starts tonight."
          />
        )}
      </Card>
    </div>
  );
}
