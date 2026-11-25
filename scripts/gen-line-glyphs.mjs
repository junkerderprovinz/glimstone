// Writes packages/core/glyphs-line.json, the line set the glyph engine shows
// under data-glyphs="line": for every glyph in glyphs.json that has one, the
// Lucide drawing that means the same, on Lucide's 24-unit grid. A glyph left
// out of the table keeps its filled drawing in both styles, and so does every
// brand mark. With --check it only says whether the file is current.
//
// Run from the repository root: node scripts/gen-line-glyphs.mjs [--check]
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = join(root, "packages/core/glyphs-line.json");
const icons = join(dirname(createRequire(import.meta.url).resolve("lucide-static/package.json")), "icons");
const glyphs = JSON.parse(readFileSync(join(root, "packages/core/glyphs.json"), "utf8"));

// The GlimStone glyph, without its Icon prefix, and the Lucide icon that means the same.
const LINE = {
  Eye: "eye", EyeOff: "eye-off", Refresh: "rotate-ccw", Retry: "refresh-cw", Upload: "upload", Import: "import", Download: "download",
  Export: "file-output", Search: "search", Play: "play", Pause: "pause", Stop: "square", Power: "power", Sleep: "moon-star",
  Trash: "trash-2", TrashFiles: "file-x", Empty: "list-x", Add: "plus", Close: "x", WindowMinimise: "minus", WindowMaximise: "square",
  WindowRestore: "copy", Pencil: "pencil", Copy: "copy", Check: "check", Confirm: "circle-check", Reject: "circle-x", Apply: "check-check",
  Undo: "undo-2", Link: "link", Unlink: "unlink", Key: "key-round", KeyRevoke: "key-square", ForgotPassword: "key-round", SignIn: "log-in",
  SignOut: "log-out", Info: "info", Help: "circle-help", More: "ellipsis", Menu: "menu", Save: "save", Unlock: "lock-open", Prune: "scissors",
  Compact: "shrink", Compute: "calculator", Back: "arrow-left", Forward: "arrow-right", Latest: "chevrons-down", First: "chevrons-up",
  MoveUp: "arrow-up", MoveDown: "arrow-down", Move: "move", Expand: "chevron-down", Collapse: "chevron-up", SelectAll: "square-check-big",
  ClearSelection: "square-x", Compare: "git-compare", KeepBoth: "copy-plus", KeepLeft: "arrow-left-to-line", KeepRight: "arrow-right-to-line",
  Merge: "merge", Filter: "funnel", Pin: "pin", Priority: "arrow-up-narrow-wide", Grip: "grip-vertical", ExternalLink: "external-link",
  Warning: "triangle-alert", Bolt: "zap", Mail: "mail", SendTest: "send", Coffee: "coffee", ShieldOn: "shield-check", ShieldOff: "shield-off",
  CompressOff: "file", CompressAuto: "file-archive", CompressMax: "archive", Code: "code", Moon: "moon", Sun: "sun", ThemeSystem: "sun-moon",
  CornerRound: "circle", CornerSoft: "square-round-corner", CornerSquare: "square", CornerLeaf: "leaf", MotionOff: "circle-off",
  MotionSubtle: "wind", MotionWild: "tornado", MotionStorm: "cloud-lightning", LabelText: "type", LabelTextGlyph: "text-cursor-input",
  LabelGlyph: "image", LabelReactive: "mouse-pointer-click", RowCompact: "rows-4", RowMedium: "rows-3", RowComfortable: "rows-2",
  AccentSystem: "wand-sparkles", Gear: "settings", Dashboard: "layout-dashboard", Folder: "folder", FolderOpen: "folder-open",
  FolderAdd: "folder-plus", Archive: "archive", FileVideo: "file-video-camera", FileAudio: "file-music", FileImage: "file-image",
  FileSubtitles: "captions", FileText: "file-text", File: "file", Fleet: "boxes", Collector: "inbox", Accounts: "users", Network: "network",
  Phone: "smartphone", Server: "server", Laptop: "laptop", Browser: "app-window", App: "app-window-mac", Modules: "blocks", Captcha: "bot",
  Containers: "container", VM: "monitor", Files: "files", Receiver: "cloud-download", BackupNow: "hard-drive-upload", Restore: "rotate-ccw",
  Sync: "refresh-ccw", Recovery: "life-buoy", Live: "radio", Config: "file-cog", ViewSimple: "layout-list", ViewAdvanced: "layout-grid",
  Flash: "usb", Cloud: "cloud", Local: "hard-drive", Database: "database", ZFS: "layers", Anomalies: "activity",
  TabGeneral: "sliders-horizontal", TabLook: "palette", TabSecurity: "shield", TabAdvanced: "wrench", TabApp: "smartphone",
  TabApps: "layout-grid", TabSystem: "cpu", TabStorage: "hard-drive", TabRetention: "history", TabIntegrity: "badge-check",
  TabRecovery: "life-buoy", TabOffsite: "cloud-upload", Schedules: "calendar-clock", Notifications: "bell", Sliders: "sliders-vertical",
  Diagnostics: "stethoscope", Keyboard: "keyboard", Paste: "clipboard-paste", Sort: "arrow-up-down", FolderUp: "folder-up",
  Health: "heart-pulse", Queued: "list-ordered", CaptchaTimer: "timer", Resolvers: "gauge", WhatsNew: "sparkles", MailOpen: "mail-open",
  Manual: "book-open", ManualOpen: "book-open-text", Star: "star", StopAsking: "message-circle-off", Cookies: "cookie", Log: "scroll-text",
  Install: "package-plus", Update: "refresh-cw", UpToDate: "circle-check-big", UpdateAvailable: "circle-arrow-up", ResetArrow: "rotate-ccw",
  FileRaw: "camera", FileDesign: "pen-tool", FilePlaylist: "list-music", FilePdf: "file-text", FileDoc: "file-type",
  FileSheet: "file-spreadsheet", FileSlides: "presentation", Book: "book", Disc: "disc", FileProgram: "package", Font: "type", Hash: "hash",
  Magnet: "magnet", Cube: "box", Calendar: "calendar", Hourglass: "hourglass",
};

const names = new Set(glyphs.map((g) => g.name));
const entries = Object.entries(LINE).map(([name, icon]) => {
  if (!names.has(`Icon${name}`)) throw new Error(`no glyph Icon${name} in glyphs.json`);
  const file = join(icons, `${icon}.svg`);
  if (!existsSync(file)) throw new Error(`Lucide has no ${icon}`);
  const svg = readFileSync(file, "utf8")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/^[\s\S]*?<svg[^>]*>/, "")
    .replace(/<\/svg>\s*$/, "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .join("");
  return { name: `Icon${name}`, source: `Lucide ${icon}`, svg };
});
// In the order of glyphs.json, so a diff of the two lines up.
const order = new Map(glyphs.map((g, i) => [g.name, i]));
entries.sort((a, b) => order.get(a.name) - order.get(b.name));

const text = JSON.stringify(entries, null, 1) + "\n";
if (process.argv.includes("--check")) {
  const current = existsSync(out) ? readFileSync(out, "utf8") : "";
  if (current !== text) {
    console.error("packages/core/glyphs-line.json is out of date; run node scripts/gen-line-glyphs.mjs");
    process.exit(1);
  }
  console.log("glyphs-line.json is current");
} else {
  writeFileSync(out, text);
  console.log(`wrote ${entries.length} line glyphs`);
}
