/**
 * Generates the GlimStone mark and banners.
 *
 * GlimStone has no pre-existing logo, so this script also derives the two
 * logo masters (not just the banner) — everything downstream is procedural
 * geometry, computed here, never hand-authored path data:
 *
 *   glimstone-dunkel.svg   dark rock, gold gem   (reads on a LIGHT background)
 *   glimstone-hell.svg     pale rock, gold gem   (reads on a DARK background)
 *   glimstone-banner.svg/.png       light banner: logo + "GlimStone" + claim
 *   glimstone-banner-dark.svg/.png  dark banner:  logo + "GlimStone" + claim
 *
 * The mark: a faceted gem (the "glimme" — shining brightness) set into a
 * fractured rock silhouette (the "stone") — the name's own etymology, drawn
 * literally. The gold gem is the constant core in both theme variants, same
 * as every other logo pair in this house style; only the rock's tone swaps
 * so it keeps reading against its background.
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

const CX = 500, CY = 520; // slight optical drop: the gem should look "set into" the rock, not floating above centre

/** Point on a circle of radius r around (CX,CY), angle in degrees, 0 = due right, clockwise. */
function pt(angleDeg, r) {
  const a = (angleDeg * Math.PI) / 180;
  return [CX + r * Math.cos(a), CY + r * Math.sin(a)];
}
function poly(points) {
  return points.map((p) => p.join(",")).join(" ");
}

// Rock silhouette: an irregular, angular ring of points — a fixed jitter
// pattern (not Math.random(), so re-running this script is reproducible).
// Radius alternates in a fixed sequence to read as fractured, not a smooth
// blob or a regular polygon.
const ROCK_ANGLES = [ -100, -55, -18, 22, 60, 100, 140, 180, 220, 262 ];
const ROCK_RADII =  [  330,  380, 300, 400,  320, 370, 300, 390, 310, 360 ];
const rockOuter = ROCK_ANGLES.map((a, i) => pt(a, ROCK_RADII[i]));

// Three crack facets across the rock: thin polygons from a shared inner
// point out to two rock-outline vertices, picked non-adjacently so the
// cracks read as crossing the stone rather than outlining one corner of it.
const crackPairs = [
  [0, 4], [2, 7], [5, 9],
];
function crackPath(iA, iB, widthPx) {
  const a = rockOuter[iA], b = rockOuter[iB];
  const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
  const dx = b[0] - a[0], dy = b[1] - a[1];
  const len = Math.hypot(dx, dy);
  const nx = (-dy / len) * widthPx, ny = (dx / len) * widthPx;
  return `M ${a[0]},${a[1]} L ${mx + nx},${my + ny} L ${b[0]},${b[1]} L ${mx - nx},${my - ny} Z`;
}

// The gem: an eight-point faceted jewel, slightly taller than wide (a cut
// stone, not a regular octagon), with three internal facet lines meeting at
// an off-centre highlight point for a dimensional, cut-glass read.
const GEM_R = 175;
const gemAngles = [ -90, -45, 0, 45, 100, 135, 180, 225 ];
const gemRadii =  [ 170, 165, 175, 160, 180, 160, 175, 165 ];
const gemOuter = gemAngles.map((a, i) => pt(a, gemRadii[i] * (GEM_R / 170)));
const highlight = pt(-70, 40); // off-centre, toward the "light" corner

function gemFacetPath(i, j) {
  return `M ${highlight[0]},${highlight[1]} L ${gemOuter[i][0]},${gemOuter[i][1]} L ${gemOuter[j][0]},${gemOuter[j][1]} Z`;
}

const GOLD = "#FCC419", GOLD_MID = "#d4af37", GOLD_DEEP = "#a97c0a";

function buildMark(rockFill, rockShade) {
  const facets = [];
  for (let i = 0; i < gemOuter.length; i++) {
    const j = (i + 1) % gemOuter.length;
    const tone = i % 3 === 0 ? GOLD : i % 3 === 1 ? GOLD_MID : GOLD_DEEP;
    facets.push(`<path d="${gemFacetPath(i, j)}" fill="${tone}" opacity="0.92"/>`);
  }
  return `
  <polygon points="${poly(rockOuter)}" fill="${rockFill}"/>
  ${crackPairs.map(([a, b]) => `<path d="${crackPath(a, b, 5)}" fill="${rockShade}" opacity="0.5"/>`).join("\n  ")}
  <polygon points="${poly(gemOuter)}" fill="${GOLD}"/>
  ${facets.join("\n  ")}
  <polygon points="${poly(gemOuter)}" fill="none" stroke="${GOLD_DEEP}" stroke-width="3" stroke-opacity="0.35"/>`;
}

function writeMark(file, rockFill, rockShade) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000">${buildMark(rockFill, rockShade)}
</svg>
`;
  writeFileSync(join(__dir, file), svg);
  console.log(`wrote ${file}`);
}

// Dark stone (Carbon's own darkest surface step) — reads on a light banner.
writeMark("glimstone-dunkel.svg", "#262626", "#161616");
// Pale stone — reads on a dark banner. Kept a genuine light grey, not white,
// so it still reads as stone rather than paper.
writeMark("glimstone-hell.svg", "#d1d1d1", "#8d8d8d");

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
