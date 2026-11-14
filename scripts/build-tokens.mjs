// Builds every file the tokens reach from their one source, the DTCG files in
// packages/core/tokens: the token blocks of tokens.css, the @theme block of
// tailwind-theme.css, the Flutter package's tokens.g.dart and the Figma
// variables. --check writes nothing and fails when a file is out of date.
//
// A source file is one group of tokens and one CSS block. Its extensions name
// the selector, and the modes that write the same tokens again under another
// selector or media query: a shape, a density, OLED, the contrast step. A
// mode's `also` lists further selectors that ask for the same values, each a
// block of its own right after the mode's. In a group marked theme, a token's
// $value is the light ramp's and its dark value sits beside it, written out as
// one light-dark().
//
// Run from the repository root: node scripts/build-tokens.mjs [--check]
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import StyleDictionary from "style-dictionary";
import { srgbOf } from "../packages/core/src/oklab.ts";

const repo = new URL("../", import.meta.url);
const source = new URL("packages/core/tokens/", repo);
const X = "org.glimstone";

// The groups in the order their blocks stand in tokens.css, by marked region.
// An entry such as @contrast is where the groups' shared mode of that name
// stands, as one block.
const REGIONS = {
  main: ["shape", "layout", "space", "density", "elevation", "focus", "colour", "chart", "@contrast", "hover", "font"],
  motion: ["direction", "motion"],
  drag: ["drag"],
  buttons: ["button"],
  window: ["window"],
  waiting: ["motion-layered", "glow"],
};
const ORDER = Object.values(REGIONS).flat().filter((id) => !id.startsWith("@"));

const files = readdirSync(source).filter((f) => f.endsWith(".tokens.json"));
const unplaced = files.map((f) => f.replace(".tokens.json", "")).filter((id) => !ORDER.includes(id));
if (unplaced.length) throw new Error(`no region for ${unplaced.join(", ")}; add it to REGIONS`);

const groups = Object.fromEntries(ORDER.map((id) => [id, JSON.parse(readFileSync(new URL(`${id}.tokens.json`, source), "utf8"))[id]]));
const meta = (id) => groups[id].$extensions?.[X] ?? {};
const ext = (t) => t.$extensions?.[X] ?? {};
const tokensOf = (id) => Object.entries(groups[id]).filter(([k]) => !k.startsWith("$"));

// A reference is {group.name}; in CSS it is the token's custom property.
const css = (v) =>
  String(v).replace(/\{([^.}]+)\.([^}]+)\}/g, (_, group, name) => {
    if (!groups[group]?.[name]) throw new Error(`{${group}.${name}} names no token`);
    return `var(--${name})`;
  });
const lightDark = (light, dark) => (dark === undefined ? css(light) : `light-dark(${css(light)}, ${css(dark)})`);
const sidesOf = (t) => ({ light: t.$value, dark: ext(t).dark ?? t.$value });

/** What a token says under a mode: a light and a dark side in a theme group, else one value. */
function modeValue(theme, t, v) {
  if (theme && v !== null && typeof v === "object") {
    const base = sidesOf(t);
    return lightDark(v.light ?? base.light, v.dark ?? base.dark);
  }
  return css(v);
}

/** A block comment wrapped to fit in `width` columns, paragraphs kept apart. */
function comment(text, width) {
  const lines = [];
  text.split("\n\n").forEach((para, i) => {
    if (i) lines.push("");
    let line = "";
    for (const word of para.split(" ")) {
      if (line && line.length + 1 + word.length > width - 3) {
        lines.push(line);
        line = word;
      } else line = line ? `${line} ${word}` : word;
    }
    lines.push(line);
  });
  return lines.map((l, i) => (i === 0 ? `/* ${l}` : l ? `   ${l}` : "")).join("\n") + " */";
}

const indent = (text, by) => text.split("\n").map((l) => (l ? by + l : l)).join("\n");

/** A rule, inside its media query and its cascade layer where it has them. */
function rule(selector, body, media, layer) {
  let out = `${selector} {\n${indent(body, "  ")}\n}`;
  if (media) out = `@media ${media} {\n${indent(out, "  ")}\n}`;
  if (layer) out = `@layer ${layer} {\n${indent(out, "  ")}\n}`;
  return out;
}

function declarations(entries, width) {
  return entries
    .map(({ name, value, note, trailing }, i) => {
      const line = trailing ? `--${name}: ${value}; /* ${trailing} */` : `--${name}: ${value};`;
      return note ? `${i ? "\n" : ""}${comment(note, width)}\n${line}` : line;
    })
    .join("\n");
}

function groupCss(id) {
  const m = meta(id);
  const parts = [];
  const base = tokensOf(id)
    .filter(([, t]) => ext(t).base !== false)
    .map(([name, t]) => ({
      name,
      value: m.theme ? lightDark(t.$value, ext(t).dark) : css(t.$value),
      note: t.$description,
      trailing: ext(t).note,
    }));
  const head = groups[id].$description ? `${comment(groups[id].$description, 80)}\n` : "";
  parts.push(head + rule(m.selector, declarations(base, 78), m.media, m.layer));
  for (const mode of (m.modes ?? []).filter((mode) => !mode.shared)) parts.push(modeCss(mode, modeEntries(id, mode.name)));
  return parts.join("\n\n");
}

/** A mode's block, then one block for each selector in its `also`. */
function modeCss(mode, entries) {
  return [mode, ...(mode.also ?? [])]
    .map((at) => {
      const note = at.$description ? `${comment(at.$description, 80)}\n` : "";
      return note + rule(at.selector, declarations(entries, 76), at.media, at.layer);
    })
    .join("\n\n");
}

const modeEntries = (id, name) =>
  tokensOf(id)
    .filter(([, t]) => ext(t).modes && name in ext(t).modes)
    .map(([token, t]) => ({ name: token, value: modeValue(meta(id).theme, t, ext(t).modes[name]), note: ext(t).modeNotes?.[name] }));

/** One block for a mode several groups share, such as the contrast step. */
function sharedCss(name) {
  const users = ORDER.flatMap((id) => (meta(id).modes ?? []).filter((mode) => mode.shared && mode.name === name).map((mode) => ({ id, mode })));
  const { mode } = users.find((u) => u.mode.$description) ?? users[0];
  const differ = users.find((u) => u.mode.selector !== mode.selector || u.mode.media !== mode.media);
  if (differ) throw new Error(`the shared mode ${name} has another selector in ${differ.id}`);
  return modeCss(mode, users.flatMap((u) => modeEntries(u.id, name)));
}

// The @theme block: every token with a Tailwind name, in source order.
function tailwindTheme() {
  const lines = [];
  let last;
  for (const id of ORDER) {
    for (const [name, t] of tokensOf(id)) {
      const tw = ext(t).tailwind;
      if (!tw) continue;
      const note = ext(t).tailwindNote;
      if ((last && last !== id) || note) lines.push("");
      if (note) lines.push(comment(note, 78));
      lines.push(`--${tw}: var(--${name});`);
      last = id;
    }
  }
  return `@theme {\n${indent(lines.join("\n").replace(/^\n/, ""), "  ")}\n}`;
}

const h = (n) => Number(n).toString(16).padStart(2, "0").toUpperCase();

/** An oklch(), rgb() or hex colour as sRGB channels from 0 to 255, or null for anything else. */
function rgbaOf(value) {
  const hex = value.match(/^#([0-9a-f]{6})([0-9a-f]{2})?$/i);
  if (hex) return [...[0, 2, 4].map((i) => parseInt(hex[1].slice(i, i + 2), 16)), hex[2] ? parseInt(hex[2], 16) / 255 : 1];
  const lch = value.match(/^oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*(?:\/\s*([\d.]+))?\s*\)$/);
  if (lch) {
    const [l, c, deg] = lch.slice(1, 4).map(Number);
    const rad = (deg * Math.PI) / 180;
    const srgb = srgbOf([l, c * Math.cos(rad), c * Math.sin(rad)]);
    return [...[1, 3, 5].map((i) => parseInt(srgb.slice(i, i + 2), 16)), Number(lch[4] ?? 1)];
  }
  const rgba = value.match(/^rgba?\(\s*(\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\s*\)$/);
  if (rgba) return [Number(rgba[1]), Number(rgba[2]), Number(rgba[3]), Number(rgba[4] ?? 1)];
  if (value === "transparent") return [0, 0, 0, 0];
  return null;
}

// Dart needs a concrete colour, so an oklch() token is resolved to sRGB here,
// clipped per channel as the browser paints it.
function dartColor(value) {
  if (value === "transparent") return null;
  const c = rgbaOf(value);
  return c && `Color(0x${h(Math.round(c[3] * 255))}${h(c[0])}${h(c[1])}${h(c[2])})`;
}

const camel = (name) => name.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase());
const px = (value) => {
  if (value === "0") return 0;
  const m = String(value).match(/^([\d.]+)(rem|px)$/);
  return m ? (m[2] === "rem" ? Number(m[1]) * 16 : Number(m[1])) : null;
};

function dartTokens() {
  // Every group declared wherever a theme is set; its derived tokens carry no
  // literal colour and drop out below.
  const themed = ORDER.filter((id) => meta(id).selector === ":root,\n[data-theme]");
  const light = {};
  const dark = {};
  for (const id of themed) {
    for (const [name, t] of tokensOf(id)) {
      if (ext(t).base === false) continue;
      light[name] = css(t.$value);
      dark[name] = css(ext(t).dark ?? t.$value);
    }
  }
  const oled = { ...dark };
  for (const id of themed) {
    for (const [name, t] of tokensOf(id)) {
      const v = ext(t).modes?.oled;
      if (v !== undefined) oled[name] = css(typeof v === "object" ? (v.dark ?? sidesOf(t).dark) : v);
    }
  }
  const colours = Object.keys(dark).filter((k) => dartColor(dark[k]) && light[k] && dartColor(light[k]));
  const inkLightness = (theme) => Number(theme === light ? light["ink-l-light"] : light["ink-l-dark"]);

  const metrics = [...tokensOf("layout"), ...tokensOf("button")]
    .filter(([k, t]) => /^(text|btn)-/.test(k) && px(t.$value) !== null)
    .map(([k, t]) => `  static const double ${camel(k)} = ${px(t.$value)};`);

  // The shape engine's three offered shapes; leaf stays hidden, as on the web.
  const radius = Object.fromEntries(tokensOf("shape"));
  const shapeOf = (mode) => Object.fromEntries(Object.entries(radius).map(([k, t]) => [k, mode ? ext(t).modes[mode] : t.$value]));
  const shapes = { round: shapeOf("round"), soft: shapeOf(null), square: shapeOf("square") };
  const shapeEnum = Object.entries(shapes)
    .map(([name, b]) => `  ${name}(card: ${px(b["radius-card"])}, control: ${px(b["radius-control"])}, pill: ${px(b["radius-pill"])})`)
    .join(",\n");
  const defaultShape = readFileSync(new URL("packages/core/src/appearance.ts", repo), "utf8").match(/DEFAULT_SHAPE: Shape = '(\w+)'/)[1];

  const fields = colours.map(camel);
  const palette = (theme) => colours.map((k) => `    ${camel(k)}: ${dartColor(theme[k])},`).join("\n");

  return `// Generated by scripts/build-tokens.mjs from packages/core/tokens. Edit the
// source and run the script; a change here is overwritten.

import 'package:flutter/material.dart';

/// The colours of one theme, as a [ThemeExtension] an app adds to its
/// [ThemeData] and reads with \`Theme.of(context).extension<GlimTheme>()\`.
@immutable
class GlimTheme extends ThemeExtension<GlimTheme> {
  const GlimTheme({
${fields.map((f) => `    required this.${f},`).join("\n")}
    required this.inkLightness,
    this.shape = GlimShape.${defaultShape},
  });

${fields.map((f) => `  final Color ${f};`).join("\n")}

  /// The OKLab lightness the accent's ink moves to, as in tokens.css: at most
  /// this on a light ramp, at least this on a dark one.
  final double inkLightness;

  /// The shape the user chose; it sets the radii of cards, controls and pills.
  final GlimShape shape;

  static const dark = GlimTheme(
${palette(dark)}
    inkLightness: ${inkLightness(dark)},
  );

  /// The dark ramp on true black, for OLED and AMOLED screens.
  static const oled = GlimTheme(
${palette(oled)}
    inkLightness: ${inkLightness(oled)},
  );

  static const light = GlimTheme(
${palette(light)}
    inkLightness: ${inkLightness(light)},
  );

  @override
  GlimTheme copyWith({
${fields.map((f) => `    Color? ${f},`).join("\n")}
    double? inkLightness,
    GlimShape? shape,
  }) =>
      GlimTheme(
${fields.map((f) => `        ${f}: ${f} ?? this.${f},`).join("\n")}
        inkLightness: inkLightness ?? this.inkLightness,
        shape: shape ?? this.shape,
      );

  @override
  GlimTheme lerp(GlimTheme? other, double t) {
    if (other == null) return this;
    return GlimTheme(
${fields.map((f) => `      ${f}: Color.lerp(${f}, other.${f}, t)!,`).join("\n")}
      inkLightness: inkLightness + (other.inkLightness - inkLightness) * t,
      shape: t < 0.5 ? shape : other.shape,
    );
  }
}

/// The shape engine: how round cards, controls and pills are, in logical pixels.
enum GlimShape {
${shapeEnum};

  const GlimShape({required this.card, required this.control, required this.pill});

  final double card;
  final double control;
  final double pill;
}

/// The lengths of tokens.css in logical pixels, one rem being 16.
abstract final class GlimMetrics {
${metrics.join("\n")}
}
`;
}

// The Figma variables as the body of Figma's POST /v1/files/:key/variables:
// the colours in a light, a dark and an OLED mode, the shapes, the densities
// and the lengths in pixels. A colour the browser works out from the user's
// accent, such as the ink and the hover steps, has no fixed value and stays
// out; a token that names another becomes an alias to it.
function figmaVariables(resolved) {
  const collections = [];
  const modes = [];
  const variables = [];
  const values = [];
  const ids = new Map();
  const ref = (v) => (typeof v === "string" ? v.match(/^\{([^.}]+)\.([^}]+)\}$/) : null);
  const length = (v) => {
    const s = String(v).replace(/\{([^.}]+)\.([^}]+)\}/g, (_, g, n) => resolved.get(`${g}.${n}`));
    const sum = s.match(/^calc\(([\d.]+rem) \+ ([\d.]+rem)\)$/);
    return sum ? px(sum[1]) + px(sum[2]) : px(s) ?? (/^[\d.]+$/.test(s) ? Number(s) : null);
  };
  const colour = (v) => {
    const c = typeof v === "string" && rgbaOf(v);
    return c ? { r: c[0] / 255, g: c[1] / 255, b: c[2] / 255, a: c[3] } : null;
  };

  function collection(name, modeNames, entries, type) {
    const cid = `collection:${name}`;
    collections.push({ action: "CREATE", id: cid, name, initialModeId: `mode:${name}:${modeNames[0]}` });
    modeNames.forEach((m, i) => modes.push({ action: i ? "CREATE" : "UPDATE", id: `mode:${name}:${m}`, name: m, variableCollectionId: cid }));
    for (const { path, perMode, description } of entries) {
      const parsed = perMode.map((v) => {
        const r = ref(v);
        if (r && ids.has(`${r[1]}.${r[2]}`)) return { type: "VARIABLE_ALIAS", id: ids.get(`${r[1]}.${r[2]}`) };
        return type === "COLOR" ? colour(v) : length(v);
      });
      if (parsed.some((p) => p === null || p === undefined || Number.isNaN(p))) continue;
      const vid = `variable:${path}`;
      ids.set(path, vid);
      variables.push({ action: "CREATE", id: vid, name: path.replace(".", "/"), variableCollectionId: cid, resolvedType: type, ...(description ? { description } : {}) });
      parsed.forEach((value, i) => values.push({ variableId: vid, modeId: `mode:${name}:${modeNames[i]}`, value }));
    }
  }

  const sizes = [];
  for (const id of ["space", "layout", "button", "focus"]) {
    for (const [name, t] of tokensOf(id)) sizes.push({ path: `${id}.${name}`, perMode: [t.$value] });
  }
  collection("Size", ["Value"], sizes, "FLOAT");

  const shape = tokensOf("shape").map(([name, t]) => ({ path: `shape.${name}`, perMode: [t.$value, ext(t).modes.round, ext(t).modes.square] }));
  collection("Shape", ["Soft", "Round", "Square"], shape, "FLOAT");

  const density = tokensOf("density").map(([name, t]) => ({ path: `density.${name}`, perMode: [t.$value, ext(t).modes.compact, ext(t).modes.airy] }));
  collection("Density", ["Normal", "Compact", "Airy"], density, "FLOAT");

  const colours = [];
  for (const id of ORDER.filter((g) => meta(g).theme)) {
    for (const [name, t] of tokensOf(id)) {
      if (ext(t).base === false) continue;
      const { light, dark } = sidesOf(t);
      const oled = ext(t).modes?.oled;
      const oledDark = oled === undefined ? dark : typeof oled === "object" ? (oled.dark ?? dark) : oled;
      colours.push({ path: `${id}.${name}`, perMode: [light, dark, oledDark], description: t.$description?.split("\n\n")[0] });
    }
  }
  collection("Colour", ["Light", "Dark", "OLED"], colours, "COLOR");

  return JSON.stringify({ variableCollections: collections, variableModes: modes, variables, variableModeValues: values }, null, 1) + "\n";
}

/** `text` with the part between a region's markers replaced by `body`. */
function splice(text, name, body, file) {
  const begin = text.match(new RegExp(`/\\* tokens:${name} begin[^*]*\\*/\\n`));
  const end = text.indexOf(`/* tokens:${name} end */`);
  if (!begin || end < 0) throw new Error(`${file} has no tokens:${name} markers`);
  return text.slice(0, begin.index + begin[0].length) + body + "\n" + text.slice(end);
}

StyleDictionary.registerFormat({
  name: "glimstone/css",
  format: ({ options }) => options.groups.map((id) => (id.startsWith("@") ? sharedCss(id.slice(1)) : groupCss(id))).join("\n\n"),
});
StyleDictionary.registerFormat({ name: "glimstone/tailwind", format: () => tailwindTheme() });
StyleDictionary.registerFormat({ name: "glimstone/dart", format: () => dartTokens() });
StyleDictionary.registerFormat({
  name: "glimstone/figma",
  format: ({ dictionary }) => {
    const count = ORDER.reduce((n, id) => n + tokensOf(id).length, 0);
    if (dictionary.allTokens.length !== count) throw new Error(`Style Dictionary read ${dictionary.allTokens.length} tokens where the source holds ${count}`);
    return figmaVariables(new Map(dictionary.allTokens.map((t) => [t.path.join("."), t.$value])));
  },
});

const sd = new StyleDictionary({
  // Style Dictionary globs, and a glob takes forward slashes on Windows too.
  source: [`${fileURLToPath(source).replaceAll("\\", "/")}*.tokens.json`],
  usesDtcg: true,
  log: { verbosity: "silent", warnings: "disabled" },
  platforms: {
    glimstone: {
      files: [
        ...Object.entries(REGIONS).map(([name, list]) => ({ destination: `region:${name}`, format: "glimstone/css", options: { groups: list } })),
        { destination: "tailwind", format: "glimstone/tailwind" },
        { destination: "dart", format: "glimstone/dart" },
        { destination: "figma", format: "glimstone/figma" },
      ],
    },
  },
});
const built = Object.fromEntries((await sd.formatPlatform("glimstone")).map((f) => [f.destination, f.output]));

const tokensCss = new URL("packages/core/tokens.css", repo);
const tailwindCss = new URL("packages/core/tailwind-theme.css", repo);
let stylesheet = readFileSync(tokensCss, "utf8");
for (const name of Object.keys(REGIONS)) stylesheet = splice(stylesheet, name, built[`region:${name}`], "tokens.css");
const outputs = [
  [tokensCss, stylesheet],
  [tailwindCss, splice(readFileSync(tailwindCss, "utf8"), "theme", built.tailwind, "tailwind-theme.css")],
  [new URL("packages/flutter/lib/src/tokens.g.dart", repo), built.dart],
  [new URL("packages/core/figma-variables.json", repo), built.figma],
];

const read = (url) => {
  try {
    return readFileSync(url, "utf8");
  } catch {
    return "";
  }
};
const stale = outputs.filter(([url, text]) => read(url) !== text).map(([url]) => fileURLToPath(url).slice(fileURLToPath(repo).length));
if (process.argv.includes("--check")) {
  if (stale.length) {
    console.error(`out of date with packages/core/tokens: ${stale.join(", ")}; run node scripts/build-tokens.mjs`);
    process.exit(1);
  }
  console.log("every generated token file matches its source");
} else {
  for (const [url, text] of outputs) writeFileSync(url, text);
  console.log(stale.length ? `wrote ${stale.join(", ")}` : "nothing to write");
}
