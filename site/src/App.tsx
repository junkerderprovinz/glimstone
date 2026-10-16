import { useEffect, useMemo, useRef, useState, type ComponentType } from "react";
import { GLIMSTONE_VERSION } from "@gs/react/version";
import { Badge } from "@gs/react/Badge";
import { Button } from "@gs/react/Button";
import logoForLight from "../../.github/assets/glimstone-dunkel.svg?raw";
import logoForDark from "../../.github/assets/glimstone-hell.svg?raw";
import { Glyph } from "./glyph";
import { resetLook } from "./look";
import { AccentControl, LabelControl, MotionControl, RainbowControl, ShapeControl, ThemeControl } from "./lookControls";
import { Adopting, Glyphs, Introduction, Palette, TypeScale } from "./pages/guide";
import { BehaviourGuide, ComboboxPage, SelectPage, SliderPage } from "./pages/zag";
import { ColourEngine, LabelEngine, MotionEngine, ShapeEngine } from "./pages/engines";
import {
  BadgePage,
  ButtonPage,
  CardPage,
  ConfirmDialogPage,
  DropdownPage,
  IconTipPage,
  InfoBubblePage,
  TogglePage,
  ToastPage,
} from "./pages/components";

interface Page {
  path: string;
  title: string;
  group: string;
  Comp: ComponentType;
  tag?: string;
}

const PAGES: Page[] = [
  { path: "/", title: "Introduction", group: "Guide", Comp: Introduction },
  { path: "/guide/adopting", title: "Adopting", group: "Guide", Comp: Adopting },
  { path: "/guide/behaviour", title: "Behaviour", group: "Guide", Comp: BehaviourGuide },
  { path: "/guide/palette", title: "Palette", group: "Guide", Comp: Palette },
  { path: "/guide/type", title: "Type scale", group: "Guide", Comp: TypeScale },
  { path: "/guide/glyphs", title: "Glyphs", group: "Guide", Comp: Glyphs },
  { path: "/engines/colour", title: "Colour", group: "Engines", Comp: ColourEngine },
  { path: "/engines/shape", title: "Shape", group: "Engines", Comp: ShapeEngine },
  { path: "/engines/motion", title: "Motion", group: "Engines", Comp: MotionEngine },
  { path: "/engines/label", title: "Label", group: "Engines", Comp: LabelEngine },
  { path: "/components/badge", title: "Badge", group: "Components", Comp: BadgePage },
  { path: "/components/button", title: "Button", group: "Components", Comp: ButtonPage },
  { path: "/components/card", title: "Card", group: "Components", Comp: CardPage },
  { path: "/components/combobox", title: "Combobox", group: "Components", Comp: ComboboxPage, tag: "Zag" },
  { path: "/components/confirm-dialog", title: "ConfirmDialog", group: "Components", Comp: ConfirmDialogPage },
  { path: "/components/dropdown-listbox", title: "DropdownListbox", group: "Components", Comp: DropdownPage, tag: "Old" },
  { path: "/components/icon-tip-button", title: "IconTipButton", group: "Components", Comp: IconTipPage },
  { path: "/components/info-bubble", title: "InfoBubble", group: "Components", Comp: InfoBubblePage },
  { path: "/components/select", title: "Select", group: "Components", Comp: SelectPage, tag: "Zag" },
  { path: "/components/slider", title: "Slider", group: "Components", Comp: SliderPage, tag: "Zag" },
  { path: "/components/toast", title: "Toast", group: "Components", Comp: ToastPage },
  { path: "/components/toggle", title: "Toggle", group: "Components", Comp: TogglePage },
];
const GROUPS = ["Guide", "Engines", "Components"];

function readRoute() {
  const [path, query] = location.hash.replace(/^#/, "").split("?");
  return { path: path || "/", section: new URLSearchParams(query).get("s") };
}

function useRoute() {
  const [route, setRoute] = useState(readRoute);
  useEffect(() => {
    const on = () => setRoute(readRoute());
    addEventListener("hashchange", on);
    return () => removeEventListener("hashchange", on);
  }, []);
  return route;
}

function useToc(path: string) {
  const [items, setItems] = useState<{ id: string; text: string; depth: number }[]>([]);
  const [active, setActive] = useState("");
  useEffect(() => {
    const heads = [...document.querySelectorAll<HTMLElement>(".prose h2[id], .prose h3[id]")];
    setItems(heads.map((h) => ({ id: h.id, text: h.textContent ?? "", depth: h.tagName === "H3" ? 3 : 2 })));
    const onScroll = () => {
      let current = heads[0]?.id ?? "";
      for (const h of heads) if (h.getBoundingClientRect().top < 120) current = h.id;
      setActive(current);
    };
    onScroll();
    addEventListener("scroll", onScroll, { passive: true });
    return () => removeEventListener("scroll", onScroll);
  }, [path]);
  return { items, active };
}

function Search({ onClose }: { onClose: () => void }) {
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(0);
  const hits = useMemo(
    () => PAGES.filter((p) => (p.title + " " + p.group).toLowerCase().includes(q.toLowerCase())),
    [q],
  );
  const go = (p: Page) => {
    location.hash = p.path;
    onClose();
  };
  return (
    <div className="overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="window" role="dialog" aria-modal="true" aria-label="Search">
        <input
          autoFocus
          className="search-input"
          placeholder="Search the docs"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setSel(0);
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") onClose();
            if (e.key === "ArrowDown") setSel((s) => Math.min(s + 1, hits.length - 1));
            if (e.key === "ArrowUp") setSel((s) => Math.max(s - 1, 0));
            if (e.key === "Enter" && hits[sel]) go(hits[sel]);
          }}
        />
        <div role="listbox" style={{ padding: "0.5rem 0" }}>
          {hits.map((p, i) => (
            <a
              key={p.path}
              role="option"
              aria-selected={i === sel}
              className="search-hit"
              href={`#${p.path}`}
              onClick={onClose}
              onMouseEnter={() => setSel(i)}
            >
              <span>{p.title}</span>
              <span style={{ color: "var(--carbon-text-muted)", fontSize: 13 }}>{p.group}</span>
            </a>
          ))}
          {!hits.length && <p className="search-hit" style={{ color: "var(--carbon-text-muted)" }}>Nothing found.</p>}
        </div>
      </div>
    </div>
  );
}

function LookPanel({ onClose }: { onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const away = (e: PointerEvent) => {
      const t = e.target as HTMLElement;
      if (!ref.current?.contains(t) && !t.closest("[data-look-trigger]")) onClose();
    };
    const esc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    addEventListener("pointerdown", away);
    addEventListener("keydown", esc);
    return () => {
      removeEventListener("pointerdown", away);
      removeEventListener("keydown", esc);
    };
  }, [onClose]);
  const rows: [string, ComponentType][] = [
    ["Theme", ThemeControl],
    ["Accent", AccentControl],
    ["Rainbow", RainbowControl],
    ["Corners", ShapeControl],
    ["Motion", MotionControl],
    ["Labels", LabelControl],
  ];
  return (
    <div ref={ref} className="look-panel" role="dialog" aria-label="Look">
      {rows.map(([label, Control]) => (
        <div className="look-row" key={label}>
          <span className="look-label">{label}</span>
          <Control />
        </div>
      ))}
      <div className="look-row" style={{ display: "flex", justifyContent: "flex-end" }}>
        <Button label="Reset" labelKey="reset" tone="subtle" onClick={resetLook} />
      </div>
    </div>
  );
}

export function App() {
  const { path, section } = useRoute();
  const page = PAGES.find((p) => p.path === path) ?? PAGES[0];
  const [search, setSearch] = useState(false);
  const [look, setLook] = useState(false);
  const [nav, setNav] = useState(false);
  const toc = useToc(page.path);
  const index = PAGES.indexOf(page);
  const prev = PAGES[index - 1];
  const next = PAGES[index + 1];

  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearch(true);
      }
    };
    addEventListener("keydown", key);
    return () => removeEventListener("keydown", key);
  }, []);

  useEffect(() => {
    setNav(false);
    document.title = `${page.title} · GlimStone`;
    if (section) document.getElementById(section)?.scrollIntoView({ block: "start" });
    else scrollTo({ top: 0 });
  }, [page, section]);

  return (
    <>
      <header className="site-header">
        <button
          type="button"
          className="nav-toggle"
          aria-label="Menu"
          aria-expanded={nav}
          onClick={() => setNav((n) => !n)}
        >
          <Glyph name="IconMenu" />
        </button>
        <a href="#/" style={{ display: "flex", alignItems: "center", gap: 10, color: "inherit", textDecoration: "none" }}>
          <span className="logo on-light" dangerouslySetInnerHTML={{ __html: logoForLight }} />
          <span className="logo on-dark" dangerouslySetInnerHTML={{ __html: logoForDark }} />
          <strong style={{ fontSize: 16 }}>GlimStone</strong>
        </a>
        <span className="hide-narrow">
          <Badge size="small" tone="muted">
            {GLIMSTONE_VERSION}
          </Badge>
        </span>
        <span style={{ flex: 1 }} />
        <button type="button" className="field search-trigger" onClick={() => setSearch(true)} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", color: "var(--carbon-text-muted)" }}>
          <Glyph name="IconSearch" />
          <span className="search-word">Search</span>
          <span className="kbd">Ctrl K</span>
        </button>
        <span data-look-trigger>
          <Button label="Look" labelKey="look" tone={look ? "accent" : "neutral"} onClick={() => setLook((l) => !l)} />
        </span>
        <a
          href="https://github.com/junkerderprovinz/glimstone"
          target="_blank"
          rel="noreferrer"
          aria-label="GitHub"
          title="GitHub"
          className="hide-narrow"
          style={{ color: "var(--carbon-text-sub)", display: "inline-flex" }}
        >
          <Glyph name="IconGithub" size={20} />
        </a>
      </header>
      <div className="site-frame">
        <nav className={`site-nav${nav ? " open" : ""}`} aria-label="Docs">
          {GROUPS.map((g) => (
            <div className="nav-group" key={g}>
              <span className="look-label" style={{ paddingInlineStart: 12 }}>
                {g}
              </span>
              {PAGES.filter((p) => p.group === g).map((p) => (
                <a key={p.path} className="nav-link" href={`#${p.path}`} aria-current={p === page ? "page" : undefined}>
                  {p.title}
                  {p.tag && (
                    <span style={{ marginInlineStart: "auto" }}>
                      <Badge size="small" tone="muted">{p.tag}</Badge>
                    </span>
                  )}
                </a>
              ))}
            </div>
          ))}
        </nav>
        <main className="prose" key={page.path}>
          <span className="look-label">{page.group}</span>
          <h1>{page.title}</h1>
          <page.Comp />
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginTop: 64 }}>
            {prev ? (
              <a className="tile" href={`#${prev.path}`} style={{ flex: 1 }}>
                <span className="look-label">Previous</span>
                <strong>{prev.title}</strong>
              </a>
            ) : (
              <span />
            )}
            {next && (
              <a className="tile" href={`#${next.path}`} style={{ flex: 1, textAlign: "end" }}>
                <span className="look-label">Next</span>
                <strong>{next.title}</strong>
              </a>
            )}
          </div>
        </main>
        <aside className="site-toc" aria-label="On this page">
          {toc.items.length > 0 && (
            <>
              <span className="look-label">On this page</span>
              {toc.items.map((t) => (
                <a
                  key={t.id}
                  className={`toc-link${t.id === toc.active ? " active" : ""}`}
                  style={t.depth === 3 ? { paddingInlineStart: 24 } : undefined}
                  href={`#${page.path}?s=${t.id}`}
                >
                  {t.text}
                </a>
              ))}
            </>
          )}
        </aside>
      </div>
      {search && <Search onClose={() => setSearch(false)} />}
      {look && <LookPanel onClose={() => setLook(false)} />}
    </>
  );
}
