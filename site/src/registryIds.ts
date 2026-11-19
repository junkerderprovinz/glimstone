// The registries the picker demos offer, as an app passes the ones it signs in to.
import type { RegistryProviderId } from "@glimstone/core/registryProviders";

export const REGISTRY_IDS = [
  "acr",
  "codeberg",
  "dockerhub",
  "ecr",
  "forgejo",
  "gar",
  "ghcr",
  "gitea",
  "gitlab",
  "harbor",
  "other",
  "quay",
] as const satisfies readonly RegistryProviderId[];
