// The places of the picker states demo: groups rated by a badge, one with an
// (i), tiles that cannot be picked yet, and a mark that opens under the
// pointer. Each framework's demo adds its own glyphs for the other tiles.
import type { PickGroup, PickerText, TileMark } from "@glimstone/core";
import { glyphByName } from "./glyphData";

export const STORAGE_GROUPS: PickGroup[] = [
  { id: "server", title: "On this server", badge: { label: "Best fit", tone: "ok" } },
  { id: "network", title: "On your network", badge: { label: "Good", tone: "neutral" } },
  {
    id: "cloud",
    title: "In the cloud",
    badge: { label: "Slower", tone: "warn" },
    hint: "A cloud service reaches this server from the internet, so it needs an address the internet can find.",
  },
];

export const STORAGE_TEXT: PickerText = {
  search: "Search places",
  none: "Nothing matches “{query}”. S3 compatible reaches most clouds.",
  clear: "Clear the search",
  close: "Close",
  cancel: "Cancel",
  back: "Back",
};

const svg = (name: string, extra = "") => {
  const g = glyphByName.get(name)!;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${g.viewBox}" fill="currentColor"${extra}>${g.svg}</svg>`;
};

/** The folder's mark: closed at rest, open on the lit tile. */
export const FOLDER_MARK: TileMark = {
  svg: svg("IconFolder"),
  hover: svg("IconFolderOpen"),
  className: "glim-demo-folder-mark",
};

/** The places, with the framework's own glyphs for the tiles without a brand. */
export function storageItems<M>(glyph: (name: string) => M) {
  return [
    { id: "folder", label: "Folder", sub: "On this server's disks", group: "server", mark: FOLDER_MARK },
    { id: "usb", label: "USB disk", group: "server", status: "Not plugged in", mark: glyph("IconServer") },
    { id: "smb", label: "SMB", sub: "Windows share", group: "network", mark: glyph("IconNetwork") },
    { id: "nfs", label: "NFS", sub: "Unix share", group: "network", mark: glyph("IconNetwork") },
    { id: "webdav", label: "WebDAV", group: "cloud", status: "Needs a direct address", mark: glyph("IconCloud") },
    { id: "s3", label: "S3 compatible", group: "cloud", last: true, mark: glyph("IconCloud") },
  ];
}

const LABELS = new Map([
  ["folder", "Folder"],
  ["usb", "USB disk"],
  ["smb", "SMB"],
  ["nfs", "NFS"],
  ["webdav", "WebDAV"],
  ["s3", "S3 compatible"],
]);

export const placeOf = (id: string) => LABELS.get(id) ?? id;
