import { readFileSync } from "node:fs";
import { join } from "node:path";
import ts from "typescript";

const packages = join(import.meta.dirname, "..", "..", "packages");
const read = (path: string) => readFileSync(path, "utf8");

// A component is an exported name in PascalCase. A context is no component,
// and the glyph components stand together under the one glyph entry.
const isComponent = (name: string) => /^[A-Z]/.test(name) && !name.endsWith("Context");

/** reactComponents maps each exported React component to the file it is written in. */
export function reactComponents() {
  const src = join(packages, "react", "src");
  const components = new Map<string, string>();
  const files = [...read(join(src, "index.ts")).matchAll(/export \* from "\.\/(\w+\.tsx?)"/g)]
    .map((m) => m[1]!)
    .filter((file) => file !== "glyphs.tsx");
  // Select, Combobox and Slider ship as entry points of their own.
  for (const file of [...files, "Select.tsx", "Combobox.tsx", "Slider.tsx"]) {
    for (const m of read(join(src, file)).matchAll(/^export (?:function|const|class) (\w+)/gm)) {
      if (isComponent(m[1]!)) components.set(m[1]!, join(src, file));
    }
  }
  return components;
}

/** vueComponents maps each exported Vue component to its .vue file. */
export function vueComponents() {
  const src = join(packages, "vue", "src");
  const components = new Map<string, string>();
  for (const m of read(join(src, "index.ts")).matchAll(/export \{ default as (\w+) \} from "\.\/(\w+\.vue)"/g)) {
    components.set(m[1]!, join(src, m[2]!));
  }
  for (const file of ["select", "combobox", "slider"]) {
    for (const m of read(join(src, "entries", `${file}.ts`)).matchAll(/default as (\w+) \} from "\.\.\/(\w+\.vue)"/g)) {
      components.set(m[1]!, join(src, m[2]!));
    }
  }
  return components;
}

// Each package's entry points: the index, and the Zag controls that ship as
// entries of their own.
const entries = {
  react: ["index.ts", "Select.tsx", "Combobox.tsx", "Slider.tsx"].map((f) => join(packages, "react", "src", f)),
  vue: ["index.ts", "entries/select.ts", "entries/combobox.ts", "entries/slider.ts"].map((f) => join(packages, "vue", "src", f)),
};

// The checker reads a .vue file as a module with one default export, which is
// all the export list needs to know of it. Vue and Zag stay unread: what they
// export never decides a name or a React prop, and their types are most of
// the reading.
const vueShim = join(packages, "vue", "src", "__vue-shim.d.ts");
const shim = `declare module "*.vue" { const component: unknown; export default component; }
declare module "vue";
declare module "@zag-js/*";`;
const unread = (name: string) => name === "vue" || name.startsWith("@zag-js/");

let compiled: ts.Program | undefined;
/** program compiles both packages from their entry points, once per test run. */
export function program() {
  if (compiled) return compiled;
  const options: ts.CompilerOptions = {
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    jsx: ts.JsxEmit.ReactJSX,
    strict: true,
    noEmit: true,
    skipLibCheck: true,
    allowImportingTsExtensions: true,
    types: [],
    lib: ["lib.es2022.d.ts", "lib.dom.d.ts"],
    paths: { "@glimstone/core": [join(packages, "core", "src", "index.ts")] },
  };
  const host = ts.createCompilerHost(options);
  const getSourceFile = host.getSourceFile;
  host.getSourceFile = (name, ...rest) => (name === vueShim ? ts.createSourceFile(name, shim, ts.ScriptTarget.ES2022) : getSourceFile(name, ...rest));
  const cache = ts.createModuleResolutionCache(host.getCurrentDirectory(), host.getCanonicalFileName, options);
  host.resolveModuleNameLiterals = (literals, containing, redirected, opts) =>
    literals.map((l) => (unread(l.text) ? { resolvedModule: undefined } : ts.resolveModuleName(l.text, containing, opts, host, cache, redirected)));
  compiled = ts.createProgram([...entries.react, ...entries.vue, vueShim], options, host);
  return compiled;
}

/** exportedNames lists what a package exports, its values and its types apart. */
export function exportedNames(pkg: keyof typeof entries) {
  const checker = program().getTypeChecker();
  const values = new Set<string>();
  const types = new Set<string>();
  for (const entry of entries[pkg]) {
    const module = checker.getSymbolAtLocation(program().getSourceFile(entry)!)!;
    for (const symbol of checker.getExportsOfModule(module)) {
      const target = symbol.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(symbol) : symbol;
      (target.flags & ts.SymbolFlags.Value ? values : types).add(symbol.name);
    }
  }
  return { values, types };
}
