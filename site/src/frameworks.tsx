import { FLUTTER_SVG, REACT_SVG, SOLID_SVG, SVELTE_SVG, VUE_SVG } from "@glimstone/core";

const MARKS: Record<string, string> = {
  react: REACT_SVG,
  vue: VUE_SVG,
  solid: SOLID_SVG,
  svelte: SVELTE_SVG,
  flutter: FLUTTER_SVG,
};

/** A framework's mark at glyph size, in the ink around it, wherever the site names the framework. */
export function FrameworkMark({ id }: { id: string }) {
  const svg = MARKS[id];
  return svg ? <span className="fw-mark" aria-hidden="true" dangerouslySetInnerHTML={{ __html: svg }} /> : null;
}

/** The packages a web app adopts, in the order the site lists them. */
export const WEB_FRAMEWORKS = [
  { id: "react", name: "React" },
  { id: "vue", name: "Vue" },
  { id: "solid", name: "Solid" },
  { id: "svelte", name: "Svelte" },
] as const;
