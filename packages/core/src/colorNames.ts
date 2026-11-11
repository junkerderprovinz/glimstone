// The name a picked colour proposes, such as "Petrol" for #1b6b73. The nearest
// entry wins by distance in OKLab, which tracks how far apart two colours look
// far better than RGB or HSV, where a step in blue reads smaller than the same
// step in green.

/** A colour's name and the hex value that stands for it. */
export type ColorName = readonly [name: string, hex: string];

/** About ninety German colour names, from white through the greys, reds, yellows, greens and blues to the browns. */
export const COLOR_NAMES_DE: readonly ColorName[] = [
  ["Weiß", "#f7f7f5"], ["Elfenbein", "#fffff0"], ["Creme", "#f5ecd0"], ["Champagner", "#f1ddb2"], ["Beige", "#d9c8a9"], ["Sand", "#c8b48a"],
  ["Hellgrau", "#c8c8c8"], ["Silber", "#b4b8bc"], ["Grau", "#8a8a8a"], ["Steingrau", "#787366"], ["Schiefer", "#5a6470"], ["Anthrazit", "#383e42"], ["Schwarz", "#141414"],
  ["Rot", "#e53935"], ["Karmin", "#c3002f"], ["Kirschrot", "#b5122e"], ["Rubin", "#9b111e"], ["Weinrot", "#7b1f2e"], ["Bordeaux", "#5e1224"],
  ["Ziegelrot", "#b5452c"], ["Rostrot", "#8f3b1b"], ["Koralle", "#ff7f61"], ["Lachs", "#fa8c73"], ["Altrosa", "#c08081"], ["Rosa", "#f4a6c0"],
  ["Pink", "#ff4fa3"], ["Magenta", "#d6008f"], ["Himbeere", "#c51f5d"],
  ["Orange", "#ff8a1f"], ["Apricot", "#fbb57c"], ["Pfirsich", "#ffcba4"], ["Kupfer", "#b87333"], ["Terrakotta", "#c4622d"], ["Bernstein", "#ffb000"],
  ["Ocker", "#cc9a2e"], ["Senf", "#d2a91f"], ["Gold", "#d4af37"], ["Gelb", "#f7d417"], ["Zitronengelb", "#fff44f"], ["Vanille", "#f3e5ab"],
  ["Limette", "#a6d608"], ["Gelbgrün", "#9acd32"], ["Maigrün", "#4caf50"], ["Grün", "#2e9e4f"], ["Grasgrün", "#5aa832"], ["Smaragd", "#079b6b"],
  ["Tannengrün", "#1e4d36"], ["Olivgrün", "#6b7a2a"], ["Oliv", "#808000"], ["Khaki", "#b5a86a"], ["Salbei", "#9caf88"], ["Mint", "#98e2c6"], ["Pistazie", "#b6d39a"],
  ["Türkis", "#1fc0b4"], ["Aquamarin", "#6fd6c8"], ["Petrol", "#1b6b73"], ["Cyan", "#18c3e6"], ["Himmelblau", "#6ec3f2"], ["Hellblau", "#a7d3f5"],
  ["Eisblau", "#cfe8f7"], ["Azurblau", "#2a8ff7"], ["Blau", "#1e6fe0"], ["Königsblau", "#2340b5"], ["Stahlblau", "#4682b4"], ["Taubenblau", "#7d93a8"],
  ["Jeansblau", "#4a6a94"], ["Marine", "#1b2a5a"], ["Nachtblau", "#0f1b3d"], ["Indigo", "#3f3fb5"],
  ["Lavendel", "#b7a5e3"], ["Flieder", "#c8a2d6"], ["Violett", "#7f3fbf"], ["Lila", "#9b59d0"], ["Purpur", "#80207a"], ["Pflaume", "#6e2a5a"],
  ["Aubergine", "#4b1f3f"], ["Mauve", "#b784a7"],
  ["Braun", "#7b4a2a"], ["Schokobraun", "#4e2c1c"], ["Kaffee", "#6f4e37"], ["Haselnuss", "#a67b5b"], ["Karamell", "#c68e4f"], ["Zimt", "#a5603a"], ["Taupe", "#8b7d6b"],
];

type Lab = readonly [number, number, number];

/** A `#rrggbb` colour in OKLab, as lightness and the two opponent axes. */
export function oklab(hex: string): Lab {
  const n = parseInt(hex.replace(/^#/, ""), 16);
  const linear = (v: number) => {
    const c = v / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  const r = linear((n >> 16) & 255);
  const g = linear((n >> 8) & 255);
  const b = linear(n & 255);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
}

// A picker asks on every step of a drag, so each list is converted once.
const labs = new WeakMap<readonly ColorName[], Lab[]>();

/** The name in `names` that looks closest to `hex`, or null for an empty list or a value that is no hex colour. */
export function nearestColorName(hex: string, names: readonly ColorName[] = COLOR_NAMES_DE): string | null {
  if (!/^#?[0-9a-f]{6}$/i.test(hex) || names.length === 0) return null;
  let table = labs.get(names);
  if (!table) {
    table = names.map(([, h]) => oklab(h));
    labs.set(names, table);
  }
  const [L, A, B] = oklab(hex);
  let best = 0;
  let bestDistance = Infinity;
  table.forEach(([l, a, b], i) => {
    const d = (L - l) ** 2 + (A - a) ** 2 + (B - b) ** 2;
    if (d < bestDistance) {
      bestDistance = d;
      best = i;
    }
  });
  return names[best]![0];
}
