// The connection row demos: a VPN, a cloud drive and a registry wearing their
// catalog marks, and a server and a share of the app's own under their glyphs.
// A test reaches the first two and the share and fails on the server, and the
// registry has no test until it is signed in again. The share brings a Mount
// of its own that turns into Unmount. Each framework's demo draws the glyphs
// its own way.
import type { ConnectionRowText, ConnectionTest, TileMark } from "@glimstone/core";
import { REGISTRY_MARKS } from "@glimstone/core/registryMarks";
import { STORAGE_MARKS } from "@glimstone/core/storageMarks";
import { VPN_MARKS } from "@glimstone/core/vpnMarks";

export const CONNECTION_TEXT: ConnectionRowText = { test: "Test", edit: "Edit", remove: "Remove" };

export interface DemoConnection {
  id: string;
  name: string;
  /** A catalog mark, or the name of the glyph that stands in for one. */
  mark: TileMark | string;
  status: string;
  /** A badge after the name. */
  badge?: string;
  /** The badge's tone, fail unless it says a plain fact. */
  tone?: "fail" | "neutral";
  /** A second quiet line. */
  more?: string;
  reaches: boolean;
  /** Leaves the Test button out. */
  untested?: boolean;
  /** Offers Mount and Unmount before the row's own buttons. */
  mountable?: boolean;
}

export const CONNECTIONS: DemoConnection[] = [
  { id: "mullvad", name: "Mullvad VPN", mark: VPN_MARKS.mullvad, status: "Connected, traffic leaves in Vienna", more: "Used by nightly-backup and photos", reaches: true },
  { id: "nextcloud", name: "Nextcloud", mark: STORAGE_MARKS.nextcloud, status: "Signed in as maria at cloud.example.org", reaches: true },
  { id: "ghcr", name: "GitHub Container Registry", mark: REGISTRY_MARKS.github, status: "Signed in as maria-builds", badge: "Sign-in expired", reaches: false, untested: true },
  { id: "sftp", name: "Backup server", mark: "IconServer", status: "Not tested yet", badge: "Read only", tone: "neutral", reaches: false },
  { id: "media", name: "Media share", mark: "IconFolder", status: "SMB share on 192.168.1.20", reaches: true, mountable: true },
];

/** A test that takes a moment and comes back with what it found. */
export const testConnection = (c: DemoConnection) =>
  new Promise<ConnectionTest>((done) =>
    setTimeout(() => done(c.reaches ? { tone: "ok", title: "Reached" } : { tone: "danger", title: "Not reached: the server refused the sign-in" }), 400),
  );

export interface DemoMount {
  mounted: boolean;
  busy?: boolean;
}

/** The share's Mount or Unmount, with its glyph by name for each demo to draw. */
export function mountAction(m: DemoMount | undefined) {
  const mounted = m?.mounted ?? false;
  return {
    id: "mount",
    label: mounted ? "Unmount" : "Mount",
    labelKey: mounted ? "unmount" : "mount",
    glyph: mounted ? "IconUnlink" : "IconLink",
    busy: m?.busy,
    tone: mounted ? ("ok" as const) : undefined,
    title: mounted ? "Mounted at /mnt/remotes/media" : undefined,
  };
}

/** Mounting or unmounting takes a moment too. */
export const toggleMount = (mounted: boolean) => new Promise<boolean>((done) => setTimeout(() => done(!mounted), 400));
