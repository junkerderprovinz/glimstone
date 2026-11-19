// The connection row demos: a VPN, a cloud drive and a registry wearing their
// catalog marks, and a server of the app's own under its glyph. A test reaches
// the first two and fails on the server, and the registry has no test until it
// is signed in again. Each framework's demo draws the glyph its own way.
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
  /** Badges after the name, as words with a fail tone. */
  badge?: string;
  /** A second quiet line. */
  more?: string;
  reaches: boolean;
  /** Leaves the Test button out. */
  untested?: boolean;
}

export const CONNECTIONS: DemoConnection[] = [
  { id: "mullvad", name: "Mullvad VPN", mark: VPN_MARKS.mullvad, status: "Connected, traffic leaves in Vienna", more: "Used by nightly-backup and photos", reaches: true },
  { id: "nextcloud", name: "Nextcloud", mark: STORAGE_MARKS.nextcloud, status: "Signed in as maria at cloud.example.org", reaches: true },
  { id: "ghcr", name: "GitHub Container Registry", mark: REGISTRY_MARKS.github, status: "Signed in as maria-builds", badge: "Sign-in expired", reaches: false, untested: true },
  { id: "sftp", name: "Backup server", mark: "IconServer", status: "Not tested yet", reaches: false },
];

/** A test that takes a moment and comes back with what it found. */
export const testConnection = (c: DemoConnection) =>
  new Promise<ConnectionTest>((done) =>
    setTimeout(() => done(c.reaches ? { tone: "ok", title: "Reached" } : { tone: "danger", title: "Not reached: the server refused the sign-in" }), 400),
  );
