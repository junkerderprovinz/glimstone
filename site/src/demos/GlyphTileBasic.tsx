import { GlyphTile } from "@glimstone/react";
import { Glyph } from "../glyph";

const folder = <Glyph name="IconFolder" />;

export default function GlyphTileBasic() {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12 }}>
      <span data-tile="plain"><GlyphTile glyph={folder} /></span>
      <span data-tile="quiet"><GlyphTile glyph={folder} quiet /></span>
      <span data-tile="ground"><GlyphTile glyph={folder} ground /></span>
      <span data-tile="active"><GlyphTile glyph={folder} active /></span>
      <button type="button" data-tile="reached" className="demo-dense-row">
        <GlyphTile glyph={folder} />
        Reached
      </button>
    </div>
  );
}
