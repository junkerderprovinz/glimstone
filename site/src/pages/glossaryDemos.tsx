import { createContext, useContext, useRef, useState, type CSSProperties, type ComponentType, type ReactNode } from "react";
import {
  Badge,
  Button,
  Card,
  Checkbox,
  ColorPicker,
  ConfirmDialog,
  ContextMenu,
  CopyField,
  DropdownListbox,
  EmptyState,
  FieldRow,
  FieldRowGroup,
  GlyphField,
  GlyphTile,
  IconButton,
  IconCheck,
  IconExpand,
  IconTipButton,
  InfoBubble,
  InfoTile,
  Kbd,
  ListRow,
  MenuBar,
  Meter,
  NumberField,
  PasswordField,
  PathField,
  Pill,
  ProgressBar,
  ReadmeButton,
  RowMark,
  Selector,
  SidebarRow,
  SignInCard,
  SubCard,
  Table,
  TextArea,
  TextField,
  ToastCard,
  Toggle,
  Tree,
  UnavailableNotice,
  Window,
  WindowBar,
  type MenuBarMenu,
  type MenuEntry,
  type TreeNode,
} from "@glimstone/react";
import { Combobox } from "@glimstone/react/Combobox";
import { Select } from "@glimstone/react/Select";
import { Slider } from "@glimstone/react/Slider";
import { COFFEE_BUTTON_SVG, GLIMSTONE_VERSION, MAIL_SVG, MANUAL_SVG, type SignInText } from "@glimstone/core";
import logo from "../../../.github/assets/logo.svg?url";
import { Glyph } from "../glyph";

export type Lang = "en" | "de";
export const LangContext = createContext<Lang>("en");

/** Picks the words for the page's language. */
export function useT() {
  const lang = useContext(LangContext);
  return (en: string, de: string) => (lang === "de" ? de : en);
}

const nothing = () => {};
const row: CSSProperties = { display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" };
const column: CSSProperties = { display: "grid", gap: 12, width: "100%" };
const quiet: CSSProperties = { color: "var(--carbon-text-sub)" };

function Markup({ svg }: { svg: string }) {
  return <span style={{ display: "contents" }} dangerouslySetInnerHTML={{ __html: svg }} />;
}

/** A window drawn in place with the classes Window uses, since Window itself opens over the page. */
export function WindowInPlace({
  title,
  start,
  children,
  foot,
  wide,
}: {
  title: string;
  start?: ReactNode;
  children: ReactNode;
  foot?: ReactNode;
  wide?: boolean;
}) {
  return (
    <div role="group" aria-label={title} className={`glim-modal-card glim-window gl-in-place${wide ? " gl-in-place--wide" : ""}`}>
      <h2 className="glim-window-title">
        <Badge tone="heading" size="heading" wrap insetStart={5}>
          {title}
        </Badge>
      </h2>
      <div className="glim-modal-body glim-window-body">{children}</div>
      {(foot || start) && (
        <div className="glim-modal-foot">
          {start !== undefined && <span className="glim-window-start">{start}</span>}
          {foot}
        </div>
      )}
    </div>
  );
}

/**
 * A sub-card with its section badge in the notch on its top edge, as a card
 * draws it. SubCard's own `title` is a small uppercase label.
 */
export function NotchedSubCard({ title, end, children }: { title: string; end?: ReactNode; children: ReactNode }) {
  return (
    <div className="gl-sub-notched">
      <SubCard>
        <h3 className="glim-panel-heading">
          <Badge tone="heading" size="heading" wrap>
            {title}
          </Badge>
        </h3>
        {end && <div className="gl-sub-end">{end}</div>}
        {children}
      </SubCard>
    </div>
  );
}

function CardDemo() {
  const t = useT();
  const [nightly, setNightly] = useState(true);
  return (
    <div style={{ width: "100%", maxWidth: 420 }}>
      <Card title={t("Schedule", "Zeitplan")} hint={t("When the export runs by itself.", "Wann der Export von selbst läuft.")}>
        <div style={{ display: "grid", gap: 16 }}>
          <Toggle label={t("Export every night", "Jede Nacht exportieren")} checked={nightly} onChange={setNightly} />
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <Button label={t("Export now", "Jetzt exportieren")} labelKey={null} glyph={<Glyph name="IconUpload" />} tone="accent" />
          </div>
        </div>
      </Card>
    </div>
  );
}

function SubCardDemo() {
  const t = useT();
  const [days, setDays] = useState<number | "">(14);
  return (
    <div style={{ width: "100%", maxWidth: 440 }}>
      <Card title={t("Snapshots", "Schnappschüsse")}>
        <NotchedSubCard title={t("Retention", "Aufbewahrung")}>
          <FieldRow label={t("Days to keep", "Tage behalten")}>
            <NumberField min={1} max={365} value={days} onChange={(e) => setDays(e.target.value === "" ? "" : e.target.valueAsNumber)} />
          </FieldRow>
        </NotchedSubCard>
        <SubCard>
          <TextField label={t("Note", "Notiz")} placeholder={t("A sub-card may stand without a heading", "Eine Sub-Card darf ohne Überschrift stehen")} />
        </SubCard>
      </Card>
    </div>
  );
}

function WellDemo() {
  const t = useT();
  return (
    <div style={{ ...column, maxWidth: 360 }}>
      <div className="glim-well" style={{ display: "flex", alignItems: "center", gap: 6, padding: 12, flexWrap: "wrap" }}>
        <Pill className="glim-num">2.4 GB</Pill>
        <Badge tone="ok" size="small">
          {t("Done", "Fertig")}
        </Badge>
      </div>
      <div className="glim-well" style={{ display: "grid", gap: 8, padding: 12 }}>
        <TextField label={t("A name in a well", "Name in einer Mulde")} placeholder={t("A name in a well", "Name in einer Mulde")} />
      </div>
    </div>
  );
}

function EmptyDemo() {
  const t = useT();
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(14rem, 1fr))", gap: 16, width: "100%" }}>
      <EmptyState
        glyph={<Glyph name="IconArchive" />}
        title={t("No export yet", "Noch kein Export")}
        hint={t("Pick what to export, and the first one runs tonight.", "Wähl aus, was exportiert wird, dann läuft heute Nacht der erste.")}
        action={<Button label={t("Add an export", "Export anlegen")} labelKey="add" />}
      />
      <EmptyState
        glyph={<Glyph name="IconFilter" />}
        title={t("Nothing matches the filter", "Kein Treffer für den Filter")}
        action={<Button label={t("Clear the filter", "Filter leeren")} labelKey={null} glyph={<Glyph name="IconClose" />} />}
      />
    </div>
  );
}

function SectionBadgeDemo() {
  const t = useT();
  const [on, setOn] = useState(true);
  return (
    <div style={{ ...column, gap: 40, maxWidth: 440 }}>
      <Card title={t("Destinations", "Speicherorte")} hint={t("Where the exports are written.", "Wohin die Exporte geschrieben werden.")}>
        <NotchedSubCard title={t("Target", "Ziel")}>
          <Toggle label={t("Keep a second copy", "Zweite Kopie behalten")} checked={on} onChange={setOn} />
        </NotchedSubCard>
      </Card>
      <WindowInPlace
        title={t("Choose a folder", "Ordner wählen")}
        foot={
          <>
            <Button label={t("Cancel", "Abbrechen")} labelKey="cancel" />
            <Button label={t("Choose", "Wählen")} labelKey={null} glyph={<Glyph name="IconCheck" />} tone="accent" />
          </>
        }
      >
        <p style={{ margin: 0, ...quiet }}>{t("Card, sub-card and window carry their section badge in the notch.", "Karte, Sub-Card und Fenster tragen ihr AB in der Kerbe.")}</p>
      </WindowInPlace>
      <Card
        drawn={
          <>
            {t("Jobs", "Aufträge")} <span className="glim-num">12</span>
          </>
        }
      >
        <span style={quiet}>{t("With drawn the badge carries markup of its own, such as a count.", "Mit drawn trägt das AB eigenes Markup, etwa eine Zahl.")}</span>
      </Card>
    </div>
  );
}

function EyebrowDemo() {
  const t = useT();
  return (
    <div style={{ display: "grid", gap: 4 }}>
      <span className="glim-eyebrow">{t("Highest today", "Höchster Wert heute")}</span>
      <span className="glim-num" style={{ fontSize: 20, fontWeight: 600 }}>
        84 MB/s
      </span>
    </div>
  );
}

function BadgeDemo() {
  const t = useT();
  const [n, setN] = useState(0);
  return (
    <div style={row}>
      <Badge>{t("Draft", "Entwurf")}</Badge>
      <Badge tone="muted">{t("Archived", "Archiviert")}</Badge>
      <Badge as="button" tone="neutral" onClick={() => setN(n + 1)}>
        {t("Filter", "Filter")} <span className="glim-num">{n}</span>
      </Badge>
      <Badge as="a" href="#/guide/glossary?s=gl-badge" tone="neutral">
        {t("Release page", "Release-Seite")}
      </Badge>
    </div>
  );
}

function StateBadgeDemo() {
  const t = useT();
  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div style={row}>
        <Badge tone="ok">{t("Done", "Fertig")}</Badge>
        <Badge tone="warn">{t("Partial", "Teilweise")}</Badge>
        <Badge tone="fail">{t("Error", "Fehler")}</Badge>
        <Badge tone="neutral">{t("Unknown", "Unbekannt")}</Badge>
      </div>
      <div style={{ ...row, gap: 6 }}>
        <Badge size="icon" tone="ok" ariaLabel={t("Protected", "Geschützt")}>
          <Glyph name="IconShieldOn" />
        </Badge>
        <Badge tone="active">reports</Badge>
        <span style={{ ...quiet, marginInlineStart: 8, fontSize: 12 }}>{t("The state before the name", "Zustand vor dem Namen")}</span>
      </div>
    </div>
  );
}

const FORMS = [
  { en: "Rounded", de: "Abgerundet", radius: "0.3125rem", note: { en: "the shape engine's soft", de: "Formengine Abgerundet" } },
  { en: "Square", de: "Eckig", radius: "0", note: { en: "the shape engine's square", de: "Formengine Eckig" } },
  { en: "Pill", de: "Pille", radius: "9999px", note: { en: "badges only, never a control", de: "nur Badges, nie ein Bedienelement" } },
  { en: "Circle", de: "Kreis", radius: "9999px", circle: true, note: { en: "a glyph alone", de: "nur Glyphe" } },
];

function FormsDemo() {
  const t = useT();
  return (
    <div className="gl-forms">
      {FORMS.map((f) => (
        <figure key={f.en} className="gl-form" style={{ "--radius-pill": f.radius } as CSSProperties}>
          {f.circle ? (
            <Badge size="icon" shape="circle" tone="active" ariaLabel={t("Running", "Läuft")}>
              <Glyph name="IconPlay" />
            </Badge>
          ) : (
            <Badge tone="heading" size="heading" inFlow>
              Badge
            </Badge>
          )}
          <figcaption>
            <strong>{t(f.en, f.de)}</strong>
            <span>{t(f.note.en, f.note.de)}</span>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}

function SizeDemo() {
  const t = useT();
  return (
    <div style={row}>
      <Badge size="small" tone="active">
        {t("small", "klein")}
      </Badge>
      <Badge size="medium" tone="active">
        {t("medium", "mittel")}
      </Badge>
      <Badge size="large" tone="active">
        {t("large", "groß")}
      </Badge>
      <Badge size="icon" tone="neutral" ariaLabel={t("Folder", "Ordner")}>
        <Glyph name="IconFolder" />
      </Badge>
    </div>
  );
}

function ValueDemo() {
  const t = useT();
  return (
    <div style={{ display: "grid", gap: 8, width: "100%", maxWidth: 420 }}>
      <FieldRow label={t("Last run", "Letzter Lauf")} value={t("2 hours ago", "vor 2 Stunden")} />
      <FieldRow label={t("Size", "Größe")} value="4.2 GB" />
      <div style={{ ...row, gap: 6, paddingTop: 8 }}>
        <Pill className="glim-num">880 MB</Pill>
        <Pill tone="state">{t("Running", "Läuft")}</Pill>
      </div>
    </div>
  );
}

function ButtonDemo() {
  const t = useT();
  return (
    <div style={row}>
      <Button label={t("Save", "Speichern")} labelKey="save" tone="accent" />
      <Button label={t("Refresh", "Aktualisieren")} labelKey="refresh" tone="neutral" />
      <Button label={t("Copy", "Kopieren")} labelKey="copy" tone="subtle" />
      <Button label={t("Restore", "Wiederherstellen")} labelKey="restore" tone="ok" />
      <Button label={t("Delete", "Löschen")} labelKey="delete" tone="danger" />
      <Button label={t("Upload", "Hochladen")} labelKey="upload" tone="warn" />
    </div>
  );
}

function KeyButtonDemo() {
  const t = useT();
  return (
    <div style={row}>
      <Button label={t("Add an export", "Export anlegen")} labelKey="add" tone="accent" size="key" />
      <Button label={t("Cancel", "Abbrechen")} labelKey="cancel" />
    </div>
  );
}

function CompactDemo() {
  const t = useT();
  return (
    <div style={row}>
      <Button
        label={t("Jobs", "Aufträge")}
        labelKey={null}
        glyph={<Glyph name="IconQueued" />}
        compact
        after={
          <span data-count className="glim-num">
            12
          </span>
        }
      />
      <Button label={t("Search", "Suchen")} labelKey="search" compact />
      <Button label={t("Settings", "Einstellungen")} labelKey="settings" compact />
    </div>
  );
}

function ChipButtonDemo() {
  const t = useT();
  const all = ["/srv/media", "/srv/archive"];
  const [paths, setPaths] = useState(all);
  return (
    <div style={row}>
      {paths.map((p) => (
        <Pill key={p}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
            {p}
            <Button variant="chip" label={t(`Remove ${p}`, `${p} entfernen`)} labelKey={null} glyph={<Glyph name="IconClose" />} onClick={() => setPaths(paths.filter((x) => x !== p))} />
          </span>
        </Pill>
      ))}
      {paths.length === 0 && <Button label={t("Bring them back", "Zurückholen")} labelKey={null} tone="subtle" onClick={() => setPaths(all)} />}
    </div>
  );
}

function IconButtonDemo() {
  const t = useT();
  const [pinned, setPinned] = useState(true);
  return (
    <div style={{ display: "flex", gap: 2 }}>
      <IconButton tip={t("Copy the path", "Pfad kopieren")} glyph={<Glyph name="IconCopy" />} />
      <IconButton tip={t("Move up", "Nach oben")} glyph={<Glyph name="IconMoveUp" />} absent />
      <IconButton tip={t("Delete", "Löschen")} glyph={<Glyph name="IconTrash" />} disabled />
      <IconButton tip={t("Pin", "Anheften")} glyph={<Glyph name="IconPin" />} pressed={pinned} onClick={() => setPinned(!pinned)} />
      <IconButton tip={t("Open the manual", "Handbuch öffnen")} glyph={<Glyph name="IconBook" />} href="#/guide/glossary?s=gl-icon-button" />
    </div>
  );
}

function TipButtonDemo() {
  const t = useT();
  return (
    <div style={{ display: "flex", gap: 4 }}>
      <IconTipButton tip={t("Move up", "Nach oben")} className="gl-own-row-btn">
        <Glyph name="IconMoveUp" />
      </IconTipButton>
      <IconTipButton tip={t("Move down", "Nach unten")} className="gl-own-row-btn">
        <Glyph name="IconMoveDown" />
      </IconTipButton>
      <IconTipButton tip={t("Pin to the top", "Oben anheften")} className="gl-own-row-btn" ariaPressed={false}>
        <Glyph name="IconPin" />
      </IconTipButton>
    </div>
  );
}

function ReadmeDemo() {
  const t = useT();
  return (
    <div style={row}>
      <ReadmeButton brand="docs" mark={<Markup svg={MANUAL_SVG} />} markClass="glim-docs-mark" parts={[{ name: t("Manual", "Handbuch"), sub: t("Open", "Öffnen"), href: "#/guide/glossary?s=gl-readme-button" }]} />
      <ReadmeButton brand="github" mark={<Glyph name="IconGithub" size={20} />} markClass="glim-github-mark" parts={[{ name: "GitHub", sub: t("Source", "Quellcode"), href: "#/guide/glossary?s=gl-readme-button" }]} />
    </div>
  );
}

function WellSelectorDemo() {
  const t = useT();
  const [v, setV] = useState("dark");
  return (
    <Selector
      label={t("Theme", "Design")}
      items={[
        { id: "light", label: t("Light", "Hell"), glyph: <Glyph name="IconSun" /> },
        { id: "dark", label: t("Dark", "Dunkel"), glyph: <Glyph name="IconMoon" /> },
        { id: "system", label: "System", glyph: <Glyph name="IconThemeSystem" /> },
      ]}
      value={v}
      onChange={setV}
      activation="manual"
      equalWidth
    />
  );
}

function ChipSelectorDemo() {
  const t = useT();
  const [v, setV] = useState(["running", "paused"]);
  return (
    <Selector
      label={t("Show", "Zeigen")}
      select="many"
      variant="chip"
      inline
      items={[
        { id: "running", label: t("Running", "Läuft") },
        { id: "stopped", label: t("Stopped", "Gestoppt") },
        { id: "paused", label: t("Paused", "Pausiert") },
        { id: "failed", label: t("Failed", "Fehler"), disabled: true, title: t("Nothing has failed", "Nichts ist fehlgeschlagen") },
      ]}
      value={v}
      onChange={setV}
    />
  );
}

function SmallSelectorDemo() {
  const t = useT();
  const [v, setV] = useState("even");
  return (
    <Selector
      label={t("Compression", "Komprimierung")}
      size="sm"
      inline
      activation="manual"
      items={[
        { id: "fast", label: t("Fast", "Schnell") },
        { id: "even", label: t("Balanced", "Ausgewogen") },
        { id: "small", label: t("Small", "Klein") },
      ]}
      value={v}
      onChange={setV}
    />
  );
}

function ManySelectorDemo() {
  const t = useT();
  const days = t("Mo Tu We Th Fr Sa Su", "Mo Di Mi Do Fr Sa So").split(" ");
  const [v, setV] = useState(["0", "2", "4"]);
  return (
    <Selector label={t("Weekdays", "Wochentage")} select="many" size="sm" inline items={days.map((d, i) => ({ id: String(i), label: d }))} value={v} onChange={setV} />
  );
}

function TabsDemo() {
  const t = useT();
  const [v, setV] = useState("general");
  const tabs = [
    { id: "general", label: t("General", "Allgemein"), glyph: <Glyph name="IconTabGeneral" /> },
    { id: "look", label: t("Look", "Aussehen"), glyph: <Glyph name="IconTabLook" /> },
    { id: "storage", label: t("Storage", "Speicher"), glyph: <Glyph name="IconTabStorage" /> },
    { id: "info", label: "Info", glyph: <Glyph name="IconInfo" /> },
  ];
  return (
    <div style={column}>
      <Selector label={t("Settings pages", "Einstellungsseiten")} size="lg" variant="chip" hueOffset={0} panelId="gl-tabs" items={tabs} value={v} onChange={setV} />
      <div role="tabpanel" id="gl-tabs" aria-labelledby={`gl-tabs-tab-${v}`} style={quiet}>
        {t(`The ${tabs.find((x) => x.id === v)!.label} page.`, `Die Seite ${tabs.find((x) => x.id === v)!.label}.`)}
      </div>
    </div>
  );
}

function TilesDemo() {
  const t = useT();
  const [v, setV] = useState("general");
  return (
    <div style={{ display: "flex", gap: 16, height: 260, width: "100%" }}>
      <Selector
        label={t("Settings pages", "Einstellungsseiten")}
        orientation="vertical"
        items={[
          { id: "general", label: t("General", "Allgemein"), glyph: <Glyph name="IconTabGeneral" />, href: "#/guide/glossary?s=gl-tiles" },
          { id: "look", label: t("Look", "Aussehen"), glyph: <Glyph name="IconTabLook" />, href: "#/guide/glossary?s=gl-tiles" },
          { id: "storage", label: t("Destinations", "Speicherorte"), glyph: <Glyph name="IconTabStorage" />, href: "#/guide/glossary?s=gl-tiles" },
          { id: "security", label: t("Security", "Sicherheit"), glyph: <Glyph name="IconTabSecurity" />, href: "#/guide/glossary?s=gl-tiles" },
          { id: "app", label: "App", glyph: <Glyph name="IconTabApp" />, href: "#/guide/glossary?s=gl-tiles", dim: true },
        ]}
        value={v}
        onChange={setV}
      />
    </div>
  );
}

export const PAGE_RANGES = [
  { id: "all", en: "All pages", de: "Alle Seiten" },
  { id: "current", en: "This page", de: "Diese Seite" },
  { id: "picked", en: "Picked pages", de: "Gewählte Seiten" },
];

function RowTilesDemo() {
  const t = useT();
  const [v, setV] = useState("all");
  return (
    <div style={{ width: "100%", maxWidth: 320 }}>
      <Selector
        label={t("Pages", "Seiten")}
        orientation="vertical"
        className="gl-row-tiles"
        items={PAGE_RANGES.map((r) => ({ id: r.id, label: t(r.en, r.de) }))}
        value={v}
        onChange={setV}
      />
    </div>
  );
}

function useKeep() {
  const t = useT();
  return [
    { value: "week", label: t("One week", "Eine Woche") },
    { value: "month", label: t("One month", "Ein Monat") },
    { value: "year", label: t("One year", "Ein Jahr") },
  ];
}

function SelectDemo() {
  const t = useT();
  const keep = useKeep();
  const [v, setV] = useState("month");
  const [to, setTo] = useState("local");
  return (
    <div style={{ ...column, maxWidth: 280 }}>
      <Select label={t("Keep", "Behalten")} options={keep} value={v} onChange={setV} />
      <Select
        label={t("Save to", "Speichern auf")}
        value={to}
        onChange={setTo}
        options={[
          { value: "local", label: t("This server", "Diesem Server"), glyph: <Glyph name="IconFolder" /> },
          { value: "cloud", label: t("Cloud storage", "Cloud-Speicher"), glyph: <Glyph name="IconCloud" /> },
        ]}
      />
    </div>
  );
}

function MenuRowsSelectDemo() {
  const t = useT();
  const [v, setV] = useState("name");
  return (
    <div style={{ width: "100%", maxWidth: 280 }}>
      <Select
        label={t("Sort by", "Sortieren nach")}
        rows="menu"
        options={[
          { value: "name", label: "Name" },
          { value: "size", label: t("Size", "Größe") },
          { value: "date", label: t("Modified", "Geändert") },
        ]}
        value={v}
        onChange={setV}
      />
    </div>
  );
}

const CITIES = ["Amsterdam", "Athens", "Berlin", "Bern", "Brussels", "Copenhagen", "Dublin", "Helsinki", "Lisbon", "Ljubljana", "Madrid", "Oslo", "Paris", "Prague", "Rome", "Vienna", "Warsaw"].map((c) => ({ value: c, label: c }));

function ComboboxDemo() {
  const t = useT();
  const [v, setV] = useState("");
  return (
    <div style={{ width: "100%", maxWidth: 280 }}>
      <Combobox label={t("City", "Stadt")} options={CITIES} value={v} onChange={setV} placeholder={t("Type to filter", "Zum Filtern tippen")} empty={t("No city matches.", "Keine Stadt passt.")} toggleLabel={t("Show all cities", "Alle Städte zeigen")} />
    </div>
  );
}

function SliderDemo() {
  const t = useT();
  const [v, setV] = useState(30);
  return (
    <div style={{ width: "100%", maxWidth: 352 }}>
      <Slider label={t("Keep exports for", "Exporte behalten")} value={v} onChange={setV} min={1} max={365} format={(d) => (d === 1 ? t("1 day", "1 Tag") : t(`${d} days`, `${d} Tage`))} />
    </div>
  );
}

function ColorPickerDemo() {
  const t = useT();
  const [hex, setHex] = useState("#1d99f3");
  return <ColorPicker value={hex} onApply={setHex} text={{ area: t("Saturation and brightness", "Sättigung und Helligkeit"), hue: t("Hue", "Farbton"), hex: "Hex", apply: t("Apply", "Übernehmen") }} />;
}

const ZONES = ["Europe/Vienna", "Europe/Berlin", "America/New_York", "Asia/Tokyo", "UTC"];

function ListboxDemo() {
  const t = useT();
  const [open, setOpen] = useState(false);
  const [zone, setZone] = useState(ZONES[0]!);
  const trigger = useRef<HTMLButtonElement>(null);
  return (
    <>
      <button ref={trigger} type="button" className="glim-input gl-listbox-trigger" aria-haspopup="listbox" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        {zone}
      </button>
      <DropdownListbox open={open} onClose={() => setOpen(false)} triggerRef={trigger} label={t("Time zone", "Zeitzone")}>
        {ZONES.map((z) => (
          <button
            key={z}
            type="button"
            role="option"
            aria-selected={z === zone}
            className="gl-listbox-option"
            onClick={() => {
              setZone(z);
              setOpen(false);
            }}
          >
            {z}
          </button>
        ))}
      </DropdownListbox>
    </>
  );
}

function TextFieldDemo() {
  const t = useT();
  return (
    <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap: 8, justifyItems: "start", width: "100%", maxWidth: 400 }}>
      <TextField label={t("Name of the job", "Name des Auftrags")} width="wide" defaultValue="weekly-export" />
      <TextField label={t("Group", "Gruppe")} width="medium" placeholder={t("None", "Keine")} />
      <TextField label="Port" width="short" mono defaultValue="8080" />
    </div>
  );
}

function TextAreaDemo() {
  const t = useT();
  return (
    <div style={{ width: "100%", maxWidth: 400 }}>
      <TextArea label={t("Notes", "Notizen")} rows={3} placeholder={t("What this job is for", "Wofür dieser Auftrag da ist")} />
    </div>
  );
}

function PasswordDemo() {
  const t = useT();
  return (
    <div style={{ width: "100%", maxWidth: 320 }}>
      <PasswordField aria-label={t("Password", "Passwort")} defaultValue="correct horse" text={{ show: t("Show", "Zeigen"), hide: t("Hide", "Verbergen") }} />
    </div>
  );
}

function NumberDemo() {
  const t = useT();
  const [v, setV] = useState<number | "">(7);
  return <NumberField aria-label={t("Snapshots to keep", "Schnappschüsse behalten")} min={1} max={30} value={v} onChange={(e) => setV(e.target.value === "" ? "" : e.target.valueAsNumber)} />;
}

function CopyDemo() {
  const t = useT();
  return (
    <div style={{ width: "100%", maxWidth: 360 }}>
      <CopyField label={t("Share", "Freigabe")} value="smb://server/media" text={{ copy: t("Copy", "Kopieren"), copied: t("Copied", "Kopiert") }} />
    </div>
  );
}

function PathDemo() {
  const t = useT();
  const [path, setPath] = useState("/srv/media");
  return (
    <div style={{ width: "100%", maxWidth: 480 }}>
      <PathField label={t("Target", "Ziel")} value={path} onChange={setPath} pick={() => null} text={{ pick: t("Choose a folder", "Ordner wählen") }} />
    </div>
  );
}

function GlyphFieldDemo() {
  const t = useT();
  const [q, setQ] = useState("");
  return (
    <div style={{ width: "100%", maxWidth: 360 }}>
      <GlyphField
        label="Filter"
        glyph={<Glyph name="IconSearch" />}
        placeholder={t("Filter this folder", "Diesen Ordner filtern")}
        value={q}
        onChange={(e) => setQ(e.target.value)}
        after={<IconButton tip={t("Clear", "Leeren")} glyph={<Glyph name="IconClose" />} onClick={() => setQ("")} />}
      />
    </div>
  );
}

function ToggleDemo() {
  const t = useT();
  const [a, setA] = useState(true);
  const [b, setB] = useState(false);
  return (
    <div style={{ display: "grid", gap: 14 }}>
      <Toggle label={t("Quiet notifications", "Leise Benachrichtigungen")} checked={a} onChange={setA} />
      <Toggle label={t("Play a sound", "Einen Ton spielen")} checked={b} onChange={setB} disabled={!a} />
      <Toggle label="OLED" checked onChange={nothing} refused={t("OLED only works while Dark is showing.", "OLED wirkt nur, solange Dunkel zu sehen ist.")} />
    </div>
  );
}

function CheckboxDemo() {
  const t = useT();
  const [again, setAgain] = useState(true);
  const [files, setFiles] = useState(new Set(["thumbs.db"]));
  return (
    <div style={{ display: "grid", gap: 10 }}>
      <Checkbox label={t("Do not show again", "Nicht mehr zeigen")} checked={again} onChange={setAgain} />
      <Checkbox label={t("Name, always shown", "Name, immer gezeigt")} checked disabled onChange={nothing} />
      {["thumbs.db", "desktop.ini"].map((n) => (
        <span key={n} className="gl-dense-row">
          <Checkbox
            slim
            label={n}
            checked={files.has(n)}
            onChange={(on) => {
              const next = new Set(files);
              if (on) next.add(n);
              else next.delete(n);
              setFiles(next);
            }}
          />
          {n}
        </span>
      ))}
    </div>
  );
}

function RowMarkDemo() {
  const t = useT();
  const [picked, setPicked] = useState(new Set(["holiday.mkv"]));
  return (
    <div role="listbox" aria-multiselectable="true" aria-label={t("Files", "Dateien")} style={{ display: "grid", gap: 2, width: "100%", maxWidth: 280 }}>
      {["holiday.mkv", "notes.txt", "export.tar"].map((n) => (
        <div
          key={n}
          role="option"
          tabIndex={0}
          aria-selected={picked.has(n)}
          className="gl-dense-row"
          onClick={() => {
            const next = new Set(picked);
            if (!next.delete(n)) next.add(n);
            setPicked(next);
          }}
        >
          <RowMark on={picked.has(n)} />
          {n}
        </div>
      ))}
    </div>
  );
}

function FieldRowDemo() {
  const t = useT();
  const keep = useKeep();
  const [notify, setNotify] = useState(true);
  const [level, setLevel] = useState("even");
  const [v, setV] = useState("month");
  return (
    <div style={{ display: "grid", gap: 8, width: "100%", maxWidth: 560 }}>
      <FieldRow label="Name" hint={t("Shown in the list of jobs.", "Steht in der Liste der Aufträge.")}>
        <TextField width="medium" defaultValue="weekly-export" />
      </FieldRow>
      <FieldRow label={t("Notify", "Benachrichtigen")}>
        <Toggle checked={notify} onChange={setNotify} />
      </FieldRow>
      <FieldRow label={t("Compression", "Komprimierung")}>
        <Selector
          items={[
            { id: "fast", label: t("Fast", "Schnell") },
            { id: "even", label: t("Balanced", "Ausgewogen") },
            { id: "small", label: t("Small", "Klein") },
          ]}
          value={level}
          onChange={setLevel}
          activation="manual"
          size="sm"
          buttonHeight
        />
      </FieldRow>
      <FieldRow label={t("Keep", "Behalten")}>
        <Select options={keep} value={v} onChange={setV} />
      </FieldRow>
      <FieldRow label={t("Last run", "Letzter Lauf")} value={t("2 hours ago", "vor 2 Stunden")} />
    </div>
  );
}

function FieldRowGroupDemo() {
  const t = useT();
  const [notify, setNotify] = useState(true);
  return (
    <div style={{ width: "100%", maxWidth: 480 }}>
      <FieldRowGroup>
        <FieldRow label={t("Find", "Suchen")}>
          <TextField width="grow" defaultValue={t("report", "bericht")} />
        </FieldRow>
        <FieldRow label={t("Replace with", "Ersetzen durch")}>
          <TextField width="grow" defaultValue={t("summary", "zusammenfassung")} />
        </FieldRow>
        <FieldRow label={t("Notify", "Benachrichtigen")}>
          <Toggle checked={notify} onChange={setNotify} />
        </FieldRow>
      </FieldRowGroup>
    </div>
  );
}

function ListRowDemo() {
  const t = useT();
  const buttons = (
    <>
      <IconButton tip={t("Edit", "Bearbeiten")} glyph={<Glyph name="IconPencil" />} />
      <IconButton tip={t("Delete", "Löschen")} glyph={<Glyph name="IconTrash" />} />
    </>
  );
  return (
    <div style={{ display: "grid", gap: 2, width: "100%", maxWidth: 560 }}>
      <ListRow
        name="nightly-export"
        tip={t("Runs at three in the morning.", "Läuft um drei Uhr früh.")}
        onClick={nothing}
        tile={<Glyph name="IconFolder" />}
        badges={
          <>
            <Pill className="glim-num">2.4 GB</Pill>
            <Badge tone="ok" size="small">
              {t("Done", "Fertig")}
            </Badge>
          </>
        }
        actions={buttons}
      />
      <ListRow name="archive-copy" tile={<Glyph name="IconCloud" />} badges={<Pill className="glim-num">880 MB</Pill>} actions={buttons} />
    </div>
  );
}

function GlyphTileDemo() {
  const folder = <Glyph name="IconFolder" />;
  return (
    <div style={row}>
      <GlyphTile glyph={folder} />
      <GlyphTile glyph={<Glyph name="IconFile" />} quiet />
      <GlyphTile glyph={folder} ground />
      <GlyphTile glyph={folder} active />
    </div>
  );
}

const FOLDERS: Record<string, { name: string; kids: boolean }[]> = {
  "": [
    { name: "srv", kids: true },
    { name: "boot", kids: false },
  ],
  "/srv": [
    { name: "media", kids: true },
    { name: "archive", kids: false },
  ],
  "/srv/media": [
    { name: "music", kids: false },
    { name: "photos", kids: false },
  ],
};

async function loadFolders(id: string | null): Promise<TreeNode[]> {
  return (FOLDERS[id ?? ""] ?? []).map((f) => ({
    id: `${id ?? ""}/${f.name}`,
    label: f.name,
    hasChildren: f.kids,
    glyph: <Glyph name="IconFolder" />,
    openGlyph: <Glyph name="IconFolderOpen" />,
  }));
}

function TreeDemo() {
  const t = useT();
  const [chosen, setChosen] = useState<string | null>("/srv/media");
  return (
    <div className="glim-well" style={{ padding: 8, width: "100%", maxWidth: 300 }}>
      <Tree label={t("Folders", "Ordner")} load={loadFolders} defaultOpen={["/srv", "/srv/media"]} value={chosen} onChange={setChosen} />
    </div>
  );
}

function TableDemo() {
  const t = useT();
  return (
    <div style={{ width: "100%", maxWidth: 360 }}>
      <Table
        label={t("Largest files", "Größte Dateien")}
        columns={[
          { key: "name", label: "Name" },
          { key: "size", label: t("Size", "Größe"), end: true },
        ]}
        rows={[
          { name: "holiday.mkv", size: "2.4 GB" },
          { name: "notes.txt", size: "12 KB" },
        ]}
        more={t("And 3 more", "Und 3 weitere")}
        cell={(r, c) =>
          c.key === "name" ? (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <GlyphTile glyph={<Glyph name="IconFile" />} quiet />
              {r.name}
            </span>
          ) : undefined
        }
      />
    </div>
  );
}

function MoveModeDemo() {
  const t = useT();
  return (
    <div className="glim-move-mode glim-drag-rows gl-move-rows" role="list" aria-label={t("Queue", "Warteschlange")}>
      {["debian-13.iso", "podcast-212.mp3", "photos-2026.zip"].map((n) => (
        <div key={n} role="listitem" className="glim-well gl-move-row">
          <Glyph name="IconGrip" />
          {n}
        </div>
      ))}
    </div>
  );
}

function OpenRealWindow() {
  const t = useT();
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button label={t("Open the real window", "Echtes Fenster öffnen")} labelKey={null} glyph={<Glyph name="IconExternalLink" />} tone="subtle" onClick={() => setOpen(true)} />
      {open && (
        <Window
          title={t("Choose a folder", "Ordner wählen")}
          text={{ cancel: t("Cancel", "Abbrechen"), close: t("Close", "Schließen") }}
          start={t("3 folders", "3 Ordner")}
          actions={[{ label: t("Choose", "Wählen"), labelKey: null, glyph: <Glyph name="IconCheck" />, primary: true }]}
          onClose={() => setOpen(false)}
        >
          <p style={{ margin: 0 }}>{t("This is the Window component itself, with Escape, a focus trap and the focus handed back.", "Das ist das Bauteil Window selbst, mit Escape, Fokusfalle und Rückgabe des Fokus.")}</p>
        </Window>
      )}
    </>
  );
}

function WindowDemo() {
  const t = useT();
  return (
    <div style={{ ...column, justifyItems: "start" }}>
      <WindowInPlace
        title={t("Choose a folder", "Ordner wählen")}
        foot={
          <>
            <Button label={t("Cancel", "Abbrechen")} labelKey="cancel" />
            <Button label={t("Choose", "Wählen")} labelKey={null} glyph={<Glyph name="IconCheck" />} tone="accent" />
          </>
        }
      >
        <p style={{ margin: 0 }}>{t("Section badge in the notch, content in the middle, buttons at the bottom.", "AB in der Kerbe, Inhalt in der Mitte, Knopfzeile unten.")}</p>
      </WindowInPlace>
      <OpenRealWindow />
    </div>
  );
}

function FootDemo() {
  const t = useT();
  return (
    <WindowInPlace
      title={t("Compare two folders", "Zwei Ordner vergleichen")}
      wide
      start={t("12 differences", "12 Unterschiede")}
      foot={
        <>
          <Button label={t("Close", "Schließen")} labelKey="cancel" />
          <Button label={t("Left to right", "Links nach rechts")} labelKey={null} glyph={<Glyph name="IconApply" />} />
          <Button label={t("Match", "Angleichen")} labelKey={null} glyph={<Glyph name="IconApply" />} tone="accent" />
        </>
      }
    >
      <p style={{ margin: 0 }}>{t("Both sides have just been read.", "Beide Seiten sind gerade gelesen.")}</p>
    </WindowInPlace>
  );
}

function AlsoFiles() {
  const t = useT();
  const [on, setOn] = useState(false);
  return <Toggle label={t("Also delete the files at the target", "Auch die Dateien am Ziel löschen")} checked={on} onChange={setOn} />;
}

function ConfirmDemo() {
  const t = useT();
  return (
    <div className="gl-contained" style={{ height: 340 }}>
      <ConfirmDialog
        title={t("Confirm", "Bestätigen")}
        message={t("Delete the snapshot of 14 October? The archive at the target stays.", "Den Schnappschuss vom 14. Oktober löschen? Das Archiv am Ziel bleibt.")}
        confirmLabel={t("Delete", "Löschen")}
        confirmLabelKey="delete"
        cancelLabel={t("Cancel", "Abbrechen")}
        closeLabel={t("Close", "Schließen")}
        extra={<AlsoFiles />}
        onConfirm={nothing}
        onCancel={nothing}
      />
    </div>
  );
}

function WindowBarDemo() {
  const t = useT();
  const [max, setMax] = useState(false);
  return (
    <div className="gl-contained gl-bar-stage">
      <WindowBar
        appName={t("Example", "Beispiel")}
        maximised={max}
        text={{ minimise: t("Minimise", "Minimieren"), maximise: t("Maximise", "Maximieren"), restore: t("Restore", "Wiederherstellen"), close: t("Close", "Schließen") }}
        onMinimise={nothing}
        onToggleMaximise={() => setMax(!max)}
        onClose={nothing}
        onDragStart={nothing}
      />
      <p style={{ margin: 0, padding: "1rem 1.25rem", ...quiet }}>{t("The app's page starts here.", "Hier beginnt die Seite der App.")}</p>
    </div>
  );
}

/** A menu row as ContextMenu draws it, held in place instead of at the pointer. */
function MenuRow({ glyph, label, end, current }: { glyph?: ReactNode; label: string; end?: ReactNode; current?: boolean }) {
  return (
    <button type="button" role="menuitem" tabIndex={-1} className={current ? "glim-menu-item glim-menu-item--current" : "glim-menu-item"}>
      <span className="glim-menu-glyph" aria-hidden="true">
        {glyph}
      </span>
      <span className="glim-menu-label">{label}</span>
      {end}
    </button>
  );
}

function MenuDemo() {
  const t = useT();
  const [at, setAt] = useState<{ x: number; y: number; opener: HTMLElement } | null>(null);
  const opener = useRef<HTMLButtonElement>(null);
  const items: MenuEntry[] = [
    { label: t("Open", "Öffnen"), glyph: <Glyph name="IconFolderOpen" />, shortcut: "Enter", onSelect: nothing },
    { label: t("Rename", "Umbenennen"), glyph: <Glyph name="IconPencil" />, shortcut: "F2", onSelect: nothing },
    "-",
    {
      label: t("Sort by", "Sortieren nach"),
      glyph: <Glyph name="IconSort" />,
      sub: [t("Name", "Name"), t("Size", "Größe"), t("Modified", "Geändert")].map((s, i) => ({ label: s, checked: i === 0, radio: true, onSelect: nothing })),
    },
    { label: t("Show hidden files", "Versteckte Dateien zeigen"), checked: false, onSelect: nothing },
  ];
  return (
    <div style={column}>
      <div className="gl-contained" style={{ height: 210 }}>
        <div role="menu" aria-label={t("File", "Datei")} className="glim-menu" style={{ left: 8, top: 8 }}>
          <MenuRow glyph={<Glyph name="IconFolderOpen" />} label={t("Open", "Öffnen")} end={<Kbd className="glim-menu-end">Enter</Kbd>} />
          <MenuRow glyph={<Glyph name="IconPencil" />} label={t("Rename", "Umbenennen")} end={<Kbd className="glim-menu-end">F2</Kbd>} />
          <div className="glim-menu-sep" role="separator" />
          <MenuRow
            glyph={<Glyph name="IconSort" />}
            label={t("Sort by", "Sortieren nach")}
            end={
              <span className="glim-menu-end glim-menu-caret" aria-hidden="true">
                <IconExpand />
              </span>
            }
          />
          <MenuRow glyph={<Glyph name="IconSelectAll" />} label={t("Pick the same kind", "Gleiche Art wählen")} end={<span className="glim-menu-end glim-menu-count glim-num">3</span>} current />
          <MenuRow
            label="Name"
            end={
              <span className="glim-menu-end glim-menu-tick" aria-hidden="true">
                <IconCheck />
              </span>
            }
          />
        </div>
      </div>
      <div>
        <Button
          ref={opener}
          label={t("Open the real menu", "Echtes Menü öffnen")}
          labelKey="more"
          tone="subtle"
          onClick={() => {
            const r = opener.current!.getBoundingClientRect();
            setAt(at ? null : { x: r.left, y: r.bottom + 6, opener: opener.current! });
          }}
        />
      </div>
      {at && <ContextMenu x={at.x} y={at.y} items={items} label={t("File", "Datei")} opener={at.opener} onClose={() => setAt(null)} />}
    </div>
  );
}

function MenuBarDemo() {
  const t = useT();
  const [layout, setLayout] = useState("details");
  const [hidden, setHidden] = useState(false);
  const menus: MenuBarMenu[] = [
    {
      label: t("File", "Datei"),
      items: [
        { label: t("New folder", "Neuer Ordner"), glyph: <Glyph name="IconFolderAdd" />, shortcut: "F7", onSelect: nothing },
        { label: t("Upload", "Hochladen"), glyph: <Glyph name="IconUpload" />, onSelect: nothing },
        "-",
        { label: t("Delete", "Löschen"), glyph: <Glyph name="IconTrash" />, shortcut: t("Del", "Entf"), onSelect: nothing },
      ],
    },
    {
      label: t("Edit", "Bearbeiten"),
      items: [
        { label: t("Copy", "Kopieren"), glyph: <Glyph name="IconCopy" />, shortcut: t("Ctrl+C", "Strg+C"), onSelect: nothing },
        { label: t("Paste", "Einfügen"), glyph: <Glyph name="IconPaste" />, shortcut: t("Ctrl+V", "Strg+V"), onSelect: nothing },
      ],
    },
    {
      label: t("View", "Ansicht"),
      items: [
        {
          label: t("Layout", "Darstellung"),
          glyph: <Glyph name="IconTabApps" />,
          sub: [
            { id: "details", label: t("Details", "Details") },
            { id: "list", label: t("List", "Liste") },
            { id: "tiles", label: t("Icons", "Symbole") },
          ].map((l) => ({ label: l.label, checked: layout === l.id, radio: true, onSelect: () => setLayout(l.id) })),
        },
        { label: t("Show hidden files", "Versteckte Dateien zeigen"), checked: hidden, onSelect: () => setHidden((h) => !h) },
      ],
    },
  ];
  return <MenuBar label={t("Menu", "Menü")} menus={menus} />;
}

function SidebarDemo() {
  const t = useT();
  const [here, setHere] = useState("overview");
  const rows = [
    { id: "overview", label: t("Overview", "Übersicht"), glyph: "IconDashboard" },
    { id: "exports", label: t("Exports", "Exporte"), glyph: "IconArchive", count: { value: 3, label: t("3 need you", "3 brauchen dich") } },
    { id: "restore", label: t("Restore", "Wiederherstellen"), glyph: "IconRestore" },
  ];
  return (
    <nav aria-label={t("Main", "Haupt")} className="gl-rail">
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {rows.map((r, i) => (
          <SidebarRow
            key={r.id}
            label={r.label}
            glyph={<Glyph name={r.glyph} />}
            href="#/guide/glossary?s=gl-sidebar-row"
            active={here === r.id}
            hueIndex={i}
            count={r.count}
            onClick={(e) => {
              e.preventDefault();
              setHere(r.id);
            }}
          />
        ))}
      </div>
      <SidebarRow
        label={t("Settings", "Einstellungen")}
        glyph={<Glyph name="IconGear" />}
        href="#/guide/glossary?s=gl-sidebar-row"
        active={here === "settings"}
        hueIndex={3}
        onClick={(e) => {
          e.preventDefault();
          setHere("settings");
        }}
      />
    </nav>
  );
}

const SIGN_IN: Record<Lang, SignInText> = {
  en: {
    password: "Password",
    signIn: "Sign in",
    signingIn: "Signing in…",
    passkey: "Sign in with a passkey",
    forgot: "Forgot the password?",
    code: "Code",
    codeHint: "Six digits from your authenticator app, or one of your recovery codes.",
    codeInvalid: "That code does not fit.",
    back: "Back",
    resetCode: "Code from the log",
    resetCodeTip: "The app has written a code into its log. It holds for ten minutes.",
    newPassword: "New password",
    confirmPassword: "Repeat the password",
    setPassword: "Set the password",
    saving: "Saving…",
    mismatch: "The two passwords differ.",
    tooShort: "The new password needs at least 12 characters.",
    resetRejected: "The code is wrong or has run out.",
    failed: "That did not work. Please try once more.",
    show: "Show",
    hide: "Hide",
  },
  de: {
    password: "Passwort",
    signIn: "Anmelden",
    signingIn: "Meldet an…",
    passkey: "Mit Passkey anmelden",
    forgot: "Passwort vergessen?",
    code: "Code",
    codeHint: "Sechs Ziffern aus deiner Authenticator-App oder einer deiner Wiederherstellungscodes.",
    codeInvalid: "Dieser Code passt nicht.",
    back: "Zurück",
    resetCode: "Code aus dem Log",
    resetCodeTip: "Die App hat einen Code in ihr Log geschrieben. Er gilt zehn Minuten.",
    newPassword: "Neues Passwort",
    confirmPassword: "Passwort wiederholen",
    setPassword: "Passwort setzen",
    saving: "Speichert…",
    mismatch: "Die zwei Passwörter sind nicht gleich.",
    tooShort: "Das neue Passwort braucht mindestens 12 Zeichen.",
    resetRejected: "Der Code ist falsch oder abgelaufen.",
    failed: "Das hat nicht geklappt. Probier es bitte noch einmal.",
    show: "Zeigen",
    hide: "Verbergen",
  },
};

function SignInDemo() {
  const t = useT();
  const lang = useContext(LangContext);
  return (
    <SignInCard
      className="gl-signin-in-place"
      logo={logo}
      appName="GlimStone"
      text={SIGN_IN[lang]}
      passkey
      reset
      minPassword={12}
      idPrefix="gl-signin"
      onSignIn={async () => ({ error: t("Nobody signs in here, this is only the pattern.", "Hier meldet sich niemand an, das ist nur das Muster.") })}
      onPasskey={async () => ({ error: t("There is no passkey here.", "Hier gibt es keinen Passkey.") })}
      onAskCode={async () => ({ ok: true })}
      onSetPassword={async () => ({ ok: true })}
    />
  );
}

function ToastDemo() {
  const t = useT();
  const handlers = { dismissLabel: t("Close", "Schließen"), onDismiss: nothing, onMouseEnter: nothing, onMouseLeave: nothing, onFocus: nothing, onBlur: nothing };
  return (
    <div style={{ display: "grid", gap: 8, width: "100%", maxWidth: 384 }}>
      <ToastCard id="a" message={t("Settings saved.", "Einstellungen gespeichert.")} severity="success" {...handlers} />
      <ToastCard id="b" message={t("The target is nearly full.", "Das Ziel ist fast voll.")} severity="warn" {...handlers} />
      <ToastCard id="c" message={t("1,204 files moved to the bin", "1.204 Dateien in den Papierkorb verschoben")} severity="success" action={{ label: t("Put back", "Zurücklegen"), onClick: nothing }} {...handlers} />
      <ToastCard id="d" message={t("The target could not be reached.", "Das Ziel war nicht erreichbar.")} severity="fail" {...handlers} />
    </div>
  );
}

function ShakeDemo() {
  const t = useT();
  const [n, setN] = useState(0);
  return (
    <div style={row}>
      <span key={n} className={n ? "glim-shake" : undefined} style={{ display: "inline-flex" }}>
        <Button label={t("Connect", "Verbinden")} labelKey={null} glyph={<Glyph name="IconLink" />} onClick={() => setN(n + 1)} />
      </span>
      <span style={quiet}>{t("Press it, it refuses.", "Drück ihn, er lehnt ab.")}</span>
    </div>
  );
}

function ProgressDemo() {
  const t = useT();
  return (
    <div style={{ display: "grid", gap: 14, width: "100%", maxWidth: 360 }}>
      <ProgressBar value={0.62} label={t("Copied", "Kopiert")} valueText={t("2.5 GB of 4 GB", "2,5 GB von 4 GB")} />
      <ProgressBar value={0.4} paused label={t("Paused", "Pausiert")} />
      <ProgressBar value={0.55} failed label={t("Failed", "Fehlgeschlagen")} />
      <ProgressBar label={t("Getting ready", "Bereitet vor")} />
    </div>
  );
}

function MeterDemo() {
  const t = useT();
  return (
    <div style={{ display: "grid", gap: 14, width: "100%", maxWidth: 320 }}>
      <span style={row}>
        disk1 <Meter size="small" value={0.42} label="disk1" valueText={t("2.3 TB free of 4 TB", "2,3 TB frei von 4 TB")} />
      </span>
      <span style={row}>
        cache <Meter size="small" value={0.95} label="cache" valueText={t("50 GB free of 1 TB", "50 GB frei von 1 TB")} />
      </span>
      <Meter value={0.31} label="media" valueText={t("5.5 TB free of 8 TB", "5,5 TB frei von 8 TB")} />
      <span style={{ ...row, fontSize: 12 }}>
        {t("Footer", "Fußzeile")} <Meter quiet size="small" value={0.66} label="disk2" />
      </span>
    </div>
  );
}

function InfoBubbleDemo() {
  const t = useT();
  const [on, setOn] = useState(true);
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
      <Toggle label={t("Check after each run", "Nach jedem Lauf prüfen")} checked={on} onChange={setOn} />
      <InfoBubble
        tip={t(
          "Reads every file back from the target and compares it with the source. Takes about as long as the export itself.",
          "Liest jede Datei vom Ziel zurück und vergleicht sie mit der Quelle. Dauert etwa so lange wie der Export selbst.",
        )}
      />
    </span>
  );
}

function BubbleDemo() {
  const t = useT();
  return (
    <div className="gl-contained" style={{ height: 96 }}>
      <span className="glim-bubble" role="tooltip" style={{ left: "50%", top: 24 }}>
        {t("The bubble sits centred over its trigger.", "Die Blase sitzt mittig über ihrem Auslöser.")}
      </span>
    </div>
  );
}

function NoticeDemo() {
  const t = useT();
  return (
    <div style={{ width: "100%", maxWidth: 440 }}>
      <UnavailableNotice
        title={t("A second copy cannot be made right now", "Eine zweite Kopie geht gerade nicht")}
        reason={t("For a second copy the app needs SSH to the target, and that is not set up yet.", "Für die zweite Kopie braucht die App SSH zum Ziel, und das ist noch nicht eingerichtet.")}
        action={<Button label={t("Set up SSH", "SSH einrichten")} labelKey={null} glyph={<Glyph name="IconKey" />} />}
      />
    </div>
  );
}

function LiveDotDemo() {
  const t = useT();
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
      <span className="glim-live gl-live-dot" aria-hidden="true" />
      {t("Exporting", "Exportiert gerade")}
    </span>
  );
}

function SpinnerDemo() {
  const t = useT();
  return (
    <div style={row}>
      <Button label={t("Checking", "Prüft")} labelKey={null} glyph={<Glyph name="IconSearch" />} busy />
      <Button label={t("Saving", "Speichert")} labelKey="save" tone="accent" busy />
    </div>
  );
}

function KbdDemo() {
  const t = useT();
  return (
    <p style={{ margin: 0, lineHeight: 2 }}>
      {t("Commands with ", "Befehle mit ")}
      <Kbd>{t("Ctrl+K", "Strg+K")}</Kbd>
      {t(", the menu bar with ", ", die Menüleiste mit ")}
      <Kbd>F10</Kbd>
      {t(", rename with ", ", umbenennen mit ")}
      <Kbd>F2</Kbd>.
    </p>
  );
}

function NumDemo() {
  const t = useT();
  return (
    <div className="gl-num-compare">
      <span>{t("Without", "Ohne")}</span>
      <span className="glim-num">{t("With", "Mit")}</span>
      <span>1,111 MB</span>
      <span className="glim-num">1,111 MB</span>
      <span>8,808 MB</span>
      <span className="glim-num">8,808 MB</span>
    </div>
  );
}

function GlyphDemo() {
  const names = ["IconSave", "IconTrash", "IconCopy", "IconFolder", "IconSearch", "IconSync", "IconGear", "IconPlay", "IconPause", "IconShieldOn", "IconCloud", "IconMenu"];
  return (
    <div className="gl-glyph-grid">
      {names.map((n) => (
        <span key={n} className="gl-glyph-cell" title={n}>
          <Glyph name={n} size={20} />
          <code>{n.replace("Icon", "")}</code>
        </span>
      ))}
    </div>
  );
}

function InfoTileDemo() {
  const t = useT();
  const repoUrl = "https://github.com/junkerderprovinz/glimstone";
  return (
    <div style={{ display: "grid", gap: 40, width: "100%", maxWidth: 480, paddingTop: 12 }}>
      <InfoTile
        hueIndex={0}
        version={{
          text: { title: "Version", unreleased: (v) => t(`${v}, not released yet`, `${v}, noch nicht veröffentlicht`) },
          rows: [
            { name: t("Example app", "Beispiel-App"), version: "2.1.0", repoUrl },
            { name: "GlimStone", sub: t("Design language", "Designsprache"), version: GLIMSTONE_VERSION, repoUrl },
          ],
          openUrl: nothing,
        }}
        help={{
          text: {
            title: t("Help", "Hilfe"),
            report: t("Something broken, or an idea? An issue or a mail is welcome.", "Etwas kaputt oder eine Idee? Schreib gern ein Issue oder eine E-Mail."),
            repoButton: "GitHub",
            mailButton: t("Mail", "E-Mail"),
            mailSubject: t("Example app", "Beispiel-App"),
            manual: t("Manual", "Handbuch"),
            manualSub: t("Open", "Öffnen"),
          },
          repoUrl,
          repoGlyph: <Glyph name="IconGithub" size={20} />,
          mailAddress: "post@example.com",
          mailGlyph: <Markup svg={MAIL_SVG} />,
          manualUrl: "#/guide/glossary?s=gl-info-tile",
          manualGlyph: <Markup svg={MANUAL_SVG} />,
          openUrl: nothing,
        }}
        about={{
          text: {
            title: t("About", "Über"),
            body: t("Built in a small workshop, free and open source.", "Gebaut in einer kleinen Werkstatt, kostenlos und quelloffen."),
            coffee: t("A donation covers the server and the coffee.", "Eine Spende deckt Server und Kaffee."),
            coffeeButton: t("Buy a coffee", "Einen Kaffee spendieren"),
          },
          onCoffee: nothing,
          coffeeArt: <Markup svg={COFFEE_BUTTON_SVG} />,
        }}
      />
    </div>
  );
}

/** The live element of each entry, by the entry's id. An entry without one is listed only. */
export const DEMOS: Record<string, ComponentType> = {
  card: CardDemo,
  "sub-card": SubCardDemo,
  well: WellDemo,
  "empty-state": EmptyDemo,
  "section-badge": SectionBadgeDemo,
  eyebrow: EyebrowDemo,
  badge: BadgeDemo,
  "state-badge": StateBadgeDemo,
  "badge-forms": FormsDemo,
  "size-stage": SizeDemo,
  "value-display": ValueDemo,
  button: ButtonDemo,
  "key-button": KeyButtonDemo,
  "compact-button": CompactDemo,
  "chip-button": ChipButtonDemo,
  "icon-button": IconButtonDemo,
  "tip-button": TipButtonDemo,
  "readme-button": ReadmeDemo,
  "selector-well": WellSelectorDemo,
  "selector-chips": ChipSelectorDemo,
  "selector-small": SmallSelectorDemo,
  "selector-many": ManySelectorDemo,
  tabs: TabsDemo,
  tiles: TilesDemo,
  "row-tiles": RowTilesDemo,
  select: SelectDemo,
  "select-menu-rows": MenuRowsSelectDemo,
  combobox: ComboboxDemo,
  slider: SliderDemo,
  "color-picker": ColorPickerDemo,
  listbox: ListboxDemo,
  "text-field": TextFieldDemo,
  "text-area": TextAreaDemo,
  "password-field": PasswordDemo,
  "number-field": NumberDemo,
  "copy-field": CopyDemo,
  "path-field": PathDemo,
  "glyph-field": GlyphFieldDemo,
  toggle: ToggleDemo,
  checkbox: CheckboxDemo,
  "row-mark": RowMarkDemo,
  "field-row": FieldRowDemo,
  "field-row-group": FieldRowGroupDemo,
  "list-row": ListRowDemo,
  "glyph-tile": GlyphTileDemo,
  tree: TreeDemo,
  table: TableDemo,
  "move-mode": MoveModeDemo,
  window: WindowDemo,
  "window-foot": FootDemo,
  "confirm-dialog": ConfirmDemo,
  "window-bar": WindowBarDemo,
  "context-menu": MenuDemo,
  "menu-bar": MenuBarDemo,
  "sidebar-row": SidebarDemo,
  "sign-in-card": SignInDemo,
  toast: ToastDemo,
  shake: ShakeDemo,
  "progress-bar": ProgressDemo,
  meter: MeterDemo,
  "info-bubble": InfoBubbleDemo,
  bubble: BubbleDemo,
  notice: NoticeDemo,
  "live-dot": LiveDotDemo,
  spinner: SpinnerDemo,
  glyph: GlyphDemo,
  "tabular-figures": NumDemo,
  kbd: KbdDemo,
  "info-tile": InfoTileDemo,
};
