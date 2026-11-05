import { GlyphTile, Table } from "@glimstone/react";
import { Glyph } from "../glyph";

const FILES = [
  { name: "holiday.mkv", size: "2.4 GB" },
  { name: "notes.txt", size: "12 KB" },
];
const COLUMNS = [
  { key: "name", label: "Name" },
  { key: "size", label: "Size", end: true },
] as const;

export default function TableBasic() {
  return (
    <div style={{ display: "grid", gap: 16, width: 360 }}>
      <Table
        label="Largest files"
        columns={COLUMNS}
        rows={FILES}
        more="And 3 more"
        cell={(row, column) =>
          column.key === "name" ? (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <GlyphTile glyph={<Glyph name="IconFile" />} quiet />
              {row.name}
            </span>
          ) : undefined
        }
      />
      <Table
        label="Pairs"
        columns={[{ key: "from" }, { key: "to", tone: "accent" }]}
        rows={[{ from: "report-final.txt", to: "report.txt" }]}
      />
    </div>
  );
}
