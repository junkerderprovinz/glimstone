/**
 * Generates the GlimStone mark and banners.
 *
 * GlimStone has no pre-existing logo, so this script also derives the two
 * logo masters (not just the banner) — everything downstream is procedural
 * geometry, computed here, never hand-authored path data:
 *
 *   glimstone-dunkel.svg   dark stones, gold lit block   (reads on a LIGHT background)
 *   glimstone-hell.svg     pale stones, gold lit block   (reads on a DARK background)
 *   glimstone-banner.svg/.png       light banner: logo + "GlimStone" + claim
 *   glimstone-banner-dark.svg/.png  dark banner:  logo + "GlimStone" + claim
 *
 * The mark: a 3x3 grid of stone blocks with one block lit gold — the doc's
 * own opening line, "a small light in dark masonry," drawn literally. The
 * gold block (plus its glow) is the constant core in both theme variants,
 * same as every other logo pair in this house style; only the stone tone
 * swaps so it keeps reading against its background.
 *
 * Two other concepts (a faceted gem in fractured rock; a notched seal with a
 * sunburst) were drafted and rendered for comparison, then dropped once this
 * one was picked — see git history (.github/assets/gen-logo-alts.mjs) if
 * either is ever worth revisiting.
 *
 * Text is converted to SVG paths (opentype.js) so the SVG needs no font and
 * renders identically anywhere. Bree Serif (name) + Lato (claim) — the same
 * pairing used across this author's other Bree-Serif-branded repos.
 *
 * Deps (global): opentype.js, @resvg/resvg-js. Fonts are fetched to the OS
 * temp dir. Run: node .github/assets/gen-banner.mjs
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
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

// ============================================================================
// The mark — computed geometry, no hand-authored path data.
// ============================================================================

const GOLD = "#FCC419", GOLD_MID = "#d4af37", GOLD_DEEP = "#a97c0a";

// A 3x3 grid of stone blocks, one lit. Grid is centred in the 1000x1000
// viewBox; cell size and gap are fixed so re-running this script reproduces
// the same layout exactly.
function buildMark(stoneFill) {
  const cell = 260, gapPx = 20, rx = 24;
  const gridW = cell * 3 + gapPx * 2;
  const start = (1000 - gridW) / 2; // 90
  const cells = [];
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      cells.push({ x: start + c * (cell + gapPx), y: start + r * (cell + gapPx), lit: r === 1 && c === 1 });
    }
  }
  const litCell = cells.find((k) => k.lit);
  const glowCx = litCell.x + cell / 2, glowCy = litCell.y + cell / 2;

  const stones = cells
    .filter((k) => !k.lit)
    .map((k) => `<rect x="${k.x}" y="${k.y}" width="${cell}" height="${cell}" rx="${rx}" fill="${stoneFill}"/>`)
    .join("\n  ");

  return `
  <defs>
    <radialGradient id="glow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${GOLD}" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="${GOLD}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <circle cx="${glowCx}" cy="${glowCy}" r="330" fill="url(#glow)"/>
  ${stones}
  <rect x="${litCell.x}" y="${litCell.y}" width="${cell}" height="${cell}" rx="${rx}" fill="${GOLD}"/>
  <rect x="${litCell.x + 40}" y="${litCell.y + 40}" width="${cell - 80}" height="${cell - 80}" rx="${rx - 12}" fill="${GOLD_MID}" opacity="0.55"/>`;
}

function writeMark(file, stoneFill) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000">${buildMark(stoneFill)}
</svg>
`;
  writeFileSync(join(__dir, file), svg);
  console.log(`wrote ${file}`);
}

// Dark stone (Carbon's own darkest surface step) — reads on a light banner.
writeMark("glimstone-dunkel.svg", "#262626");
// Pale stone — reads on a dark banner. Kept a genuine light grey, not white,
// so it still reads as stone rather than paper.
writeMark("glimstone-hell.svg", "#d1d1d1");

// ============================================================================
// The banner — same harness as every other repo's gen-banner.mjs.
// ============================================================================

const NAME = "GlimStone";
const CLAIM = "A small light in dark masonry.";
const W = 1600, H = 500;
const LH = 400, LW = 400;
const nameSize = 132, claimSize = 44, gap = 70, lineGap = 8;

const THEMES = [
  { suffix: "", bg: "#ffffff", name: "#1f2328", claim: "#5a5d5e", logo: "glimstone-dunkel.svg" },
  { suffix: "-dark", bg: "#0d1117", name: "#e6edf3", claim: "#9aa4ad", logo: "glimstone-hell.svg" },
];

const fontPath = join(tmpdir(), "GlimStone-BreeSerif-Regular.ttf");
if (!existsSync(fontPath)) {
  const res = await fetch("https://github.com/google/fonts/raw/main/ofl/breeserif/BreeSerif-Regular.ttf");
  if (!res.ok) throw new Error(`font fetch ${res.status}`);
  writeFileSync(fontPath, Buffer.from(await res.arrayBuffer()));
}
const font = opentype.parse(readFileSync(fontPath));

const claimFontPath = join(tmpdir(), "GlimStone-Lato-Regular.ttf");
if (!existsSync(claimFontPath)) {
  const r = await fetch("https://github.com/google/fonts/raw/main/ofl/lato/Lato-Regular.ttf");
  if (!r.ok) throw new Error(`claim font fetch ${r.status}`);
  writeFileSync(claimFontPath, Buffer.from(await r.arrayBuffer()));
}
const claimFont = opentype.parse(readFileSync(claimFontPath));

const nameW = font.getAdvanceWidth(NAME, nameSize);
const claimW = claimFont.getAdvanceWidth(CLAIM, claimSize);
const startX = 165;
const LX = startX, LY = (H - LH) / 2;
const textX = startX + LW + gap;

const sc = (s) => s / font.unitsPerEm;
const nameAsc = font.ascender * sc(nameSize);
const nameDesc = -font.descender * sc(nameSize);
const claimAsc = claimFont.ascender * (claimSize / claimFont.unitsPerEm);
const blockH = nameAsc + nameDesc + lineGap + claimAsc;
const nameBaseline = H / 2 - blockH / 2 + nameAsc;
const claimBaseline = nameBaseline + nameDesc + lineGap + claimAsc;

// Generated at LOCAL origin (0,0) and positioned via <g transform>, not baked
// into getPath's own x/y: opentype.js's toPathData() silently corrupts long
// multi-glyph paths once the baked-in offset gets large enough (confirmed by
// bisection — reproduces with either operand large, fix confirmed by moving
// the offset to an SVG transform instead). Keep coordinates small at the
// source; let the SVG do the positioning.
const namePath = font.getPath(NAME, 0, 0, nameSize).toPathData(2);
const claimPath = claimFont.getPath(CLAIM, 0, 0, claimSize).toPathData(2);

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
  const full = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="${t.bg}"/>
  ${embedLogo(t.logo, LX, LY, LW, LH)}
  <g transform="translate(${textX},${nameBaseline})"><path d="${namePath}" fill="${t.name}"/></g>
  <g transform="translate(${textX},${claimBaseline})"><path d="${claimPath}" fill="${t.claim}"/></g>
</svg>
`;
  emit(`glimstone-banner${t.suffix}`, full, t.bg);
}
