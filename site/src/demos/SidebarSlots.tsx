import { useState } from "react";
import { IconButton, Meter, SidebarRow } from "@glimstone/react";
import { Glyph } from "../glyph";

export default function SidebarSlots() {
  const [note, setNote] = useState("Nothing yet");
  const [unpinned, setUnpinned] = useState(0);
  return (
    <div style={{ display: "grid", gap: 4, width: 300 }}>
      <SidebarRow
        label="Media"
        glyph={<Glyph name="IconFolder" />}
        href="#/components/sidebar-row"
        onClick={(e) => {
          e.preventDefault();
          setNote("Opened Media");
        }}
        before={<span data-slot="before">›</span>}
        after={
          <span data-slot="after" style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
            <Meter label="Media is 40% full" value={0.4} quiet size="small" />
            <IconButton tip="Unpin" glyph={<Glyph name="IconPin" />} onClick={() => setUnpinned((n) => n + 1)} />
          </span>
        }
      />
      <SidebarRow label="Trash" glyph={<Glyph name="IconTrash" />} onClick={() => setNote("Opened Trash")} />
      <output>{unpinned ? `Unpinned ${unpinned}` : note}</output>
    </div>
  );
}
