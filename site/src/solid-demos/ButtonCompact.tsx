import { Button } from "@glimstone/solid";
import { Glyph } from "../solid/glyph";

export default function ButtonCompact() {
  return (
    <div style={{ display: "flex", "flex-wrap": "wrap", "align-items": "center", gap: "8px" }}>
      <Button
        label="Jobs"
        labelKey={null}
        glyph={<Glyph name="IconQueued" />}
        compact
        after={
          <span data-count class="glim-num">
            12
          </span>
        }
      />
      <Button label="All jobs" labelKey={null} glyph={<Glyph name="IconQueued" />} compact />
      <Button label="Find" labelKey={null} glyph={<Glyph name="IconSearch" />} compactBelow={900} />
      <Button label="Sign in" labelKey={null} glyph={<Glyph name="IconApply" />} tone="accent" size="key" />
    </div>
  );
}
