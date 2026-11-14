import { createSignal } from "solid-js";
import { FieldRow, GlyphField, IconButton } from "@glimstone/solid";
import { Glyph } from "../solid/glyph";

export default function GlyphFieldBasic() {
  const [query, setQuery] = createSignal("");
  const [cleared, setCleared] = createSignal(0);
  const clear = () => {
    setQuery("");
    setCleared((n) => n + 1);
  };
  return (
    <div style={{ display: "grid", gap: "8px", width: "360px" }}>
      <GlyphField
        label="Filter"
        glyph={<Glyph name="IconSearch" />}
        placeholder="Filter this folder"
        class="demo-filter"
        data-hook="filter"
        value={query()}
        onInput={(e) => setQuery(e.currentTarget.value)}
        after={<IconButton tip="Clear" glyph={<Glyph name="IconClose" />} onClick={clear} />}
      />
      <FieldRow label="From the row">
        <GlyphField glyph={<Glyph name="IconFolder" />} mono width="medium" value="/mnt/user" />
      </FieldRow>
      <output>Cleared {cleared()}</output>
    </div>
  );
}
