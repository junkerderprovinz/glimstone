import { useState } from "react";
import { FieldRow, GlyphField, IconButton } from "@glimstone/react";
import { Glyph } from "../glyph";

export default function GlyphFieldBasic() {
  const [query, setQuery] = useState("");
  const [cleared, setCleared] = useState(0);
  const clear = () => {
    setQuery("");
    setCleared((n) => n + 1);
  };
  return (
    <div style={{ display: "grid", gap: 8, width: 360 }}>
      <GlyphField
        label="Filter"
        glyph={<Glyph name="IconSearch" />}
        placeholder="Filter this folder"
        className="demo-filter"
        data-hook="filter"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        after={<IconButton tip="Clear" glyph={<Glyph name="IconClose" />} onClick={clear} />}
      />
      <FieldRow label="From the row">
        <GlyphField glyph={<Glyph name="IconFolder" />} mono width="medium" defaultValue="/mnt/user" />
      </FieldRow>
      <output>Cleared {cleared}</output>
    </div>
  );
}
