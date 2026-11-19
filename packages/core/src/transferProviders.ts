// The transfer catalog: the services that send a file as a link, which an app
// fetches with a client of its own and no login, each with its mark. An app
// hands catalogPicker the ids it can fetch from and keeps its client beside
// them by id.
//
// A service is known by the word the app names its client by, and the domains
// its links are written with are words its tile is found by. Cloud drives that
// share a file the same way, such as Dropbox or OneDrive, are storage
// providers and stand in that catalog.

import type { Catalog, CatalogEntry } from "./catalog.ts";
import { TRANSFER_MARKS as M } from "./transferMarks.ts";

export type TransferGroup = "transfer";

const ENTRIES = [
  { id: "swisstransfer", name: "SwissTransfer", group: "transfer", terms: ["swisstransfer.com", "Infomaniak"], mark: M.swisstransfer },
  { id: "wetransfer", name: "WeTransfer", group: "transfer", terms: ["wetransfer.com", "we.tl"], mark: M.wetransfer },
] as const satisfies readonly CatalogEntry<TransferGroup>[];

export type TransferProviderId = (typeof ENTRIES)[number]["id"];

/** Every transfer service, with its group's place in the picker. */
export const TRANSFER_PROVIDERS: Catalog<TransferGroup, TransferProviderId> = {
  groups: ["transfer"],
  entries: ENTRIES,
};
