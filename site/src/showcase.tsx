import type { ReactNode } from "react";
import {
  Button,
  Card,
  EmptyState,
  FieldRow,
  FieldRowGroup,
  FortressAppCard,
  IconButton,
  InfoVersionCard,
  ListRow,
  Meter,
  Pill,
  ProgressBar,
  Selector,
  SignInCard,
  SubCard,
  ToastCard,
  Toggle,
  GLIMSTONE_VERSION,
} from "@glimstone/react";
import { fortressTextEn, signInTextEn, SHAPES, type ToastSeverity } from "@glimstone/core";
import logo from "../../.github/assets/logo.svg?url";
import { APPS } from "./fortressData";
import { FrameworkMark, WEB_FRAMEWORKS } from "./frameworks";
import { Glyph } from "./glyph";
import { useLook, type Theme } from "./look";
import { setLookPanel, useLookPanel } from "./lookPanel";

const still = () => {};
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

function SignIn() {
  return (
    <div className="wall-signin">
      <SignInCard logo={logo} appName="GlimStone" text={signInTextEn} passkey reset idPrefix="wall-signin" onSignIn={async () => ({ ok: true })} />
    </div>
  );
}

const PAGES = [
  { id: "general", label: "General", glyph: <Glyph name="IconTabGeneral" /> },
  { id: "look", label: "Look", glyph: <Glyph name="IconTabLook" /> },
  { id: "storage", label: "Storage", glyph: <Glyph name="IconTabStorage" /> },
  { id: "security", label: "Security", glyph: <Glyph name="IconTabSecurity" /> },
  { id: "info", label: "Info", glyph: <Glyph name="IconInfo" /> },
];

// The settings screen shows the look this page is in, so the wall answers the panel.
function Settings() {
  const { theme, shape, oled } = useLook();
  return (
    <div className="wall-screen wall-settings">
      <Selector label="Settings pages" orientation="vertical" items={PAGES} value="look" onChange={still} />
      <Card title="Look">
        <FieldRowGroup>
          <FieldRow label="Theme">
            <Selector<"one", Theme>
              inline
              items={[
                { id: "dark", label: "Dark", glyph: <Glyph name="IconMoon" />, iconOnly: true },
                { id: "light", label: "Light", glyph: <Glyph name="IconSun" />, iconOnly: true },
                { id: "system", label: "System", glyph: <Glyph name="IconThemeSystem" />, iconOnly: true },
              ]}
              value={theme}
              onChange={still}
            />
          </FieldRow>
          <FieldRow label="OLED">
            <Toggle checked={oled} onChange={still} />
          </FieldRow>
          <FieldRow label="Corners">
            <Selector
              inline
              items={SHAPES.map((s) => ({ id: s, label: cap(s), glyph: <Glyph name={`IconCorner${cap(s)}`} />, iconOnly: true }))}
              value={shape}
              onChange={still}
            />
          </FieldRow>
        </FieldRowGroup>
      </Card>
    </div>
  );
}

function Storage() {
  return (
    <Card title="Storage" hueIndex={1}>
      <div className="wall-stack">
        <Meter value={0.42} label="disk1" valueText="2.3 TB free of 4 TB" />
        <Meter value={0.91} label="cache" valueText="90 GB free of 1 TB" />
        <ProgressBar value={0.64} label="Copying to the archive" valueText="2.6 GB of 4 GB" />
      </div>
    </Card>
  );
}

const TOASTS: { message: string; severity: ToastSeverity; action?: string }[] = [
  { message: "Settings saved.", severity: "success" },
  { message: "The target is almost full.", severity: "warn" },
  { message: "1,204 files moved to the trash", severity: "success", action: "Put them back" },
];

function Toasts() {
  return (
    <div className="wall-toasts">
      {TOASTS.map((t, i) => (
        <ToastCard
          key={i}
          id={String(i)}
          message={t.message}
          severity={t.severity}
          action={t.action ? { label: t.action, onClick: still } : undefined}
          dismissLabel="Dismiss"
          onDismiss={still}
          onMouseEnter={still}
          onMouseLeave={still}
          onFocus={still}
          onBlur={still}
        />
      ))}
    </div>
  );
}

function Fortress() {
  return <FortressAppCard app={APPS[0]} text={fortressTextEn} lang="en" hueIndex={2} onOpen={still} />;
}

const FILES = [
  { name: "holiday-2026", glyph: "IconFolder", size: "48 GB", used: 0.62 },
  { name: "photos", glyph: "IconFolder", size: "212 GB", used: 0.93 },
  { name: "invoices.zip", glyph: "IconArchive", size: "18 MB" },
  { name: "nightly.tar", glyph: "IconArchive", size: "2.4 GB" },
];

function Files() {
  return (
    <Card title="Files" hueIndex={3}>
      <div className="wall-rows">
        {FILES.map((f) => (
          <ListRow
            key={f.name}
            name={f.name}
            tile={<Glyph name={f.glyph} />}
            badges={
              <>
                {f.used !== undefined && <Meter quiet size="small" value={f.used} label={f.name} />}
                <Pill className="glim-num">{f.size}</Pill>
              </>
            }
            actions={<IconButton tip="Delete" glyph={<Glyph name="IconTrash" />} />}
          />
        ))}
      </div>
    </Card>
  );
}

function Info() {
  return (
    <InfoVersionCard
      hueIndex={4}
      text={{ title: "Version", unreleased: (v) => `${v}, not released yet` }}
      rows={[
        { name: "Your app", version: "2.1.0" },
        { name: "GlimStone", sub: "Design language", version: GLIMSTONE_VERSION },
        { name: "Fortress", sub: "Pairing", version: GLIMSTONE_VERSION },
      ]}
    />
  );
}

function Empty() {
  return (
    <Card title="Backups" hueIndex={5}>
      <EmptyState
        nested
        glyph={<Glyph name="IconArchive" />}
        title="No backups yet"
        hint="Choose what to keep, and the first run starts tonight."
        action={<Button label="Add a backup" labelKey="add" />}
      />
    </Card>
  );
}

function Schedule() {
  return (
    <Card title="Schedule" hueIndex={6}>
      <SubCard title="Nightly">
        <div className="wall-stack">
          <Toggle label="Run every night" checked onChange={still} />
          <Toggle label="Verify after each run" checked={false} onChange={still} />
        </div>
      </SubCard>
      <div className="wall-foot">
        <Button label="Edit" labelKey="edit" />
        <Button label="Run now" labelKey="play" tone="accent" />
      </div>
    </Card>
  );
}

// Three columns, each drifting its own way. Every column holds its cards
// twice, so the drift can wrap at half its height without a seam.
const COLUMNS: (() => ReactNode)[][] = [
  [SignIn, Storage, Toasts],
  [Settings, Fortress, Empty],
  [Files, Info, Schedule],
];

export function Wall() {
  return (
    <div className="wall" aria-hidden="true" inert data-showcase="wall">
      <div className="wall-plane">
        {COLUMNS.map((cards, c) => (
          <div className="wall-col" key={c}>
            <div className="wall-track">
              {[0, 1].map((copy) =>
                cards.map((Item, i) => (
                  <div className="wall-item" key={`${copy}-${i}`}>
                    <Item />
                  </div>
                )),
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Hero() {
  const panel = useLookPanel();
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero-text">
        <h1 id="hero-title">One quiet language for a whole family of apps</h1>
        <p className="hero-lead">
          Carbon's greys, one accent and four engines that the person using the app sets once. Every component reads the
          same tokens in React, Vue, Solid and Svelte, so one change reaches every screen.
        </p>
        <div className="hero-actions">
          <Button label="Make it yours" labelKey="look" tone="accent" size="key" onClick={() => setLookPanel(!panel)} aria-expanded={panel} />
          <Button label="Browse blocks" labelKey={null} glyph={<Glyph name="IconForward" />} size="key" href="#/blocks" />
        </div>
        <ul className="hero-frameworks" aria-label="Frameworks">
          {WEB_FRAMEWORKS.map((f) => (
            <li key={f.id}>
              <a className="hero-framework" href={`#/guide/adopting?s=${f.id}`} data-framework={f.id}>
                <FrameworkMark id={f.id} />
                {f.name}
              </a>
            </li>
          ))}
        </ul>
      </div>
      <Wall />
    </section>
  );
}
