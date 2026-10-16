import glyphs from "@gs/glyphs.json";
import { setGlyphResolver } from "@gs/react/glyphs";

export interface GlyphEntry {
  name: string;
  means: string;
  viewBox: string;
  svg: string;
}

export const GLYPHS = glyphs as GlyphEntry[];
const byName = new Map(GLYPHS.map((g) => [g.name, g]));

export function Glyph({ name, size = 16 }: { name: string; size?: number }) {
  const g = byName.get(name);
  if (!g) return null;
  return (
    <svg
      width={size}
      height={size}
      viewBox={g.viewBox}
      aria-hidden="true"
      fill="currentColor"
      dangerouslySetInnerHTML={{ __html: g.svg }}
    />
  );
}

// The site's own label keys. A real app maps its translation keys the same way.
const KEYS: Record<string, string> = {
  save: "IconSave",
  delete: "IconTrash",
  cancel: "IconClose",
  copy: "IconCopy",
  copied: "IconCheck",
  confirm: "IconCheck",
  refresh: "IconRefresh",
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

setGlyphResolver((key) => {
  const name = KEYS[key] ?? `Icon${key.charAt(0).toUpperCase()}${key.slice(1)}`;
  return byName.has(name) ? <Glyph name={name} /> : undefined;
});
