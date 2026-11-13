import { useMemo, useState } from "react";
import { GLIMSTONE_VERSION } from "@glimstone/react";
import tokens from "../gen/tokens.json";
import rules from "../gen/rules.json";
import { Glyph, GLYPHS } from "../glyph";
import { Callout, Code, H2, SourceLink } from "../ui";
import { SampleSurface } from "../sample";

const BLOB = "https://github.com/junkerderprovinz/glimstone/blob/main/";

export function Introduction() {
  return (
    <>
      <p className="lead">
        GlimStone is the design language shared by a family of apps: one quiet palette, four engines the user drives
        from the app root, and a set of React components an app copies instead of rebuilding.
      </p>
      <div className="demo">
        <div className="demo-stage">
          <SampleSurface />
        </div>
      </div>
      <p>
        Open <strong>Look</strong> in the header and change the theme, the corners, the accent, the motion or the label
        mode. Every component on every page follows, because each one reads the same tokens instead of carrying its own
        values.
      </p>
      <H2>What is in it</H2>
      <div className="tile-grid">
        <a className="tile" href="#/guide/palette">
          <strong>Palette</strong>
          <p>IBM Carbon's neutral greys, one accent and four state hues.</p>
        </a>
        <a className="tile" href="#/engines/colour">
          <strong>Four engines</strong>
          <p>Colour, shape, motion and labels, each set once on the root.</p>
        </a>
        <a className="tile" href="#/components/button">
          <strong>Components</strong>
          <p>Button, Toggle, Card, Badge, dialogs, toasts and the info bubble.</p>
        </a>
        <a className="tile" href="#/guide/glyphs">
          <strong>{GLYPHS.length} glyphs</strong>
          <p>One assortment, so a folder is the same folder in every app.</p>
        </a>
      </div>
      <H2>How it differs from a component library</H2>
      <p>
        There is no package and no build step. An app copies <code>tokens.css</code>, the engine files and the components
        it needs, and from then on owns them. That is how a plain-CSS Unraid plugin and a React app can speak the same
        language without sharing a runtime.
      </p>
      <p>
        Each page here shows the real file from <code>reference/</code>, live. The props tables are read from the
        source, so they cannot drift from what the component accepts.
      </p>
      <Callout>
        This site documents GlimStone {GLIMSTONE_VERSION}. The full reasoning behind every rule lives in{" "}
        <a href="https://github.com/junkerderprovinz/glimstone/blob/main/docs/design-language.md">docs/design-language.md</a>
        ; these pages link into it.
      </Callout>
    </>
  );
}

export function Adopting() {
  return (
    <>
      <p className="lead">Adopting GlimStone means copying files, not installing a dependency.</p>
      <H2>1. Tokens</H2>
      <p>
        Copy <SourceLink file="tokens.css" /> into the app and load it before anything else. Under Tailwind v4 add{" "}
        <SourceLink file="tailwind-theme.css" /> after it, which maps the tokens onto utilities such as{" "}
        <code>bg-carbon-surface</code> and <code>text-accent</code>.
      </p>
      <Code code={`@import "./glimstone/tokens.css";\n@import "./glimstone/tailwind-theme.css";`} />
      <H2>2. Engines</H2>
      <p>
        Copy <SourceLink file="appearance.ts" /> and <SourceLink file="controls.ts" />, then apply the stored look once at
        boot, before the first render, so a reload never flashes the defaults.
      </p>
      <Code
        code={`import { applyCachedAppearance } from "./glimstone/appearance";
import { applyStoredLabelModes } from "./glimstone/controls";

applyCachedAppearance();
applyStoredLabelModes();`}
      />
      <H2>3. Font</H2>
      <p>
        Every app ships Noto Sans so it draws the same on every machine. Import the variable files once at the entry and
        let <code>--font-sans</code> do the rest.
      </p>
      <Code code={`import "@fontsource-variable/noto-sans";`} />
      <H2>4. Components</H2>
      <p>
        Copy the files from <code>reference/react/</code> you need. They take every string as a prop, fetch nothing and
        ask the app for icons through <code>setGlyphResolver</code>.
      </p>
      <Code
        code={`import { setGlyphResolver } from "@glimstone/react";

setGlyphResolver((key) => ICONS[key]);`}
      />
      <Callout>
        Run <code>bash reference/react/check.sh</code> after copying. It fails when a component uses a class or token the
        copied stylesheet does not define.
      </Callout>
    </>
  );
}

type Token = { name: string; value: string; doc: string };

export function Palette() {
  const groups = useMemo(() => {
    const out: { doc: string; items: Token[] }[] = [];
    for (const t of tokens as Token[]) {
      if (t.doc || !out.length) out.push({ doc: t.doc, items: [] });
      out[out.length - 1].items.push(t);
    }
    return out;
  }, []);
  return (
    <>
      <p className="lead">
        The greys are IBM Carbon's, so every app in the family stands on the same ground. GlimStone adds the system on
        top: the rules, the engines and the rainbow.
      </p>
      <p>Each swatch below is drawn from the live token, under the dark ramp, under OLED and under the light ramp.</p>
      {groups.map((g, i) => (
        <div key={i}>
          {g.doc && <p style={{ marginTop: 32 }}>{g.doc}</p>}
          <div className="swatch-row swatch-row--three" style={{ borderBottom: 0 }}>
            <span />
            <span className="look-label" style={{ margin: 0, textAlign: "center" }}>Dark</span>
            <span className="look-label" style={{ margin: 0, textAlign: "center" }}>OLED</span>
            <span className="look-label" style={{ margin: 0, textAlign: "center" }}>Light</span>
          </div>
          {g.items.map((t) => (
            <div className="swatch-row swatch-row--three" key={t.name}>
              <code style={{ justifySelf: "start" }}>{t.name}</code>
              <div data-theme="dark" style={{ background: "transparent" }}>
                <div className="swatch-chip" style={{ background: `var(${t.name})` }} />
              </div>
              <div data-theme="dark" data-oled="" style={{ background: "transparent" }}>
                <div className="swatch-chip" style={{ background: `var(${t.name})` }} />
              </div>
              <div data-theme="light" style={{ background: "transparent" }}>
                <div className="swatch-chip" style={{ background: `var(${t.name})` }} />
              </div>
            </div>
          ))}
        </div>
      ))}
    </>
  );
}

const SCALE = [
  { token: "--text-status", px: 22, role: "Status line: the overview's status head and the one figure a tile counts." },
  { token: "--text-title", px: 16, role: "Emphasised title: a row title that has to stand out, a window's title." },
  { token: "--text-body", px: 14, role: "Body: everything that is not one of the other rows." },
  { token: "--text-subline", px: 13, role: "Sub-line: the text beside or under a name, a hint, a time." },
  { token: "--text-meta", px: 12, role: "Notch and meta: a card's notch badge, an eyebrow label, a count." },
];

export function TypeScale() {
  return (
    <>
      <p className="lead">Five sizes, one per role. A sixth size found in an app is a bug to fix, not a row to add.</p>
      <div style={{ margin: "1.5rem 0" }}>
        {SCALE.map((s) => (
          <div key={s.token} className="swatch-row" style={{ gridTemplateColumns: "6rem minmax(0,1fr)" }}>
            <code>{s.px}px</code>
            <div>
              <div style={{ fontSize: `var(${s.token})`, color: "var(--carbon-text)", lineHeight: 1.35 }}>{s.role}</div>
              <div style={{ fontSize: 12, color: "var(--carbon-text-muted)", marginTop: 4 }}>{s.token}</div>
            </div>
          </div>
        ))}
      </div>
      <p>
        A page's one hero figure, a wordmark and text inside an illustration stand outside the scale. They are sized on
        their own merits, and nobody should extend them into a display step.
      </p>
    </>
  );
}

export function Glyphs() {
  const [q, setQ] = useState("");
  const [copied, setCopied] = useState("");
  const shown = GLYPHS.filter((g) => (g.name + " " + g.means).toLowerCase().includes(q.toLowerCase()));
  return (
    <>
      <p className="lead">
        One assortment for the whole family. An app maps its own label keys onto these names, and every button can then
        show its glyph.
      </p>
      <input
        className="field"
        style={{ width: "100%", marginTop: 8 }}
        placeholder={`Filter ${GLYPHS.length} glyphs`}
        value={q}
        onChange={(e) => setQ(e.target.value)}
        aria-label="Filter glyphs"
      />
      <div className="glyph-grid">
        {shown.map((g) => (
          <button
            key={g.name}
            type="button"
            className="glyph-cell"
            title={g.means}
            onClick={() => {
              navigator.clipboard.writeText(g.name).catch(() => {});
              setCopied(g.name);
            }}
          >
            <Glyph name={g.name} size={22} />
            <span>{copied === g.name ? "Copied" : g.name.replace(/^Icon/, "")}</span>
          </button>
        ))}
      </div>
      <p>
        Click a glyph to copy its name. The meanings and sources are listed in <SourceLink file="glyphs.md" />.
      </p>
    </>
  );
}


type Rule = { number: number; title: string; blocks: ({ p: string } | { item: string; check: boolean })[] };

export function Rules() {
  return (
    <>
      <p className="lead">
        The numbered rules, as <a href={`${BLOB}docs/design-language.md#the-rules-that-keep-it-calm`}>the design language</a>{" "}
        states them. This page is built from that file, so the two cannot disagree. Elsewhere a rule is cited by its
        number, and a link such as <code>#/guide/rules?s=rule-14</code> opens it here.
      </p>
      {(rules as Rule[]).map((r) => (
        <section key={r.number} id={`rule-${r.number}`} className="rule">
          <p>
            <span className="rule-number glim-num">{r.number}</span> <strong dangerouslySetInnerHTML={{ __html: r.title }} />
          </p>
          {r.blocks.map((b, i) =>
            "p" in b ? (
              <p key={i} dangerouslySetInnerHTML={{ __html: b.p }} />
            ) : (
              <p key={i} className={b.check ? "rule-check" : "rule-item"} dangerouslySetInnerHTML={{ __html: b.item }} />
            ),
          )}
        </section>
      ))}
    </>
  );
}
