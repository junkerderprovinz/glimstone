// Copies the Flutter demos' web build into the site, where each demo page
// frames it. The base becomes relative, so the site finds it under any path,
// on GitHub Pages as in a local preview.
//
// Run from the repository root after `flutter build web` in packages/flutter/example.
import { cpSync, readFileSync, rmSync, writeFileSync } from "node:fs";

const from = new URL("../packages/flutter/example/build/web/", import.meta.url);
const to = new URL("../site/public/flutter/", import.meta.url);
rmSync(to, { recursive: true, force: true });
cpSync(from, to, { recursive: true });
const index = new URL("index.html", to);
writeFileSync(index, readFileSync(index, "utf8").replace('<base href="/">', '<base href="./">'));
console.log("Flutter demos placed in site/public/flutter");
