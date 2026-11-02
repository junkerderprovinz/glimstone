import { Button, EmptyState } from "@glimstone/react";
import { Glyph } from "../glyph";

export default function EmptyStateBasic() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(14rem, 1fr))", gap: 16, width: "100%" }}>
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
