import { useState } from "react";
import { Select } from "@glimstone/react/Select";
import { Glyph } from "../glyph";

export default function SelectMenuRows() {
  const [sort, setSort] = useState("name");
  const [app, setApp] = useState("text");
  return (
    <div style={{ display: "grid", gap: 16, width: 260 }}>
      <Select
        label="Sort by"
        rows="menu"
        triggerAttrs={{ "data-val": sort }}
        value={sort}
        onChange={setSort}
        options={[
          { value: "name", label: "Name", glyph: <Glyph name="IconFile" /> },
          { value: "size", label: "Size", glyph: <Glyph name="IconHash" /> },
          { value: "kind", label: "Kind", glyph: <Glyph name="IconCube" /> },
          { value: "date", label: "Modified", glyph: <Glyph name="IconCalendar" /> },
        ]}
      />
      <Select
        label="Open with"
        rows="menu"
        triggerAttrs={{ "data-val": app }}
        value={app}
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
