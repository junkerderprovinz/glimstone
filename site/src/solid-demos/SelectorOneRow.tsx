import { createSignal } from "solid-js";
import { Selector } from "@glimstone/solid";
import { glyph } from "../solid/glyph";

const SHOWN = [
  { id: "open", label: "Open" },
  { id: "closed", label: "Closed in the last 30 days" },
];

const LOOKS = [
  { id: "light", label: "Always the light theme", glyph: () => glyph("IconSun") },
  { id: "dark", label: "Always the dark theme", glyph: () => glyph("IconMoon") },
  { id: "system", label: "Follow the system", glyph: () => glyph("IconThemeSystem") },
];

const THEMES = [
  { id: "system", label: "Follow the system" },
  { id: "light", label: "Always the light theme" },
  { id: "dark", label: "Always the dark theme" },
];

const JOBS = [
  { id: "running", label: "Running" },
  { id: "queued", label: "Waiting in the queue" },
  { id: "done", label: "Finished in the last 30 days" },
];

export default function SelectorOneRow() {
  const [shown, setShown] = createSignal("open");
  const [look, setLook] = createSignal("light");
  const [a, setA] = createSignal("system");
  const [b, setB] = createSignal("system");
  const [jobs, setJobs] = createSignal<string[]>(["running"]);
  return (
    <div style={{ display: "grid", gap: "16px", width: "100%", "max-width": "560px" }}>
      <div data-row="labels">
        <Selector label="Shown" items={SHOWN} value={shown()} onChange={setShown} activation="manual" equalWidth />
      </div>
      <div data-row="glyphs">
        <Selector label="Look" items={LOOKS} value={look()} onChange={setLook} activation="manual" size="lg" equalWidth />
      </div>
      <div data-row="list">
        <Selector label="Theme" items={THEMES} value={a()} onChange={setA} activation="manual" />
      </div>
      <div data-row="list-inline">
        <Selector label="Theme, inline" items={THEMES} value={b()} onChange={setB} activation="manual" size="sm" inline buttonHeight />
      </div>
      <div data-row="cut">
        <Selector label="Jobs" select="many" items={JOBS} value={jobs()} onChange={setJobs} />
      </div>
    </div>
  );
}
