/**
 * The glyph engine: every glyph drawn filled, the default, or as a line
 * drawing from glyphs-line.json. The strings go into `data-glyphs` and storage
 * like the other axes, and the stylesheet shows the drawing the root asks for,
 * so a change needs no render.
 */
export type GlyphStyle = 'filled' | 'line';

export const GLYPH_STYLES: GlyphStyle[] = ['filled', 'line'];

export const DEFAULT_GLYPHS: GlyphStyle = 'filled';

/** Sets the attribute the glyph rules key off. */
export function applyGlyphs(style: GlyphStyle | string | undefined): void {
  const s: GlyphStyle = GLYPH_STYLES.includes(style as GlyphStyle) ? (style as GlyphStyle) : DEFAULT_GLYPHS;
  document.documentElement.setAttribute('data-glyphs', s);
}

/** A glyph from glyphs.json, or what goes into its <svg>. */
export interface GlyphDrawing {
  viewBox: string;
  svg: string;
}

const fit = (n: number) => Number(n.toFixed(4));

/**
 * What a glyph's <svg> takes. A glyph with a line drawing carries both on the
 * line set's 24-unit grid, the filled one scaled onto it from its own square
 * viewBox, so each sits where it would alone. A glyph without one, such as a
 * brand mark, is its filled drawing as it is.
 */
export function glyphArt(filled: GlyphDrawing, line: { svg: string } | undefined): GlyphDrawing {
  if (!line) return filled;
  const [x = 0, y = 0, side = 24] = filled.viewBox.split(' ').map(Number);
  const s = 24 / side;
  return {
    viewBox: '0 0 24 24',
    svg:
      `<g class="glim-glyph-filled" transform="matrix(${fit(s)} 0 0 ${fit(s)} ${fit(-x * s)} ${fit(-y * s)})">${filled.svg}</g>` +
      `<g class="glim-glyph-line" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">${line.svg}</g>`,
  };
}
