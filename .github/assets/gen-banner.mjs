/**
 * Generates the GlimStone mark and banners.
 *
 * The mark comes unchanged from glimstone-mark-source.svg, a brick wall drawn
 * in Illustrator in the pale stone shades with one gold brick. The pale mark is
 * the master as drawn; the dark mark swaps each pale shade for its partner in
 * the dark palette, so both keep the same arrangement.
 *
 *   glimstone-mark-source.svg       the master, untouched
 *   glimstone-dunkel.svg            dark stones, for a light background
 *   glimstone-hell.svg              pale stones, for a dark background
 *   glimstone-banner.svg/.png       light banner: logo, "GlimStone" and claim
 *   glimstone-banner-dark.svg/.png  dark banner
 *
 * Text is converted to paths with opentype.js so the SVG needs no font: Bree
 * Serif for the name, Lato for the claim.
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

// More yellow than the accent gold, so the lit brick reads as lit rather than
// merely differently coloured.
const GOLD = "#FFD53D";

function parseViewBox(svg) {
  const [, vb] = svg.match(/viewBox="([^"]+)"/);
  const [minX, minY, w, h] = vb.split(/\s+/).map(Number);
  return { minX, minY, w, h };
}

// Illustrator writes the fills as classes in a <style> block.
function parseClassFills(svg) {
  const fills = {};
  const re = /\.([\w-]+)\s*\{\s*fill:\s*(#[0-9a-fA-F]{6})/g;
  let m;
  while ((m = re.exec(svg))) fills[m[1]] = m[2].toUpperCase();
  return fills;
}

function parseRects(svg) {
  const classFills = parseClassFills(svg);
  const rects = [];
  const re = /<rect\b([^>]*)\/>/g;
  let m;
  while ((m = re.exec(svg))) {
    const attrs = {};
    const attrRe = /([\w-]+)="([^"]*)"/g;
    let am;
    while ((am = attrRe.exec(m[1]))) attrs[am[1]] = am[2];
    rects.push({
      x: Number(attrs.x),
      y: Number(attrs.y),
      width: Number(attrs.width),
      height: Number(attrs.height),
      rx: attrs.rx ?? "0",
      ry: attrs.ry ?? attrs.rx ?? "0",
      fill: attrs.fill ?? classFills[attrs.class],
    });
  }
  return rects;
}

// Light greys rather than white, so the pale mark still reads as stone.
const PALE = ["#B8B8B8", "#C9C9C9", "#DADADA", "#E6E2DA", "#CFC9C0"];
const DARK = ["#1A1A1A", "#242424", "#2F2E2B", "#3A3A3A", "#252220"];

const source = readFileSync(join(__dir, "glimstone-mark-source.svg"), "utf8");
const markBox = parseViewBox(source);
const markRects = parseRects(source);

function writeMark(file, palette) {
  const { minX, minY, w, h } = markBox;
  const bricks = markRects
    .map((r) => {
      const i = PALE.indexOf(r.fill);
      if (r.fill !== GOLD && i < 0) throw new Error(`unexpected brick fill ${r.fill} in the master`);
      const fill = r.fill === GOLD ? GOLD : palette[i];
      return `<rect x="${r.x}" y="${r.y}" width="${r.width}" height="${r.height}" rx="${r.rx}" ry="${r.ry}" fill="${fill}"/>`;
    })
    .join("\n  ");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${minX} ${minY} ${w} ${h}">
  ${bricks}
</svg>
`;
  writeFileSync(join(__dir, file), svg);
  console.log(`wrote ${file}`);
}

writeMark("glimstone-dunkel.svg", DARK);
writeMark("glimstone-hell.svg", PALE);
writeFileSync(join(__dir, "logo.svg"), readFileSync(join(__dir, "glimstone-dunkel.svg")));
console.log("wrote logo.svg");

const NAME = "GlimStone";
const CLAIM = "Set in stone, lit where it counts.";
const W = 1600, H = 500;
// The master's viewBox is tight around the bricks, so LH is the visible height.
const LH = 240, LW = Math.round((LH * markBox.w) / markBox.h);
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
