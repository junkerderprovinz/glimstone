// Reads the props tables and the colour tokens out of the reference files, so the
// site documents what the components accept rather than what somebody wrote down.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import ts from "typescript";

const ref = new URL("../reference/", import.meta.url);
const out = new URL("./src/gen/", import.meta.url);
mkdirSync(out, { recursive: true });

const COMPONENTS = {
  Button: "react/Button.tsx",
  Toggle: "react/Toggle.tsx",
  Badge: "react/Badge.tsx",
  Card: "react/Card.tsx",
  ConfirmDialog: "react/ConfirmDialog.tsx",
  DropdownListbox: "react/DropdownListbox.tsx",
  InfoBubble: "react/InfoBubble.tsx",
  IconTipButton: "react/IconTipButton.tsx",
  ToastViewport: "react/Toast.tsx",
  Select: "react/Select.tsx",
  Combobox: "react/Combobox.tsx",
  Slider: "react/Slider.tsx",
  WindowBar: "react/WindowBar.tsx",
};

const clean = (s) => s.replace(/\s+/g, " ").trim();

function docOf(node) {
  const jsdoc = node.jsDoc?.[0]?.comment;
  if (!jsdoc) return "";
  return clean(typeof jsdoc === "string" ? jsdoc : jsdoc.map((c) => c.text).join(""));
}

function propsOf(name, file) {
  const path = new URL(file, ref);
  const src = ts.createSourceFile(file, readFileSync(path, "utf8"), ts.ScriptTarget.Latest, true);
  const aliases = new Map();
  const interfaces = new Map();
  let fn;
  src.forEachChild((n) => {
    if (ts.isTypeAliasDeclaration(n)) aliases.set(n.name.text, n.type.getText(src));
    if (ts.isInterfaceDeclaration(n)) interfaces.set(n.name.text, n);
    if (ts.isFunctionDeclaration(n) && n.name?.text === name) fn = n;
  });
  const param = fn.parameters[0];
  const defaults = new Map();
  if (ts.isObjectBindingPattern(param.name)) {
    for (const el of param.name.elements) {
      const key = (el.propertyName ?? el.name).getText(src);
      if (el.initializer) defaults.set(key, el.initializer.getText(src));
    }
  }
  let members;
  if (ts.isTypeLiteralNode(param.type)) members = param.type.members;
  else members = interfaces.get(param.type.getText(src).replace(/<.*>$/, "")).members;
  return members.filter(ts.isPropertySignature).map((m) => {
    const key = m.name.getText(src);
    const type = clean(m.type.getText(src));
    return {
      name: key,
      type,
      values: aliases.has(type) ? clean(aliases.get(type)) : undefined,
      required: !m.questionToken,
      default: defaults.get(key),
      doc: docOf(m),
    };
  });
}

const props = Object.fromEntries(Object.entries(COMPONENTS).map(([n, f]) => [n, { file: f, props: propsOf(n, f) }]));
writeFileSync(new URL("props.json", out), JSON.stringify(props, null, 1));

// The colour tokens of the dark block, in file order, each with the comment that
// stands above it.
const css = readFileSync(new URL("tokens.css", ref), "utf8");
const dark = css.slice(css.indexOf('[data-theme="dark"] {'), css.indexOf('[data-theme="light"] {'));
const tokens = [];
let comment = "";
let open = false;
for (const raw of dark.split("\n")) {
  let line = raw.trim();
  if (open || line.startsWith("/*")) {
    if (!open) comment = "";
    open = !line.includes("*/");
    comment = clean(comment + " " + line.replace(/^\/\*/, "").replace(/\*\/.*$/, ""));
    continue;
  }
  const t = line.match(/^(--[a-z0-9-]+):\s*([^;]+);/);
  if (t) {
    // The block also carries the system-light ramp, which repeats every name.
    if (/^--(carbon|accent|status|focus)/.test(t[1]) && !tokens.some((x) => x.name === t[1])) {
      tokens.push({ name: t[1], value: t[2], doc: comment });
    }
    comment = "";
  }
}
writeFileSync(new URL("tokens.json", out), JSON.stringify(tokens, null, 1));

// The theme layer imports "tailwindcss", which only resolves from in here.
writeFileSync(new URL("tailwind-theme.css", out), readFileSync(new URL("tailwind-theme.css", ref)));
writeFileSync(new URL("tokens.css", out), css);

// Filled by the test run; the site shows "not tested yet" until then.
const results = new URL("test-results.json", out);
if (!existsSync(results)) writeFileSync(results, JSON.stringify({ ranAt: null, rows: {} }));

console.log(`props for ${Object.keys(props).length} components, ${tokens.length} colour tokens`);
