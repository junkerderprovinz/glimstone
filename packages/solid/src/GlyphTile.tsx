import type { JSX } from "solid-js";

// A small holder for a glyph at the start of a row or beside a name. It is a
// picture: the words beside it name the row.

export interface GlyphTileProps {
  glyph: JSX.Element;
  /** Takes the accent off the glyph, such as for a file among folders. */
  quiet?: boolean;
  /** Sets it on the third surface, for a place where a bare glyph gets lost. */
  ground?: boolean;
  /** Fills it with the accent, as a row around it being reached does. */
  active?: boolean;
  class?: string;
}

export function GlyphTile(props: GlyphTileProps) {
  const classes = () =>
    ["glim-tile", props.quiet && "glim-tile--quiet", props.ground && "glim-tile--ground", props.active && "glim-tile--active", props.class].filter(Boolean).join(" ");
  return (
    <span data-glim="GlyphTile" class={classes()} aria-hidden="true">
      {props.glyph}
    </span>
  );
}
