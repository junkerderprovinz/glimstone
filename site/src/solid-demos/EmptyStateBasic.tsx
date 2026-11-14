import { Button, EmptyState } from "@glimstone/solid";
import { Glyph } from "../solid/glyph";

export default function EmptyStateBasic() {
  return (
    <div style={{ display: "grid", "grid-template-columns": "repeat(auto-fit, minmax(14rem, 1fr))", gap: "16px", width: "100%" }}>
      <EmptyState
        glyph={<Glyph name="IconArchive" />}
        title="No backups yet"
        hint="Choose what to back up, and the first run starts tonight."
        action={<Button label="Add a backup" labelKey="add" />}
      />
      <EmptyState
        glyph={<Glyph name="IconFilter" />}
        title="No backups match the filter"
        action={<Button label="Clear the filter" labelKey={null} glyph={<Glyph name="IconClose" />} />}
      />
    </div>
  );
}
