import { createEffect, createSignal, For, onCleanup, Show } from "solid-js";
import { Button, Card, ListRow, Pill, ProgressBar } from "@glimstone/solid";
import { Glyph } from "../../solid/glyph";

interface Upload {
  id: number;
  name: string;
  size: number;
  sent: number;
}

const megabytes = (bytes: number) => `${(bytes / 1e6).toFixed(1)} MB`;

// The upload itself is simulated: each file gains a slice every tick.
export default function UploadArea() {
  let input!: HTMLInputElement;
  let next = 0;
  const [over, setOver] = createSignal(false);
  const [uploads, setUploads] = createSignal<Upload[]>([{ id: -1, name: "holiday.mkv", size: 48e6, sent: 48e6 }]);

  const busy = () => uploads().some((u) => u.sent < u.size);
  createEffect(() => {
    if (!busy()) return;
    const tick = setInterval(() => setUploads((list) => list.map((u) => ({ ...u, sent: Math.min(u.size, u.sent + u.size / 12) }))), 250);
    onCleanup(() => clearInterval(tick));
  });

  const take = (files: FileList | null | undefined) => {
    if (!files?.length) return;
    const added = [...files].map((f) => ({ id: next++, name: f.name, size: Math.max(f.size, 1), sent: 0 }));
    setUploads((list) => [...added, ...list]);
  };

  return (
    <div style={{ width: "100%", "max-width": "560px", "padding-top": "12px" }}>
      <Card title="Upload">
        <div
          class="glim-well"
          data-over={over() || undefined}
          onDragOver={(e) => {
            e.preventDefault();
            setOver(true);
          }}
          onDragLeave={() => setOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setOver(false);
            take(e.dataTransfer?.files);
          }}
          style={{
            display: "grid",
            "justify-items": "center",
            gap: "12px",
            padding: "32px 16px",
            "text-align": "center",
            background: over() ? "var(--accent-soft)" : undefined,
            color: "var(--carbon-text-sub)",
          }}
        >
          <span style={{ color: over() ? "var(--accent-ink)" : "var(--carbon-text-muted)" }}>
            <Glyph name="IconUpload" size={32} />
          </span>
          <span>Drop files here, or choose them</span>
          <Button label="Choose files" labelKey="upload" onClick={() => input.click()} />
          <input ref={input} type="file" multiple hidden onChange={(e) => take(e.currentTarget.files)} />
        </div>
        <div style={{ display: "grid", gap: "2px", "margin-top": "16px" }}>
          <For each={uploads()}>
            {(u) => (
              <Show
                when={u.sent < u.size}
                fallback={<ListRow name={u.name} tile={<Glyph name="IconFile" />} badges={<Pill class="glim-num">{megabytes(u.size)}</Pill>} />}
              >
                <div style={{ display: "grid", gap: "6px", padding: "8px 12px" }}>
                  <span style={{ "font-size": "14px" }}>{u.name}</span>
                  <ProgressBar value={u.sent / u.size} label={u.name} valueText={`${megabytes(u.sent)} of ${megabytes(u.size)}`} />
                </div>
              </Show>
            )}
          </For>
        </div>
      </Card>
    </div>
  );
}
