// Writes the fortress texts of every language and the glyphs the card uses
// into packages/core/vanilla/fortress-card.js, between its texts markers.
// With --check it only says whether the file is current.
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const file = join(root, "packages/core/vanilla/fortress-card.js");
const { FORTRESS_LANGUAGES, fortressText } = await import(pathToFileURL(join(root, "packages/core/src/fortressTexts.ts")).href);
const glyphs = JSON.parse(readFileSync(join(root, "packages/core/glyphs.json"), "utf8"));

export const KEYS = [
  "fortress", "showOthers", "about", "othersApps", "othersDevices", "othersLine", "connected", "away", "viaRelay", "lastSeen",
  "instanceCount", "forms", "open", "remove", "memberOn", "outHint", "removedHereTitle", "removedHereHint", "enterPhrase",
  "joinTitle", "word", "phraseWhere", "join", "joinRefused", "joinedTitle", "cancel", "close", "leaveTitle", "leaveBody",
  "leaveBack", "leaveConfirm", "removeTitle", "removeBody", "removeBack", "removedTitle", "removedBody", "removedNote",
  "phraseTitle", "leaveRow", "leaveAbout", "changedTitle", "changeElsewhere", "changeNowhere", "phraseMoved", "failed",
  "statusWhere", "statusLoading", "statusQuiet", "statusNeedsYou", "statusWork", "statusNext", "statusLog", "states", "levels",
];
const GLYPHS = ["IconInfo", "IconSignIn", "IconSignOut", "IconTrash", "IconClose", "IconCheck", "IconExternalLink"];

function svg(name) {
  const g = glyphs.find((x) => x.name === name);
  if (!g) throw new Error(`no glyph ${name}`);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${g.viewBox}" width="16" height="16" fill="currentColor">${g.svg.replace(/\s*\n\s*/g, "")}</svg>`;
}

export function block() {
  const texts = {};
  for (const lang of FORTRESS_LANGUAGES) {
    const t = fortressText(lang);
    texts[lang] = Object.fromEntries(KEYS.map((k) => [k, t[k]]));
  }
  const lines = ["  /* texts:begin */"];
  lines.push("  const TEXTS = {");
  for (const lang of FORTRESS_LANGUAGES) lines.push(`    ${JSON.stringify(lang)}: ${JSON.stringify(texts[lang])},`);
  lines.push("  };");
  lines.push("  const GLYPHS = {");
  for (const name of GLYPHS) lines.push(`    ${name}: ${JSON.stringify(svg(name))},`);
  lines.push("  };");
  lines.push("  /* texts:end */");
  return lines.join("\n");
}

export function render(src) {
  const start = src.indexOf("  /* texts:begin */");
  const end = src.indexOf("/* texts:end */");
  if (start < 0 || end < 0) throw new Error("fortress-card.js lost its texts markers");
  return src.slice(0, start) + block() + src.slice(end + "/* texts:end */".length);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const src = readFileSync(file, "utf8");
  const out = render(src);
  if (process.argv.includes("--check")) {
    if (out !== src) {
      console.error("packages/core/vanilla/fortress-card.js is behind its texts; run node scripts/gen-fortress-card.mjs");
      process.exit(1);
    }
  } else {
    writeFileSync(file, out);
  }
}
