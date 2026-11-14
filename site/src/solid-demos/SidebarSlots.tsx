import { createSignal, For } from "solid-js";
import { IconButton, Meter, SidebarRow } from "@glimstone/solid";
import { Glyph } from "../solid/glyph";

export default function SidebarSlots() {
  const [note, setNote] = createSignal("Nothing yet");
  const [unpinned, setUnpinned] = createSignal(0);
  return (
    <div style={{ display: "grid", gap: "4px", width: "300px" }}>
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
          <span data-slot="after" style={{ display: "inline-flex", "align-items": "center", gap: "4px" }}>
            <Meter label="Media is 40% full" value={0.4} quiet size="small" />
            <IconButton tip="Unpin" glyph={<Glyph name="IconPin" />} onClick={() => setUnpinned((n) => n + 1)} />
          </span>
        }
      />
      <For each={["mnt", "user", "Big Buck Bunny and the other films"]}>
        {(name, depth) => (
          <SidebarRow
            data-depth={depth()}
            label={name}
            glyph={<Glyph name="IconFolder" />}
            depth={depth()}
            onClick={() => setNote(`Opened ${name}`)}
            before={<span data-toggle>›</span>}
          />
        )}
      </For>
      <SidebarRow label="Trash" glyph={<Glyph name="IconTrash" />} onClick={() => setNote("Opened Trash")} />
      <output>{unpinned() ? `Unpinned ${unpinned()}` : note()}</output>
    </div>
  );
}
