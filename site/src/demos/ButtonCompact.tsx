import { Button } from "@glimstone/react";
import { Glyph } from "../glyph";

export default function ButtonCompact() {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
      <Button
        label="Jobs"
        labelKey={null}
        glyph={<Glyph name="IconQueued" />}
        compact
        after={
          <span data-count className="glim-num">
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
