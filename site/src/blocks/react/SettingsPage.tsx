import { useState } from "react";
import { Card, FieldRow, FieldRowGroup, Selector, TextField, Toggle } from "@glimstone/react";
import { oledRefusal } from "@glimstone/core";
import { Glyph } from "../../glyph";

const PAGES = [
  { id: "general", label: "General", glyph: <Glyph name="IconTabGeneral" /> },
  { id: "look", label: "Look", glyph: <Glyph name="IconTabLook" /> },
  { id: "notifications", label: "Notifications", glyph: <Glyph name="IconNotifications" /> },
];

const THEMES = [
  { id: "dark", label: "Dark", glyph: <Glyph name="IconMoon" /> },
  { id: "light", label: "Light", glyph: <Glyph name="IconSun" /> },
  { id: "system", label: "System", glyph: <Glyph name="IconThemeSystem" /> },
];

const CHANNELS = [
  { id: "stable", label: "Stable" },
  { id: "beta", label: "Beta" },
];

// Every change takes effect as it is made, so the page has no Save button.
export default function SettingsPage() {
  const [page, setPage] = useState("general");
  const [name, setName] = useState("Atlas");
  const [autostart, setAutostart] = useState(true);
  const [updates, setUpdates] = useState(true);
  const [channel, setChannel] = useState("stable");
  const [theme, setTheme] = useState("system");
  const [oled, setOled] = useState(false);
  const [failures, setFailures] = useState(true);
  const [weekly, setWeekly] = useState(false);
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 24, width: "100%", minHeight: 360 }}>
      <Selector label="Settings pages" orientation="vertical" items={PAGES} value={page} onChange={setPage} />
      <div style={{ flex: "1 1 20rem", minWidth: 0, display: "grid", alignContent: "start", gap: 40, paddingTop: 12 }}>
        {page === "general" && (
          <>
            <Card title="General">
              <FieldRowGroup>
                <FieldRow label="Name">
                  <TextField width="grow" value={name} onChange={(e) => setName(e.target.value)} error={name.trim() ? undefined : "The instance needs a name"} />
                </FieldRow>
                <FieldRow label="Start with the system">
                  <Toggle checked={autostart} onChange={setAutostart} />
                </FieldRow>
              </FieldRowGroup>
            </Card>
            <Card title="Updates">
              <FieldRowGroup>
                <FieldRow label="Look for updates">
                  <Toggle checked={updates} onChange={setUpdates} />
                </FieldRow>
                <FieldRow label="Channel">
                  <Selector inline items={CHANNELS} value={channel} onChange={setChannel} disabled={!updates} />
                </FieldRow>
              </FieldRowGroup>
            </Card>
          </>
        )}
        {page === "look" && (
          <Card title="Look">
            <FieldRowGroup>
              <FieldRow label="Theme">
                <Selector inline items={THEMES} value={theme} onChange={setTheme} />
              </FieldRow>
              <FieldRow label="OLED" hint="True black for OLED and AMOLED screens, whenever the dark look is showing.">
                <Toggle checked={oled} onChange={setOled} refused={oledRefusal(theme)} />
              </FieldRow>
            </FieldRowGroup>
          </Card>
        )}
        {page === "notifications" && (
          <Card title="Notifications">
            <FieldRowGroup>
              <FieldRow label="When a backup fails">
                <Toggle checked={failures} onChange={setFailures} />
              </FieldRow>
              <FieldRow label="A summary every week">
                <Toggle checked={weekly} onChange={setWeekly} />
              </FieldRow>
            </FieldRowGroup>
          </Card>
        )}
      </div>
    </div>
  );
}
