<script lang="ts" module>
  import type { Snippet } from "svelte";

  export interface GlyphTileProps {
    glyph: Snippet;
    /** Takes the accent off the glyph, such as for a file among folders. */
    quiet?: boolean;
    /** Sets it on the third surface, for a place where a bare glyph gets lost. */
    ground?: boolean;
    /** Fills it with the accent, as a row around it being reached does. */
    active?: boolean;
    class?: string;
  }
</script>

<script lang="ts">
  // A small holder for a glyph at the start of a row or beside a name. It is a
  // picture: the words beside it name the row.
  let { glyph, quiet, ground, active, class: className }: GlyphTileProps = $props();
  const classes = $derived(
    ["glim-tile", quiet && "glim-tile--quiet", ground && "glim-tile--ground", active && "glim-tile--active", className].filter(Boolean).join(" "),
  );
</script>

<span data-glim="GlyphTile" class={classes} aria-hidden="true">{@render glyph()}</span>
