import { Meter } from "@glimstone/react";

const files = [
  { name: "holiday.mkv", used: 0.64 },
  { name: "backup.tar", used: 0.18 },
  { name: "photos", used: 0.93 },
];

export default function MeterQuiet() {
  return (
    <div style={{ display: "grid", gap: 10, width: 320, fontSize: 12 }}>
      {files.map((f) => (
        <span key={f.name} style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ flex: 1 }}>{f.name}</span>
          <Meter quiet size="small" value={f.used} label={f.name} />
        </span>
      ))}
      <button type="button" className="demo-footer-line">
        1.4 TB free
        <Meter quiet size="small" value={0.66} label="disk1" />
      </button>
    </div>
  );
}
