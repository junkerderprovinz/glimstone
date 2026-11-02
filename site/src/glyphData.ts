import glyphs from "@glimstone/core/glyphs.json";

export interface GlyphEntry {
  name: string;
  means: string;
  viewBox: string;
  svg: string;
}

export const GLYPHS = glyphs as GlyphEntry[];
export const glyphByName = new Map(GLYPHS.map((g) => [g.name, g]));

// The site's own label keys. A real app maps its translation keys the same way.
const KEYS: Record<string, string> = {
  save: "IconSave",
  delete: "IconTrash",
  cancel: "IconClose",
  copy: "IconCopy",
  copied: "IconCheck",
  success: "IconCheck",
  confirm: "IconConfirm",
  refresh: "IconRetry",
  download: "IconDownload",
  upload: "IconUpload",
  add: "IconAdd",
  edit: "IconPencil",
  search: "IconSearch",
  settings: "IconGear",
  link: "IconLink",
  play: "IconPlay",
  pause: "IconPause",
  restore: "IconRestore",
  backup: "IconBackupNow",
  look: "IconTabLook",
  reset: "IconRefresh",
  open: "IconExternalLink",
};

/** The glyph a label key stands for, or undefined where the set has none. */
export function glyphNameFor(key: string): string | undefined {
  const name = KEYS[key] ?? `Icon${key.charAt(0).toUpperCase()}${key.slice(1)}`;
  return glyphByName.has(name) ? name : undefined;
}
