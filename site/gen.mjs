// Reads the props tables and the colour tokens out of the packages, so the
// site documents what the components accept rather than what somebody wrote down.
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import ts from "typescript";

const core = new URL("../packages/core/", import.meta.url);
const reactSrc = new URL("../packages/react/src/", import.meta.url);
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
  Selector: "react/Selector.tsx",
  NumberField: "react/NumberField.tsx",
  SidebarRow: "react/SidebarRow.tsx",
  EmptyState: "react/EmptyState.tsx",
  SubCard: "react/SubCard.tsx",
  Window: "react/Window.tsx",
  ContextMenu: "react/ContextMenu.tsx",
  MenuBar: "react/MenuBar.tsx",
  Checkbox: "react/Checkbox.tsx",
  Kbd: "react/Kbd.tsx",
  Pill: "react/Pill.tsx",
  PasswordField: "react/PasswordField.tsx",
  CopyField: "react/CopyField.tsx",
  Meter: "react/Meter.tsx",
  ProgressBar: "react/ProgressBar.tsx",
  ColorPicker: "react/ColorPicker.tsx",
  TextField: "react/TextField.tsx",
  TextArea: "react/TextField.tsx",
  FieldRow: "react/FieldRow.tsx",
  PathField: "react/PathField.tsx",
  Tree: "react/Tree.tsx",
  RowMark: "react/RowMark.tsx",
  ListRow: "react/ListRow.tsx",
  IconButton: "react/IconButton.tsx",
  GlyphField: "react/GlyphField.tsx",
  GlyphTile: "react/GlyphTile.tsx",
  Table: "react/Table.tsx",
  SignInCard: "react/SignInCard.tsx",
  Fortress: "react/Fortress.tsx",
  FortressPairing: "react/Fortress.tsx",
  InstanceCard: "react/InstanceCard.tsx",
  BusyRing: "react/BusyRing.tsx",
  SkeletonRow: "react/SkeletonRow.tsx",
  Popover: "react/Popover.tsx",
  Sheet: "react/Sheet.tsx",
  ListTable: "react/ListTable.tsx",
};

const clean = (s) => s.replace(/\s+/g, " ").trim();

function docOf(node) {
  const jsdoc = node.jsDoc?.[0]?.comment;
  if (!jsdoc) return "";
  return clean(typeof jsdoc === "string" ? jsdoc : jsdoc.map((c) => c.text).join(""));
}

// A prop typed with a union from the core, such as ButtonTone, lists its values too.
const coreAliases = new Map();
for (const f of readdirSync(new URL("src/", core)).filter((f) => f.endsWith(".ts"))) {
  const src = ts.createSourceFile(f, readFileSync(new URL(`src/${f}`, core), "utf8"), ts.ScriptTarget.Latest, true);
  src.forEachChild((n) => {
    if (ts.isTypeAliasDeclaration(n)) coreAliases.set(n.name.text, n.type.getText(src));
  });
}

function propsOf(name, file) {
  const path = new URL(file.replace("react/", ""), reactSrc);
  const src = ts.createSourceFile(file, readFileSync(path, "utf8"), ts.ScriptTarget.Latest, true);
  const aliases = new Map(coreAliases);
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
const css = readFileSync(new URL("tokens.css", core), "utf8");
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
writeFileSync(new URL("tailwind-theme.css", out), readFileSync(new URL("tailwind-theme.css", core)));
writeFileSync(new URL("tokens.css", out), css);

// Filled by the test run; the site shows "not tested yet" until then.
const results = new URL("test-results.json", out);
if (!existsSync(results)) writeFileSync(results, JSON.stringify({ ranAt: null, rows: {} }));

console.log(`props for ${Object.keys(props).length} components, ${tokens.length} colour tokens`);
