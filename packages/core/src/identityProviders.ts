// The identity catalog: the sign-in services an app hands its login to over
// OpenID Connect, each with its mark. An app hands catalogPicker the ids it
// can sign in through and keeps what it needs to reach one (the issuer, the
// client, the scopes it asks for) beside them by id.
//
// Every service here is one people run on their own server, so they stand in
// one group. An issuer the catalog does not know is the app's own tile, which
// it adds after the catalog's and marks last.

import type { Catalog, CatalogEntry } from "./catalog.ts";
import { IDENTITY_MARKS as M } from "./identityMarks.ts";

export type IdentityGroup = "selfHosted";

const ENTRIES = [
  { id: "authelia", name: "Authelia", group: "selfHosted", terms: ["forward auth"], mark: M.authelia },
  {
    id: "authentik",
    name: "authentik",
    group: "selfHosted",
    terms: ["goauthentik", "SAML", "LDAP", "RADIUS", "forward auth"],
    mark: M.authentik,
  },
  { id: "kanidm", name: "Kanidm", group: "selfHosted", terms: ["LDAP", "RADIUS"], glyph: "IconSignIn" },
  { id: "keycloak", name: "Keycloak", group: "selfHosted", terms: ["Red Hat", "SAML"], mark: M.keycloak },
  { id: "pocket-id", name: "Pocket ID", group: "selfHosted", terms: ["passkeys"], mark: M.pocketid },
  { id: "zitadel", name: "ZITADEL", group: "selfHosted", terms: ["SAML"], mark: M.zitadel },
] as const satisfies readonly CatalogEntry<IdentityGroup>[];

export type IdentityProviderId = (typeof ENTRIES)[number]["id"];

/** Every sign-in service, with its group's place in the picker. */
export const IDENTITY_PROVIDERS: Catalog<IdentityGroup, IdentityProviderId> = {
  groups: ["selfHosted"],
  entries: ENTRIES,
};
