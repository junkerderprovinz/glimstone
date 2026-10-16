import { useState } from "react";
import { Combobox } from "@gs/react/Combobox";

const CONTAINERS = [
  "audiobookshelf", "bazarr", "bombvault", "crafty", "duplicati", "filebrowser", "gitea", "grafana",
  "homeassistant", "immich", "jellyfin", "knightloader", "lidarr", "mariadb", "nextcloud", "nginx",
  "paperless-ngx", "plex", "postgres", "prowlarr", "radarr", "redis", "sabnzbd", "sonarr", "syncthing",
  "tautulli", "unifi", "uptime-kuma", "vaultwarden", "wireguard",
].map((c) => ({ value: c, label: c }));

export default function ComboboxZag() {
  const [container, setContainer] = useState("");
  return (
    <div style={{ width: 280 }}>
      <Combobox
        label="Container"
        options={CONTAINERS}
        value={container}
        onChange={setContainer}
        placeholder="Type to filter"
        empty="No container matches."
        toggleLabel="Show all containers"
      />
    </div>
  );
}
