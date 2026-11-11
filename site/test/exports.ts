import { readFileSync } from "node:fs";
import { join } from "node:path";

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
