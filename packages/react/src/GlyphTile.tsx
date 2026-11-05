import type { ReactNode } from "react";

// A small holder for a glyph at the start of a row or beside a name. It is a
// picture: the words beside it name the row.

export interface GlyphTileProps {
  glyph: ReactNode;
  /** Takes the accent off the glyph, such as for a file among folders. */
  quiet?: boolean;
  /** Sets it on the third surface, for a place where a bare glyph gets lost. */
  ground?: boolean;
  /** Fills it with the accent, as a row around it being reached does. */
  active?: boolean;
  className?: string;
}

export function GlyphTile({ glyph, quiet, ground, active, className }: GlyphTileProps) {
  const classes = ["glim-tile", quiet && "glim-tile--quiet", ground && "glim-tile--ground", active && "glim-tile--active", className].filter(Boolean).join(" ");
  return (
    <span className={classes} aria-hidden="true">
      {glyph}
    </span>
  );
}
