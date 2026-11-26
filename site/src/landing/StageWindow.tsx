import { useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { ACCENTS } from "@glimstone/core";
import { Button, Card, FieldRow, FieldRowGroup, ListRow, Meter, ProgressBar, Selector, ToastCard, Toggle } from "@glimstone/react";
import { Glyph } from "../glyph";
import type { Stop } from "./relay";
import { CORNERS, PACES, SPEECHES, scopeOf, type Corner, type Pace, type Speech, type WindowLook } from "./story";

const still = () => {};

const PAGES = [
  { id: "general", name: "General", glyph: "IconTabGeneral" },
  { id: "look", name: "Look", glyph: "IconTabLook" },
  { id: "storage", name: "Storage", glyph: "IconTabStorage" },
  { id: "security", name: "Security", glyph: "IconTabSecurity" },
  { id: "info", name: "Info", glyph: "IconInfo" },
];

const RUNS = [
  { name: "photos", glyph: "IconFolder", meta: "Today, 02:00", size: "212 GB", tone: "ok" as const, state: "Done" },
  { name: "invoices.zip", glyph: "IconArchive", meta: "Yesterday, 02:00", size: "18 MB", tone: "ok" as const, state: "Done" },
  { name: "nightly.tar", glyph: "IconArchive", meta: "Monday, 02:00", size: "2.4 GB", tone: "warn" as const, state: "Skipped" },
];

// Every strip in the window speaks the way the label setting says: glyph alone,
// words alone, or both.
const asItems = <V extends string>(list: { id: V; name: string; glyph: string }[], speech: Speech) =>
  list.map((x) => ({
    id: x.id,
    label: x.name,
    tip: x.name,
    glyph: speech === "text" ? undefined : <Glyph name={x.glyph} />,
    iconOnly: speech === "glyph",
  }));

// The label setting chooses which of the three forms a button takes. The
// buttons are built per form so the window can speak differently from the
// rest of the site.
function Spoken({ speech, label, glyph, tone, onClick }: { speech: Speech; label: string; glyph: string; tone?: "accent"; onClick?: () => void }) {
  if (speech === "text") return <Button label={label} labelKey={null} tone={tone} onClick={onClick} />;
  return (
    <Button
      label={label}
      labelKey={null}
      glyph={<Glyph name={glyph} />}
      tone={tone}
      onClick={onClick}
      compact={speech === "glyph"}
      keepLabel={speech === "both"}
    />
  );
}

export interface StageWindowProps {
  /** What the controls show, which is the pick itself the moment it is made. */
  look: WindowLook;
  /** What each part of the window has taken so far. */
  taken: Record<Stop, WindowLook>;
  onPick: (change: Partial<WindowLook>) => void;
  toast: number;
  replay: number;
  onRun: () => void;
  aim: number | null;
  pressing: boolean;
}

export function StageWindow({ look, taken, onPick, toast, replay, onRun, aim, pressing }: StageWindowProps) {
  const [nightly, setNightly] = useState(true);
  const body = useRef<HTMLDivElement>(null);
  const [cursor, setCursor] = useState<{ x: number; y: number } | null>(null);

  useLayoutEffect(() => {
    const b = body.current;
    const t = aim === null ? null : b?.querySelector<HTMLElement>(`[data-swatch="${aim}"]`);
    if (!b || !t) return;
    const br = b.getBoundingClientRect();
    const tr = t.getBoundingClientRect();
    setCursor({ x: tr.left - br.left + tr.width * 0.55, y: tr.top - br.top + tr.height * 0.6 });
  }, [aim]);

  return (
    <div className="la-window" data-la-pace={taken.page.pace}>
      <div className="la-window-bar">
        <span className="la-window-app">Settings</span>
        <span className="la-window-where">Look</span>
      </div>
      <div className="la-window-body" ref={body}>
        <div className="la-window-rail la-take accent-scope" style={scopeOf(taken.rail)} data-la-stop="rail" data-speech={look.speech}>
          <Selector label="Settings pages" orientation="vertical" items={asItems(PAGES, look.speech)} value="look" onChange={still} />
        </div>
        <div className="la-window-main">
          <div className="la-take accent-scope" style={scopeOf(look)}>
            <Card title="Look">
              <FieldRowGroup>
                <FieldRow label="Accent">
                  <div className="la-swatches" role="radiogroup" aria-label="Accent" data-la-src="accent">
                    {ACCENTS.map((a, i) => (
                      <button
                        key={a.hex}
                        type="button"
                        role="radio"
                        aria-checked={a.hex === look.accent}
                        aria-label={a.name}
                        title={a.name}
                        data-swatch={i}
                        className="la-swatch"
                        style={{ "--la-swatch": a.hex } as CSSProperties}
                        onClick={() => onPick({ accent: a.hex })}
                      />
                    ))}
                  </div>
                </FieldRow>
                <FieldRow label="Corners">
                  <div className="la-src" data-la-src="corner">
                    <Selector<"one", Corner> inline label="Corners" items={asItems(CORNERS, look.speech)} value={look.corner} onChange={(corner) => onPick({ corner })} />
                  </div>
                </FieldRow>
                <FieldRow label="Motion">
                  <div className="la-src" data-la-src="pace">
                    <Selector<"one", Pace> inline label="Motion" items={asItems(PACES, look.speech)} value={look.pace} onChange={(pace) => onPick({ pace })} />
                  </div>
                </FieldRow>
                <FieldRow label="Labels">
                  <div className="la-src" data-la-src="speech">
                    <Selector<"one", Speech> inline label="Labels" items={asItems(SPEECHES, look.speech)} value={look.speech} onChange={(speech) => onPick({ speech })} />
                  </div>
                </FieldRow>
              </FieldRowGroup>
            </Card>
          </div>
          <div className="la-take accent-scope" style={scopeOf(taken.backups)} data-la-stop="backups">
            <Card title="Backups">
              <div className="la-window-stack">
                <Toggle checked={nightly} onChange={setNightly} label="Every night at 02:00" />
                <div className={`la-window-wide la-meters${replay ? " is-replay" : ""}`} data-la-stop="meters" key={replay}>
                  <Meter value={0.42} label="disk1" valueText="2.3 TB free of 4 TB" />
                  <ProgressBar value={0.64} label="Copying to the archive" valueText="2.6 GB of 4 GB" />
                </div>
                <div className="la-window-actions">
                  <div className="la-src" data-la-stop="restore">
                    <Spoken speech={taken.restore.speech} label="Restore" glyph="IconRestore" />
                  </div>
                  <div className="la-src" data-la-stop="run">
                    <Spoken speech={taken.run.speech} label="Run now" glyph="IconPlay" tone="accent" onClick={onRun} />
                  </div>
                </div>
              </div>
            </Card>
          </div>
          <div className="la-window-runs la-window-wide la-take accent-scope" style={scopeOf(taken.runs)} data-la-stop="runs">
            <Card title="Last runs">
              <div className="la-window-rows">
                {RUNS.map((r) => (
                  <ListRow
                    key={r.name}
                    name={r.name}
                    meta={r.meta}
                    tile={<Glyph name={r.glyph} />}
                    badges={
                      <span className="la-run">
                        <span className="la-run-state" data-tone={r.tone}>
                          {r.state}
                        </span>
                        <span className="la-run-size glim-num">{r.size}</span>
                      </span>
                    }
                  />
                ))}
              </div>
            </Card>
          </div>
        </div>
        <span className="la-window-toast la-toast-spot" data-la-stop="toast" aria-hidden="true" />
        {toast > 0 && (
          <div className="la-window-toast" key={toast}>
            <ToastCard
              id="la"
              message="Backup started"
              severity="success"
              dismissLabel="Dismiss"
              onDismiss={still}
              onMouseEnter={still}
              onMouseLeave={still}
              onFocus={still}
              onBlur={still}
            />
          </div>
        )}
        {cursor && aim !== null && (
          <span className={`la-cursor${pressing ? " is-pressing" : ""}`} style={{ transform: `translate(${cursor.x}px, ${cursor.y}px)` }} aria-hidden="true">
            <span className="la-cursor-ring" />
            <svg viewBox="0 0 24 24" width="22" height="22">
              <path d="M5 3 L5 19.5 L9.3 15.4 L12.2 21.6 L14.9 20.4 L12 14.3 L18 14.3 Z" fill="#ffffff" stroke="#161616" strokeWidth="1.4" strokeLinejoin="round" />
            </svg>
          </span>
        )}
      </div>
    </div>
  );
}
