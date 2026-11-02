<script setup lang="ts">
import { ref } from "vue";
import { Combobox } from "@glimstone/vue/Combobox";

const CONTAINERS = [
  "audiobookshelf", "bazarr", "bombvault", "crafty", "duplicati", "filebrowser", "gitea", "grafana",
  "homeassistant", "immich", "jellyfin", "knightloader", "lidarr", "mariadb", "nextcloud", "nginx",
  "paperless-ngx", "plex", "postgres", "prowlarr", "radarr", "redis", "sabnzbd", "sonarr", "syncthing",
  "tautulli", "unifi", "uptime-kuma", "vaultwarden", "wireguard",
].map((c) => ({ value: c, label: c }));
const container = ref("");
</script>

<template>
  <div style="width: 280px">
    <Combobox
      v-model="container"
      label="Container"
      :options="CONTAINERS"
      placeholder="Type to filter"
      empty="No container matches."
      toggle-label="Show all containers"
    />
  </div>
</template>
