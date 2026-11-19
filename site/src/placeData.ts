// The places of the picker states demo: groups rated by a badge, one with an
// (i), tiles that cannot be picked yet, a mark that opens under the pointer and
// a wordmark that stands for its name. Each framework's demo adds its own
// glyphs for the other tiles.
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

/** Nimbo, a cloud made up for the demo, whose mark is its name in round strokes. */
export const NIMBO_MARK: TileMark = {
  svg:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -0.2 59.6 16.4" fill="none" stroke="var(--mark-ink, light-dark(#0b6bcb, #5aa9f5))" stroke-width="2.4" stroke-linecap="round">' +
    '<path d="M1.2 5v10m0-6a4 4 0 0 1 8 0v6M13 1.6h0M13 5.6V15M16.8 5v10m0-6.5a3.5 3.5 0 0 1 7 0V15m0-6.5a3.5 3.5 0 0 1 7 0V15M34.6 1v14m0-5a5 5 0 1 0 10 0 5 5 0 1 0-10 0m13.8 0a5 5 0 1 0 10 0 5 5 0 1 0-10 0"/></svg>',
  tile: "#0b6bcb",
  ink: "#ffffff",
  wordmark: true,
};

/** The places, with the framework's own glyphs for the tiles without a brand. */
export function storageItems<M>(glyph: (name: string) => M) {
  return [
    { id: "folder", label: "Folder", sub: "On this server's disks", group: "server", mark: FOLDER_MARK },
    { id: "usb", label: "USB disk", group: "server", status: "Not plugged in", mark: glyph("IconServer") },
    { id: "smb", label: "SMB", sub: "Windows share", group: "network", mark: glyph("IconNetwork") },
    { id: "nfs", label: "NFS", sub: "Unix share", group: "network", mark: glyph("IconNetwork") },
    { id: "nimbo", label: "Nimbo", sub: "Cloud drive", group: "cloud", mark: NIMBO_MARK },
    { id: "webdav", label: "WebDAV", group: "cloud", status: "Needs a direct address", mark: glyph("IconCloud") },
    { id: "s3", label: "S3 compatible", group: "cloud", last: true, mark: glyph("IconCloud") },
  ];
}

const LABELS = new Map([
  ["folder", "Folder"],
  ["usb", "USB disk"],
  ["smb", "SMB"],
  ["nfs", "NFS"],
  ["nimbo", "Nimbo"],
  ["webdav", "WebDAV"],
  ["s3", "S3 compatible"],
]);

export const placeOf = (id: string) => LABELS.get(id) ?? id;
