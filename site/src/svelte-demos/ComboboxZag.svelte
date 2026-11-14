<script lang="ts">
  import { Combobox } from "@glimstone/svelte/Combobox";

  const CONTAINERS = [
    "audiobookshelf", "bazarr", "calibre", "crafty", "duplicati", "filebrowser", "gitea", "grafana",
    "homeassistant", "immich", "jellyfin", "kavita", "lidarr", "mariadb", "nextcloud", "nginx",
    "paperless-ngx", "plex", "postgres", "prowlarr", "radarr", "redis", "sabnzbd", "sonarr", "syncthing",
    "tautulli", "unifi", "uptime-kuma", "vaultwarden", "wireguard",
  ].map((c) => ({ value: c, label: c }));
  let container = $state("");
</script>

<div style="width: 280px">
  <Combobox
    label="Container"
    options={CONTAINERS}
    bind:value={container}
    placeholder="Type to filter"
    empty="No container matches."
    toggleLabel="Show all containers"
  />
</div>
