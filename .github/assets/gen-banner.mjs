/**
 * Generates the GlimStone mark and banners.
 *
 * The mark's geometry (glimstone-mark-source.svg) is the user's own real
 * design — a running-bond brick wall, drawn in Illustrator — taken 1:1,
 * byte-for-byte, never hand-rebuilt (house rule: never-hand-rebuild-svg).
 * This script only recolours it: every brick gets the stone tone, except
 * the one whose own centre sits closest to the viewBox's centre, which gets
 * the lit-gold treatment plus a soft radial glow behind it — the doc's own
 * opening line, "a small light in dark masonry," drawn literally. Finding
 * "the centre brick" geometrically (not a hardcoded index) means a future
 * redraw with a different brick count/layout still lands on the right one.
 *
 * An earlier placeholder version of this script (before a real logo
 * existed) synthesised its own 3x3 grid of stone blocks procedurally — see
 * git history if that's ever worth comparing against.
 *
 *   glimstone-mark-source.svg   the user's own master, untouched
 *   glimstone-dunkel.svg        dark stones, gold lit brick   (reads on a LIGHT background)
 *   glimstone-hell.svg          pale stones, gold lit brick   (reads on a DARK background)
 *   glimstone-banner.svg/.png       light banner: logo + "GlimStone" + claim
 *   glimstone-banner-dark.svg/.png  dark banner:  logo + "GlimStone" + claim
 *
 * The gold brick (plus its glow) is the constant core in both theme
 * variants, same as every other logo pair in this house style; only the
 * stone tone swaps so it keeps reading against its background.
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
// The mark — real user geometry (glimstone-mark-source.svg), recoloured only.
// ============================================================================

// Flat, no gradient (jdp: "der goldene soll keinen Verlauf haben und etwas
// gelblicher sein") — a punchier, more yellow-leaning gold than the Carbon
// accent gold used elsewhere, so the lit brick reads as distinctly "lit"
// rather than merely "differently coloured."
const GOLD = "#FFD53D";

function parseViewBox(svg) {
  const [, vb] = svg.match(/viewBox="([^"]+)"/);
  const [minX, minY, w, h] = vb.split(/\s+/).map(Number);
  return { minX, minY, w, h };
}

// The source has no id/class scheme worth relying on (some rects carry
// class="st0", the corner half-bricks carry none at all and fall back to
// SVG's default black fill) — every rect's geometry is read generically off
// its own attributes instead, so this survives a future re-export cleanly.
function parseRects(svg) {
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
    });
  }
  return rects;
}

function buildMark(stonePalette) {
  const source = readFileSync(join(__dir, "glimstone-mark-source.svg"), "utf8");
  const { minX, minY, w, h } = parseViewBox(source);
  const rects = parseRects(source);
  const boxCx = minX + w / 2, boxCy = minY + h / 2;

  // "The lit brick" is whichever one's own centre sits closest to the
  // viewBox's centre — computed, not assumed, so it's correct for this wall
  // (the middle brick of the middle row) without hand-picking an index.
  let lit = rects[0], bestDist = Infinity;
  for (const r of rects) {
    const rcx = r.x + r.width / 2, rcy = r.y + r.height / 2;
    const d = (rcx - boxCx) ** 2 + (rcy - boxCy) ** 2;
    if (d < bestDist) {
      bestDist = d;
      lit = r;
    }
  }
  const glowCx = lit.x + lit.width / 2, glowCy = lit.y + lit.height / 2;
  const glowR = Math.max(w, h) * 0.33;

  // Each brick a slightly different stone shade (jdp: "die ziegel in
  // unterschiedlichen grautönen einfärben") — real masonry never reads as
  // one flat colour. Deterministic (position-driven, not Math.random()) so
  // re-running this script reproduces byte-identical output every time.
  // Reading order (top-to-bottom, left-to-right) + a step coprime with the
  // palette length walks every shade before repeating any — plain "index +
  // position" collapsed almost the whole wall onto one shade last time,
  // since this source's coordinates increase in near-lockstep with the
  // iteration index.
  const others = rects.filter((r) => r !== lit).sort((a, b) => a.y - b.y || a.x - b.x);
  const step = stonePalette.length % 2 === 0 ? 1 : 2; // stays coprime with the length
  const bricks = others
    .map((r, i) => {
      const shade = stonePalette[(i * step) % stonePalette.length];
      return `<rect x="${r.x}" y="${r.y}" width="${r.width}" height="${r.height}" rx="${r.rx}" ry="${r.ry}" fill="${shade}"/>`;
    })
    .join("\n  ");

  const body = `
  <defs>
    <radialGradient id="glow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${GOLD}" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="${GOLD}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <circle cx="${glowCx}" cy="${glowCy}" r="${glowR}" fill="url(#glow)"/>
  ${bricks}
  <rect x="${lit.x}" y="${lit.y}" width="${lit.width}" height="${lit.height}" rx="${lit.rx}" ry="${lit.ry}" fill="${GOLD}"/>`;

  return { viewBox: `${minX} ${minY} ${w} ${h}`, body };
}

function writeMark(file, stonePalette) {
  const { viewBox, body } = buildMark(stonePalette);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}">${body}
</svg>
`;
  writeFileSync(join(__dir, file), svg);
  console.log(`wrote ${file}`);
}

// Dark stone (Carbon's own darkest surface step), ± a few nearby shades —
// reads on a light banner. Wider spread than the first pass (jdp: "die
// Schattierungen dürfen leicht kräftiger sein").
writeMark("glimstone-dunkel.svg", ["#1a1a1a", "#242424", "#2f2e2b", "#3a3a3a", "#252220"]);
// Pale stone, ± a few nearby shades — reads on a dark banner. Kept genuine
// light greys, not white, so it still reads as stone rather than paper.
writeMark("glimstone-hell.svg", ["#b8b8b8", "#c9c9c9", "#dadada", "#e6e2da", "#cfc9c0"]);
// Mirrors every other repo's convention (dunkel = the general-purpose icon).
writeFileSync(join(__dir, "logo.svg"), readFileSync(join(__dir, "glimstone-dunkel.svg")));
console.log("wrote logo.svg");

// ============================================================================
// The banner — same harness as every other repo's gen-banner.mjs.
// ============================================================================

const NAME = "GlimStone";
const CLAIM = "A small light in dark masonry.";
const W = 1600, H = 500;
const LH = 450, LW = 450; // jdp: "die brickwall etwas größer machen" (was 400)
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

// Render text as ONE <g> PER GLYPH, each glyph's own path always computed at
// x=0 and positioned only via its group's transform. A single getPath(text,
// x, y, size) call over the whole string is NOT reliable: opentype.js's
// hinting goes numerically unstable (silently emits NaN mid-glyph, for
// specific glyphs) once the x it's fed grows past a few hundred units.
// Root-caused later (see the bootstrapping repo's gen-banner.mjs for the
// full bisection): an earlier "local origin for the whole string" version of
// this fix only delayed the problem to longer strings — it happened to work
// for the exact NAME/CLAIM text at the time, not because the bug was fixed.
// Requesting every glyph at x=0 sidesteps the instability regardless of
// string length or content.
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
