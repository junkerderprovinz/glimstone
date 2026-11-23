/**
 * Generates the GlimStone banners.
 *
 * The mark is an eight-pointed star of steel around a gold stone, drawn in
 * Illustrator with its own lit and shaded halves, so one drawing reads on a
 * light and a dark ground alike.
 *
 *   glimstone-mark-source.svg       the master, untouched
 *   glimstone-app-source.svg        the master on the app tile, untouched
 *   logo.svg                        the master with its seams closed, which
 *                                   everything else draws from
 *   glimstone-banner.svg/.png       light banner: logo, "GlimStone" and claim
 *   glimstone-banner-dark.svg/.png  dark banner
 *
 * Text is converted to paths with opentype.js so the SVG needs no font: Bree
 * Serif Light for the name, Bree Light for the claim. Both are licensed and
 * never committed, so HOUSE_FONTS (default %LOCALAPPDATA%\halleluja-fonts)
 * must hold them as TTF.
 *
 * Deps (global): opentype.js, @resvg/resvg-js.
 * Run: node .github/assets/gen-banner.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";
import { createRequire } from "node:module";
import { execSync } from "node:child_process";

const require = createRequire(import.meta.url);
const groot = execSync("npm root -g").toString().trim();
const opentype = require(`${groot}/opentype.js`);
const { Resvg } = require(`${groot}/@resvg/resvg-js`);

const __dir = dirname(fileURLToPath(import.meta.url));

function parseViewBox(svg) {
  const [, vb] = svg.match(/viewBox="([^"]+)"/);
  const [minX, minY, w, h] = vb.split(/\s+/).map(Number);
  return { minX, minY, w, h };
}

const markBox = parseViewBox(readFileSync(join(__dir, "logo.svg"), "utf8"));

const NAME = "GlimStone";
const CLAIM = "Set in stone, lit where it counts.";
const W = 1600, H = 500;
const LH = 386, LW = Math.round((LH * markBox.w) / markBox.h);
const nameSize = 132, claimSize = 44, gap = 70, lineGap = 8;

const THEMES = [
  { suffix: "", bg: "#ffffff", name: "#1f2328", claim: "#5a5d5e", logo: "logo.svg" },
  { suffix: "-dark", bg: "#0d1117", name: "#e6edf3", claim: "#9aa4ad", logo: "logo.svg" },
];

const fonts = process.env.HOUSE_FONTS ?? join(process.env.LOCALAPPDATA ?? tmpdir(), "halleluja-fonts");
const font = opentype.parse(readFileSync(join(fonts, "bree-serif-light.ttf")).buffer);
const claimFont = opentype.parse(readFileSync(join(fonts, "bree-light.ttf")).buffer);

const nameW = font.getAdvanceWidth(NAME, nameSize);
const claimW = claimFont.getAdvanceWidth(CLAIM, claimSize);
const startX = Math.round((W - (LW + gap + Math.max(nameW, claimW))) / 2);
const LX = startX, LY = (H - LH) / 2;
const textX = startX + LW + gap;

const sc = (s) => s / font.unitsPerEm;
const nameAsc = font.ascender * sc(nameSize);
const nameDesc = -font.descender * sc(nameSize);
const claimAsc = claimFont.ascender * (claimSize / claimFont.unitsPerEm);
// The claim's descender counts toward the block height, or a claim with a y or
// g sits lower than the logo's centre.
const claimDesc = -claimFont.descender * (claimSize / claimFont.unitsPerEm);
const blockH = nameAsc + nameDesc + lineGap + claimAsc + claimDesc;
const nameBaseline = H / 2 - blockH / 2 + nameAsc;
const claimBaseline = nameBaseline + nameDesc + lineGap + claimAsc;

// One <g> per glyph, each path computed at x=0 and placed by its transform:
// opentype.js emits NaN for some glyphs once the x it is given grows past a few
// hundred units.
function textGroups(fnt, text, fontSize, x0, y0) {
  const scale = fontSize / fnt.unitsPerEm;
  let cx = x0;
  const parts = [];
  for (let i = 0; i < text.length; i++) {
    const glyph = fnt.charToGlyph(text[i]);
    const d = glyph.getPath(0, 0, fontSize).toPathData(2);
    parts.push(`<g transform="translate(${cx.toFixed(2)},${y0.toFixed(2)})"><path d="${d}"/></g>`);
    cx += glyph.advanceWidth * scale;
    if (i < text.length - 1) {
      cx += fnt.getKerningValue(glyph, fnt.charToGlyph(text[i + 1])) * scale;
    }
  }
  return parts.join("");
}

function embedLogo(logoFile, x, y, w, h) {
  const raw = readFileSync(join(__dir, logoFile), "utf8").replace(/<\?xml[^>]*\?>\s*/, "");
  const vb = (raw.match(/viewBox="([^"]+)"/) || [, "0 0 1000 1000"])[1];
  return raw.replace(
    /<svg\b[^>]*>/,
    `<svg x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w}" height="${h}" viewBox="${vb}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">`,
  );
}

function emit(name, svg, bg) {
  writeFileSync(join(__dir, `${name}.svg`), svg);
  const png = new Resvg(svg, { background: bg, fitTo: { mode: "width", value: W } }).render().asPng();
  writeFileSync(join(__dir, `${name}.png`), png);
  console.log(`wrote ${name}.svg + .png`);
}

for (const t of THEMES) {
  const nameGlyphs = textGroups(font, NAME, nameSize, textX, nameBaseline);
  const claimGlyphs = textGroups(claimFont, CLAIM, claimSize, textX, claimBaseline);
  const full = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="${t.bg}"/>
  ${embedLogo(t.logo, LX, LY, LW, LH)}
  <g fill="${t.name}">${nameGlyphs}</g>
  <g fill="${t.claim}">${claimGlyphs}</g>
</svg>
`;
  emit(`glimstone-banner${t.suffix}`, full, t.bg);
}
