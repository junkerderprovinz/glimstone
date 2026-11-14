import { createSignal } from "solid-js";
import { Select } from "@glimstone/solid/Select";
import { Glyph } from "../solid/glyph";

export default function SelectMenuRows() {
  const [sort, setSort] = createSignal("name");
  const [app, setApp] = createSignal("text");
  return (
    <div style={{ display: "grid", gap: "16px", width: "260px" }}>
      <Select
        label="Sort by"
        rows="menu"
        triggerAttrs={{ "data-val": sort() }}
        listId="demo-sort-list"
        value={sort()}
        onChange={setSort}
        options={[
          { value: "name", label: "Name", glyph: () => <Glyph name="IconFile" /> },
          { value: "size", label: "Size", glyph: () => <Glyph name="IconHash" /> },
          { value: "kind", label: "Kind", glyph: () => <Glyph name="IconCube" /> },
          { value: "date", label: "Modified", glyph: () => <Glyph name="IconCalendar" /> },
        ]}
      />
      <Select
        label="Open with"
        rows="menu"
        triggerAttrs={{ "data-val": app() }}
        listId="demo-open-with"
        value={app()}
        onChange={setApp}
        groups={[
          {
            heading: "Viewers",
            entries: [
              { value: "text", label: "Text" },
              { value: "image", label: "Image" },
            ],
          },
          {
            entries: [
              {
                label: "Other",
                options: [
                  { value: "hex", label: "Hex" },
                  { value: "raw", label: "Raw" },
                ],
              },
            ],
          },
        ]}
      />
    </div>
  );
}
