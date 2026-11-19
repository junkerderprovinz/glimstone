// The registry catalog: the container registries an app signs in to for
// private images, each with its mark. An app passes the ids it offers to
// catalogPicker and keeps what it needs to sign in (the host, a user, a token)
// beside them by id.
//
// A registry everybody reaches at one address is public. One a cloud hands out
// per account sits under the clouds, and one people run themselves stands last,
// with the registry at any address, which the app marks last.
//
// A registry wears its own mark or its owner's, never a neighbour's.

import type { Catalog, CatalogEntry } from "./catalog.ts";
import { REGISTRY_MARKS as M } from "./registryMarks.ts";

export type RegistryGroup = "public" | "cloud" | "selfHosted";

const ENTRIES = [
  { id: "codeberg", name: "Codeberg", group: "public", terms: ["Forgejo"], mark: M.codeberg },
  { id: "dockerhub", name: "Docker Hub", group: "public", terms: ["docker.io"], mark: M.docker },
  { id: "ghcr", name: "GitHub", group: "public", terms: ["GitHub Container Registry", "ghcr.io"], mark: M.github },
  { id: "gitlab", name: "GitLab", group: "public", terms: ["registry.gitlab.com"], mark: M.gitlab },
  { id: "quay", name: "Quay.io", group: "public", terms: ["Red Hat"], mark: M.quay },

  { id: "acr", name: "Azure Container Registry", group: "cloud", terms: ["Microsoft", "azurecr.io"], mark: M.azure },
  { id: "ecr", name: "Amazon ECR", group: "cloud", terms: ["AWS", "Elastic Container Registry"], mark: M.aws },
  { id: "gar", name: "Google Artifact Registry", group: "cloud", terms: ["Google Cloud", "GCP", "pkg.dev"], mark: M.googlecloud },

  { id: "forgejo", name: "Forgejo", group: "selfHosted", mark: M.forgejo },
  { id: "gitea", name: "Gitea", group: "selfHosted", mark: M.gitea },
  { id: "harbor", name: "Harbor", group: "selfHosted", mark: M.harbor },
  {
    id: "other",
    name: "Other registry",
    group: "selfHosted",
    terms: ["Docker Distribution", "Nexus", "Artifactory", "Zot"],
    glyph: "IconDatabase",
    word: true,
  },
] as const satisfies readonly CatalogEntry<RegistryGroup>[];

export type RegistryProviderId = (typeof ENTRIES)[number]["id"];

/** Every container registry, with its group's place in the picker. */
export const REGISTRY_PROVIDERS: Catalog<RegistryGroup, RegistryProviderId> = {
  groups: ["public", "cloud", "selfHosted"],
  entries: ENTRIES,
};
