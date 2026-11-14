import { createSignal, Match, Switch } from "solid-js";
import { Card, FieldRow, FieldRowGroup, Selector, TextField, Toggle } from "@glimstone/solid";
import { oledRefusal } from "@glimstone/core";
import { glyph } from "../../solid/glyph";

const PAGES = [
  { id: "general", label: "General", glyph: () => glyph("IconTabGeneral") },
  { id: "look", label: "Look", glyph: () => glyph("IconTabLook") },
  { id: "notifications", label: "Notifications", glyph: () => glyph("IconNotifications") },
];

const THEMES = [
  { id: "dark", label: "Dark", glyph: () => glyph("IconMoon") },
  { id: "light", label: "Light", glyph: () => glyph("IconSun") },
  { id: "system", label: "System", glyph: () => glyph("IconThemeSystem") },
];

const CHANNELS = [
  { id: "stable", label: "Stable" },
  { id: "beta", label: "Beta" },
];

// Every change takes effect as it is made, so the page has no Save button.
export default function SettingsPage() {
  const [page, setPage] = createSignal("general");
  const [name, setName] = createSignal("Atlas");
  const [autostart, setAutostart] = createSignal(true);
  const [updates, setUpdates] = createSignal(true);
  const [channel, setChannel] = createSignal("stable");
  const [theme, setTheme] = createSignal("system");
  const [oled, setOled] = createSignal(false);
  const [failures, setFailures] = createSignal(true);
  const [weekly, setWeekly] = createSignal(false);
  return (
    <div style={{ display: "flex", "flex-wrap": "wrap", gap: "24px", width: "100%", "min-height": "360px" }}>
      <Selector label="Settings pages" orientation="vertical" items={PAGES} value={page()} onChange={setPage} />
      <div style={{ flex: "1 1 20rem", "min-width": 0, display: "grid", "align-content": "start", gap: "40px", "padding-top": "12px" }}>
        <Switch>
          <Match when={page() === "general"}>
            <Card title="General">
              <FieldRowGroup>
                <FieldRow label="Name">
                  <TextField
                    width="grow"
                    value={name()}
                    onInput={(e) => setName(e.currentTarget.value)}
                    error={name().trim() ? undefined : "The instance needs a name"}
                  />
                </FieldRow>
                <FieldRow label="Start with the system">
                  <Toggle checked={autostart()} onChange={setAutostart} />
                </FieldRow>
              </FieldRowGroup>
            </Card>
            <Card title="Updates">
              <FieldRowGroup>
                <FieldRow label="Look for updates">
                  <Toggle checked={updates()} onChange={setUpdates} />
                </FieldRow>
                <FieldRow label="Channel">
                  <Selector inline items={CHANNELS} value={channel()} onChange={setChannel} disabled={!updates()} />
                </FieldRow>
              </FieldRowGroup>
            </Card>
          </Match>
          <Match when={page() === "look"}>
            <Card title="Look">
              <FieldRowGroup>
                <FieldRow label="Theme">
                  <Selector inline items={THEMES} value={theme()} onChange={setTheme} />
                </FieldRow>
                <FieldRow label="OLED" hint="True black for OLED and AMOLED screens, whenever the dark look is showing.">
                  <Toggle checked={oled()} onChange={setOled} refused={oledRefusal(theme())} />
                </FieldRow>
              </FieldRowGroup>
            </Card>
          </Match>
          <Match when={page() === "notifications"}>
            <Card title="Notifications">
              <FieldRowGroup>
                <FieldRow label="When a backup fails">
                  <Toggle checked={failures()} onChange={setFailures} />
                </FieldRow>
                <FieldRow label="A summary every week">
                  <Toggle checked={weekly()} onChange={setWeekly} />
                </FieldRow>
              </FieldRowGroup>
            </Card>
          </Match>
        </Switch>
      </div>
    </div>
  );
}
