import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { compileScript, parse } from "vue/compiler-sfc";

const src = join(import.meta.dirname, "..", "src");

// The props as the library build compiles them: production mode, and only this
// package's own files to resolve types from, since the other packages stay external.
function runtimeProps(file: string) {
  const path = join(src, file);
  const inside = (p: string) => resolve(p).startsWith(resolve(src)) && existsSync(p);
  const { descriptor } = parse(readFileSync(path, "utf8"), { filename: path });
  const fs = { fileExists: inside, readFile: (p: string) => (inside(p) ? readFileSync(p, "utf8") : undefined) };
  return compileScript(descriptor, { id: file, isProd: true, fs }).content;
}

// Vue takes a function default on a prop without a runtime type for a factory:
// it calls it once while mounting and keeps whatever that returns.
test("a prop that defaults to a function keeps its function type in the build", () => {
  for (const file of readdirSync(src).filter((f) => f.endsWith(".vue"))) {
    for (const [decl, name] of runtimeProps(file).matchAll(/^\s*(\w+): \{[^\n]*default: (?!(?:true|false|null|undefined)\b)[A-Za-z_$][\w$]*\s*\}/gm)) {
      assert.match(decl, /type: (Function|\[[^\]]*Function)/, `${file}: ${name}`);
    }
  }
});
