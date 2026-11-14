import { For } from "solid-js";
import { Meter } from "@glimstone/solid";

const files = [
  { name: "holiday.mkv", used: 0.64 },
  { name: "backup.tar", used: 0.18 },
  { name: "photos", used: 0.93 },
];

export default function MeterQuiet() {
  return (
    <div style={{ display: "grid", gap: "10px", width: "320px", "font-size": "12px" }}>
      <For each={files}>
        {(f) => (
          <span style={{ display: "flex", "align-items": "center", gap: "10px" }}>
            <span style={{ flex: "1" }}>{f.name}</span>
            <Meter quiet size="small" value={f.used} label={f.name} />
          </span>
        )}
      </For>
      <button type="button" class="demo-footer-line">
        1.4 TB free
        <Meter quiet size="small" value={0.66} label="disk1" />
      </button>
    </div>
  );
}
