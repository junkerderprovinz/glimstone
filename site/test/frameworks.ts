import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import ts from "typescript";
import { program as reactProgram } from "./exports.ts";

// The Solid and the Svelte package next to React's. Both take React's prop
// names, so a component's surface is its props with their defaults, which of
// them take markup, and nothing to translate but the class attribute and the
// casing of a DOM attribute such as autoFocus.

const packages = join(import.meta.dirname, "..", "..", "packages");
const read = (path: string) => readFileSync(path, "utf8");

export interface Surface {
  /** Each prop with its default as source text, "" for none. */
  props: Map<string, string>;
  /** The props that take markup: a ReactNode, a JSX.Element or a Snippet. */
  markup: Set<string>;
}

const passThrough = new Set(["className", "class", "style", "ref", "key"]);
const isMarkup = (text: string) => /ReactNode|ReactElement|JSX\.Element|Snippet/.test(text);

// Nothing, false and an empty factory all leave a prop at its zero value.
function normal(text: string) {
  const value = text
    .replace(/^\$bindable\(([\s\S]*)\)$/, "$1")
    .replace(/^\(\)\s*=>\s*/, "")
    .replace(/^\(([\s\S]*)\)$/, "$1")
    .replace(/\s+/g, " ")
    .replace(/,\s*([\]}])/g, "$1")
    .replace(/'/g, '"');
  return ["false", "undefined", "null", ""].includes(value) ? "" : value;
}

const ours = (d: ts.Declaration) => resolve(d.getSourceFile().fileName).startsWith(resolve(packages));

function surfaceOf(checker: ts.TypeChecker, type: ts.Type, defaults: Map<string, string>): Surface {
  const surface: Surface = { props: new Map(), markup: new Set() };
  for (const p of type.getProperties()) {
    if (passThrough.has(p.name) || !(p.declarations ?? []).some(ours)) continue;
    surface.props.set(p.name, normal(defaults.get(p.name) ?? ""));
    // The type as written, since Solid's JSX.Element prints as the union it stands for.
    const written = p.declarations?.find(ts.isPropertySignature)?.type?.getText();
    if (isMarkup(written ?? checker.typeToString(checker.getTypeOfSymbol(p)))) surface.markup.add(p.name);
  }
  return surface;
}

function destructured(pattern: ts.ObjectBindingPattern, source: ts.SourceFile, into: Map<string, string>) {
  for (const el of pattern.elements) {
    if (el.initializer) into.set((el.propertyName ?? el.name).getText(source), el.initializer.getText(source));
  }
}

function functionNamed(source: ts.SourceFile, name: string) {
  let fn: ts.FunctionDeclaration | undefined;
  source.forEachChild((n) => {
    if (ts.isFunctionDeclaration(n) && n.name?.text === name) fn = n;
  });
  return fn;
}

/** reactSurface reads a React component's props, with the defaults its parameter destructures. */
export function reactSurface(name: string, file: string): Surface {
  const checker = reactProgram().getTypeChecker();
  const source = reactProgram().getSourceFile(file)!;
  const param = functionNamed(source, name)?.parameters[0];
  const defaults = new Map<string, string>();
  if (!param) return { props: new Map(), markup: new Set() };
  if (ts.isObjectBindingPattern(param.name)) destructured(param.name, source, defaults);
  for (const statement of functionNamed(source, name)!.body?.statements ?? []) {
    if (!ts.isVariableStatement(statement)) continue;
    for (const d of statement.declarationList.declarations) {
      if (ts.isObjectBindingPattern(d.name) && d.initializer?.getText(source) === param.name.getText(source)) destructured(d.name, source, defaults);
    }
  }
  return surfaceOf(checker, checker.getTypeAtLocation(param), defaults);
}

const options: ts.CompilerOptions = {
  target: ts.ScriptTarget.ES2022,
  module: ts.ModuleKind.ESNext,
  moduleResolution: ts.ModuleResolutionKind.Bundler,
  strict: true,
  noEmit: true,
  skipLibCheck: true,
  allowImportingTsExtensions: true,
  types: [],
  lib: ["lib.es2022.d.ts", "lib.dom.d.ts"],
  paths: { "@glimstone/core": [join(packages, "core", "src", "index.ts")] },
};

// Zag's types are most of the reading and never decide a prop.
const unread = (name: string) => name.startsWith("@zag-js/");

function compile(roots: string[], extra: ts.CompilerOptions, virtual: (path: string) => string | undefined, redirect: (text: string, from: string) => string | undefined = () => undefined) {
  const opts = { ...options, ...extra };
  const host = ts.createCompilerHost(opts);
  const getSourceFile = host.getSourceFile;
  host.getSourceFile = (path, ...rest) => {
    const text = virtual(path);
    return text === undefined ? getSourceFile(path, ...rest) : ts.createSourceFile(path, text, ts.ScriptTarget.ES2022, true);
  };
  const fileExists = host.fileExists;
  host.fileExists = (path) => virtual(path) !== undefined || fileExists(path);
  const cache = ts.createModuleResolutionCache(host.getCurrentDirectory(), host.getCanonicalFileName, opts);
  host.resolveModuleNameLiterals = (literals, containing, redirected, o) =>
    literals.map((l) => {
      if (unread(l.text)) return { resolvedModule: undefined };
      const to = redirect(l.text, containing);
      if (to) return { resolvedModule: { resolvedFileName: to, extension: ts.Extension.Ts } };
      return ts.resolveModuleName(l.text, containing, o, host, cache, redirected);
    });
  return ts.createProgram(roots, opts, host);
}

// A component is an exported name in PascalCase.
const isComponent = (name: string) => /^[A-Z]/.test(name) && !name.endsWith("Context") && !name.startsWith("Icon");

const solidSrc = join(packages, "solid", "src");
const solidEntries = ["index.ts", "Select.tsx", "Combobox.tsx", "Slider.tsx"].map((f) => join(solidSrc, f)).filter(existsSync);
let solid: ts.Program | undefined;
const solidProgram = () => (solid ??= compile(solidEntries, { jsx: ts.JsxEmit.Preserve, jsxImportSource: "solid-js" }, () => undefined));

/** solidComponents maps each exported Solid component to the file it is written in. */
export function solidComponents() {
  const checker = solidProgram().getTypeChecker();
  const components = new Map<string, string>();
  for (const entry of solidEntries) {
    for (const symbol of checker.getExportsOfModule(checker.getSymbolAtLocation(solidProgram().getSourceFile(entry)!)!)) {
      const target = symbol.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(symbol) : symbol;
      const file = target.declarations?.[0]?.getSourceFile().fileName;
      if (isComponent(symbol.name) && target.flags & ts.SymbolFlags.Function && file?.endsWith(".tsx")) components.set(symbol.name, file);
    }
  }
  return components;
}

/** solidSurface reads a Solid component's props, with the defaults it merges in front of them. */
export function solidSurface(name: string, file: string): Surface {
  const checker = solidProgram().getTypeChecker();
  const source = solidProgram().getSourceFile(file)!;
  const fn = functionNamed(source, name);
  const param = fn?.parameters[0];
  if (!fn || !param) return { props: new Map(), markup: new Set() };
  const defaults = new Map<string, string>();
  const visit = (n: ts.Node) => {
    if (ts.isCallExpression(n) && n.expression.getText(source) === "mergeProps") {
      for (const arg of n.arguments) {
        if (!ts.isObjectLiteralExpression(arg) && !(ts.isAsExpression(arg) && ts.isObjectLiteralExpression(arg.expression))) continue;
        const object = ts.isAsExpression(arg) ? (arg.expression as ts.ObjectLiteralExpression) : arg;
        for (const p of object.properties) if (ts.isPropertyAssignment(p)) defaults.set(p.name.getText(source), p.initializer.getText(source));
      }
    }
    n.forEachChild(visit);
  };
  visit(fn);
  return surfaceOf(checker, checker.getTypeAtLocation(param), defaults);
}

// A .svelte file reads as the TypeScript of its module script, where its props
// interface stands, with the component as the default export.
const svelteSrc = join(packages, "svelte", "src");
const scriptOf = (text: string, module: boolean) =>
  [...text.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)].find((m) => /\bmodule\b/.test(m[1]!) === module)?.[2] ?? "";
const asModule = (path: string) => (path.endsWith(".svelte.ts") && existsSync(path.slice(0, -3)) ? path.slice(0, -3) : undefined);
function svelteVirtual(path: string) {
  const file = asModule(path);
  return file ? `${scriptOf(read(file), true)}\ndeclare const component: unknown;\nexport default component;\n` : undefined;
}
const svelteEntries = [join(svelteSrc, "index.ts"), ...["select", "combobox", "slider"].map((f) => join(svelteSrc, "entries", `${f}.ts`))].filter(existsSync);
let svelte: ts.Program | undefined;
const svelteProgram = () =>
  (svelte ??= compile(svelteEntries, {}, svelteVirtual, (text, from) => (text.endsWith(".svelte") ? `${resolve(dirname(from), text)}.ts` : undefined)));

/** svelteComponents maps each exported Svelte component to its .svelte file. */
export function svelteComponents() {
  const components = new Map<string, string>();
  for (const entry of svelteEntries) {
    for (const m of read(entry).matchAll(/default as (\w+)(?:, [^}]*)? \} from "(\.{1,2}\/\w+\.svelte)"/g)) {
      if (isComponent(m[1]!)) components.set(m[1]!, resolve(dirname(entry), m[2]!));
    }
  }
  return components;
}

/** svelteSurface reads a Svelte component's props interface, with the defaults its $props() destructures. */
export function svelteSurface(name: string, file: string): Surface {
  const checker = svelteProgram().getTypeChecker();
  const module = svelteProgram().getSourceFile(`${file}.ts`)!;
  let props: ts.InterfaceDeclaration | undefined;
  module.forEachChild((n) => {
    if (ts.isInterfaceDeclaration(n) && n.name.text === `${name}Props`) props = n;
  });
  const instance = ts.createSourceFile("instance.ts", scriptOf(read(file), false), ts.ScriptTarget.ES2022, true);
  const defaults = new Map<string, string>();
  const visit = (n: ts.Node) => {
    if (ts.isVariableDeclaration(n) && ts.isObjectBindingPattern(n.name) && n.initializer?.getText(instance) === "$props()") destructured(n.name, instance, defaults);
    n.forEachChild(visit);
  };
  visit(instance);
  if (!props) return { props: new Map(), markup: new Set() };
  return surfaceOf(checker, checker.getTypeAtLocation(props.name), defaults);
}

/** drift lists every way a twin's surface differs from React's, empty when they match. */
export function drift(react: Surface, twin: Surface, framework: string): string[] {
  const out: string[] = [];
  // An attribute React writes in camel case, such as autoFocus, the others write in lower case.
  const find = (map: Map<string, string>, key: string) => (map.has(key) ? key : [...map.keys()].find((k) => k.toLowerCase() === key.toLowerCase()));
  for (const [key, value] of react.props) {
    const twinKey = find(twin.props, key);
    if (twinKey === undefined) out.push(`prop ${key} is missing in ${framework}`);
    else if (twin.props.get(twinKey) !== value) out.push(`${key} defaults to ${value || "nothing"} in React and ${twin.props.get(twinKey) || "nothing"} in ${framework}`);
    else if (react.markup.has(key) !== twin.markup.has(twinKey)) out.push(`${key} takes markup in ${react.markup.has(key) ? "React" : framework} only`);
  }
  for (const key of twin.props.keys()) if (find(react.props, key) === undefined) out.push(`prop ${key} is missing in React`);
  return out;
}

/** exportedNames lists what the Solid or the Svelte package exports, its values and its types apart. */
export function exportedNames(pkg: "solid" | "svelte") {
  const p = pkg === "solid" ? solidProgram() : svelteProgram();
  const entries = pkg === "solid" ? solidEntries : svelteEntries;
  const checker = p.getTypeChecker();
  const values = new Set<string>();
  const types = new Set<string>();
  for (const entry of entries) {
    for (const symbol of checker.getExportsOfModule(checker.getSymbolAtLocation(p.getSourceFile(entry)!)!)) {
      const target = symbol.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(symbol) : symbol;
      (target.flags & ts.SymbolFlags.Value ? values : types).add(symbol.name);
    }
  }
  return { values, types };
}
