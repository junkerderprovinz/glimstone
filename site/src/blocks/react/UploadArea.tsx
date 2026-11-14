import { useEffect, useRef, useState, type DragEvent } from "react";
import { Button, Card, ListRow, Pill, ProgressBar } from "@glimstone/react";
import { Glyph } from "../../glyph";

interface Upload {
  id: number;
  name: string;
  size: number;
  sent: number;
}

const megabytes = (bytes: number) => `${(bytes / 1e6).toFixed(1)} MB`;

// The upload itself is simulated: each file gains a slice every tick.
export default function UploadArea() {
  const input = useRef<HTMLInputElement>(null);
  const next = useRef(0);
  const [over, setOver] = useState(false);
  const [uploads, setUploads] = useState<Upload[]>([{ id: -1, name: "holiday.mkv", size: 48e6, sent: 48e6 }]);

  const busy = uploads.some((u) => u.sent < u.size);
  useEffect(() => {
    if (!busy) return;
    const tick = setInterval(
      () => setUploads((list) => list.map((u) => ({ ...u, sent: Math.min(u.size, u.sent + u.size / 12) }))),
      250,
    );
    return () => clearInterval(tick);
  }, [busy]);

  const take = (files: FileList | null) => {
    if (!files?.length) return;
    const added = [...files].map((f) => ({ id: next.current++, name: f.name, size: Math.max(f.size, 1), sent: 0 }));
    setUploads((list) => [...added, ...list]);
  };
  const drop = (e: DragEvent) => {
    e.preventDefault();
    setOver(false);
    take(e.dataTransfer.files);
  };

  return (
    <div style={{ width: "100%", maxWidth: 560, paddingTop: 12 }}>
      <Card title="Upload">
        <div
          className="glim-well"
          data-over={over || undefined}
          onDragOver={(e) => {
            e.preventDefault();
            setOver(true);
          }}
          onDragLeave={() => setOver(false)}
          onDrop={drop}
          style={{
            display: "grid",
            justifyItems: "center",
            gap: 12,
            padding: "32px 16px",
            textAlign: "center",
            background: over ? "var(--accent-soft)" : undefined,
            color: "var(--carbon-text-sub)",
          }}
        >
          <span style={{ color: over ? "var(--accent-ink)" : "var(--carbon-text-muted)" }}>
            <Glyph name="IconUpload" size={32} />
          </span>
          <span>Drop files here, or choose them</span>
          <Button label="Choose files" labelKey="upload" onClick={() => input.current?.click()} />
          <input ref={input} type="file" multiple hidden onChange={(e) => take(e.target.files)} />
        </div>
        <div style={{ display: "grid", gap: 2, marginTop: 16 }}>
          {uploads.map((u) =>
            u.sent < u.size ? (
              <div key={u.id} style={{ display: "grid", gap: 6, padding: "8px 12px" }}>
                <span style={{ fontSize: 14 }}>{u.name}</span>
                <ProgressBar value={u.sent / u.size} label={u.name} valueText={`${megabytes(u.sent)} of ${megabytes(u.size)}`} />
              </div>
            ) : (
              <ListRow key={u.id} name={u.name} tile={<Glyph name="IconFile" />} badges={<Pill className="glim-num">{megabytes(u.size)}</Pill>} />
            ),
          )}
        </div>
      </Card>
    </div>
  );
}
