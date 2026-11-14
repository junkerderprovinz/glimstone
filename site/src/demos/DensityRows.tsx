import { useState } from "react";
import { applyDensity, DENSITIES, type Density } from "@glimstone/core";
import { ListRow, Pill, Selector } from "@glimstone/react";
import { Glyph } from "../glyph";
import { DENSITY_GLYPHS } from "../glyphData";

const NAMES: Record<Density, string> = { compact: "Compact", normal: "Normal", airy: "Airy" };

export default function DensityRows() {
  const [density, setDensity] = useState<Density>(() => (document.documentElement.getAttribute("data-density") as Density) ?? "normal");
  const choose = (d: Density) => {
    setDensity(d);
    applyDensity(d);
  };
  return (
    <div style={{ display: "grid", gap: 12, width: "100%", maxWidth: 560 }}>
      <Selector label="Density" items={DENSITIES.map((d) => ({ id: d, label: NAMES[d], glyph: <Glyph name={DENSITY_GLYPHS[d]} /> }))} value={density} onChange={choose} variant="well" equalWidth />
      <div style={{ display: "grid", gap: 2 }}>
        <ListRow name="nightly-backup" tile={<Glyph name="IconFolder" />} badges={<Pill className="glim-num">2.4 GB</Pill>} />
        <ListRow name="archive-copy" tile={<Glyph name="IconCloud" />} badges={<Pill className="glim-num">880 MB</Pill>} />
        <ListRow name="photos" tile={<Glyph name="IconFolder" />} badges={<Pill className="glim-num">12 GB</Pill>} />
      </div>
    </div>
  );
}
