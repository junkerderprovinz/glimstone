import { GlyphTile, Table } from "@glimstone/solid";
import { Glyph } from "../solid/glyph";

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
    <div style={{ display: "grid", gap: "16px", width: "360px" }}>
      <Table
        label="Largest files"
        columns={COLUMNS}
        rows={FILES}
        more="And 3 more"
        cell={(row, column) =>
          column.key === "name" ? (
            <span style={{ display: "inline-flex", "align-items": "center", gap: "6px" }}>
              <GlyphTile glyph={<Glyph name="IconFile" />} quiet />
              {row.name}
            </span>
          ) : undefined
        }
      />
      <Table label="Pairs" columns={[{ key: "from" }, { key: "to", tone: "accent" }]} rows={[{ from: "report-final.txt", to: "report.txt" }]} />
    </div>
  );
}
