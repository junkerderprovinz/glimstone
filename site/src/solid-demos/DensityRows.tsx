import { DENSITIES, type Density } from "@glimstone/core";
import { ListRow, Pill, Selector, useDensity } from "@glimstone/solid";
import { DENSITY_GLYPHS } from "../glyphData";
import { Glyph, glyph } from "../solid/glyph";

const NAMES: Record<Density, string> = { compact: "Compact", normal: "Normal", airy: "Airy" };

export default function DensityRows() {
  const [density, setDensity] = useDensity();
  return (
    <div style={{ display: "grid", gap: "12px", width: "100%", "max-width": "560px" }}>
      <Selector label="Density" items={DENSITIES.map((d) => ({ id: d, label: NAMES[d], glyph: () => glyph(DENSITY_GLYPHS[d]) }))} value={density()} onChange={setDensity} variant="well" equalWidth />
      <div style={{ display: "grid", gap: "2px" }}>
        <ListRow name="nightly-backup" tile={<Glyph name="IconFolder" />} badges={<Pill class="glim-num">2.4 GB</Pill>} />
        <ListRow name="archive-copy" tile={<Glyph name="IconCloud" />} badges={<Pill class="glim-num">880 MB</Pill>} />
        <ListRow name="photos" tile={<Glyph name="IconFolder" />} badges={<Pill class="glim-num">12 GB</Pill>} />
      </div>
    </div>
  );
}
