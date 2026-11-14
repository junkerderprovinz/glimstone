import { useEffect, useRef, useState, type ComponentType, type KeyboardEvent, type ReactNode } from "react";
import type { Component as VueComponent } from "vue";
import { highlight } from "sugar-high";
import { Button, Badge } from "@glimstone/react";
import propsData from "./gen/props.json";
import { CONTRACTS } from "./contracts";
import { Glyph } from "./glyph";
import { useLook } from "./look";
import { VueIsland } from "./vueIsland";

const demoModules = import.meta.glob<{ default: ComponentType }>("./demos/*.tsx", { eager: true });
const demoSources = import.meta.glob<string>("./demos/*.tsx", { eager: true, query: "?raw", import: "default" });

export function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function H2({ children, id }: { children: string; id?: string }) {
  const slug = id ?? slugify(children);
  return (
    <h2 id={slug}>
      <a className="anchor" href={`#${location.hash.split("?")[0].slice(1)}?s=${slug}`}>
        {children}
      </a>
    </h2>
  );
}

export function H3({ children, id }: { children: string; id?: string }) {
  const slug = id ?? slugify(children);
  return <h3 id={slug}>{children}</h3>;
}

/** The badge-strip selector: one of a few fixed values, arrow keys move. */
export function Selector<T extends string>({
  value,
  options,
  onChange,
  label,
  full,
}: {
  value: T;
  options: { value: T; label: string; glyph?: ReactNode }[];
  onChange: (v: T) => void;
  label: string;
  full?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const move = (e: KeyboardEvent, i: number) => {
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
    let next = step === undefined ? (e.key === "Home" ? 0 : e.key === "End" ? options.length - 1 : -1) : i + step;
    if (next === -1 && step === undefined) return;
    e.preventDefault();
    next = (next + options.length) % options.length;
    onChange(options[next].value);
    ref.current?.querySelectorAll("button")[next]?.focus();
  };
  return (
    <div ref={ref} role="radiogroup" aria-label={label} className={`seg${full ? " full" : ""}`}>
      {options.map((o, i) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={o.value === value}
          tabIndex={o.value === value ? 0 : -1}
          onClick={() => onChange(o.value)}
          onKeyDown={(e) => move(e, i)}
        >
          {o.glyph}
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function useCopied(): [boolean, (text: string) => void] {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  return [
    copied,
    (text) => {
      navigator.clipboard.writeText(text).catch(() => {});
      setCopied(true);
      clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopied(false), 1600);
    },
  ];
}

export function Code({ code, copy = true }: { code: string; copy?: boolean }) {
  const [copied, doCopy] = useCopied();
  return (
    <div className="code-block">
      <pre className="code">
        <code dangerouslySetInnerHTML={{ __html: highlight(code.trim()) }} />
      </pre>
      {copy && (
        <div className="copy">
          <Button
            label={copied ? "Copied" : "Copy"}
            labelKey={copied ? "copied" : "copy"}
            tone="subtle"
            variant="icon"
            onClick={() => doCopy(code.trim())}
          />
        </div>
      )}
    </div>
  );
}

const vueModules = import.meta.glob<{ default: VueComponent }>("./vue-demos/*.vue", { eager: true });
const vueSources = import.meta.glob<string>("./vue-demos/*.vue", { eager: true, query: "?raw", import: "default" });

// The Flutter demos are one web app, built from packages/flutter/example and
// placed under public/flutter, which draws a demo by its name.
const FLUTTER_DEMOS = new Set(["ButtonTones", "ButtonStates"]);
const flutterSource = Object.values(
  import.meta.glob<string>("../../packages/flutter/example/lib/main.dart", { eager: true, query: "?raw", import: "default" }),
)[0];

/** `?fw=react` or `?fw=vue` in the address shows one framework's demos alone, as each test run does. */
function onlyFramework(): string | null {
  return new URLSearchParams(location.hash.split("?")[1] ?? "").get("fw");
}

type View = "preview" | Framework;

function FlutterFrame({ name }: { name: string }) {
  const look = useLook();
  const theme =
    look.theme === "system" ? (matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark") : look.theme;
  return (
    <iframe
      title={`${name} in Flutter`}
      src={`flutter/index.html?demo=${name}&theme=${theme}&shape=${look.shape}&labels=${look.labels}`}
      style={{ display: "block", width: "100%", height: 160, border: 0, colorScheme: "normal" }}
    />
  );
}

/**
 * A live demo from src/demos, beside its Vue twin from src/vue-demos and its
 * Flutter twin where there are ones, with each source one click away.
 */
export function Demo({ name, left }: { name: string; left?: boolean }) {
  const mod = demoModules[`./demos/${name}.tsx`];
  const vue = vueModules[`./vue-demos/${name}.vue`];
  const flutter = FLUTTER_DEMOS.has(name);
  const [view, setView] = useState<View>("preview");
  const [copied, doCopy] = useCopied();
  if (!mod) return <div className="callout">Missing demo {name}</div>;
  const only = onlyFramework();
  const showReact = only !== "vue";
  const showVue = !!vue && only !== "react";
  const showFlutter = flutter && only === null;
  const several = [showReact, showVue, showFlutter].filter(Boolean).length > 1;
  const sources: Record<Framework, string | undefined> = {
    react: demoSources[`./demos/${name}.tsx`],
    vue: vueSources[`./vue-demos/${name}.vue`],
    flutter: flutterSource,
  };
  const shown = (view === "preview" ? sources.react : sources[view])?.trim() ?? "";
  const stage = (framework: Framework, body: ReactNode) => (
    <div className="demo-cell">
      {several && <span className="demo-fw">{FRAMEWORKS.find((f) => f.id === framework)!.name}</span>}
      <div className={`demo-stage${left ? " left" : ""}`} data-demo={name} data-framework={framework}>
        {body}
      </div>
    </div>
  );
  return (
    <div className="demo">
      {view === "preview" ? (
        <div className={several ? "demo-pair" : undefined}>
          {showReact && stage("react", <mod.default />)}
          {showVue && stage("vue", <VueIsland component={vue.default} />)}
          {showFlutter && stage("flutter", <FlutterFrame name={name} />)}
        </div>
      ) : (
        <pre className="code" style={{ maxHeight: "28rem" }}>
          <code dangerouslySetInnerHTML={{ __html: highlight(shown) }} />
        </pre>
      )}
      <div className="demo-bar">
        <Selector
          label="View"
          value={view}
          onChange={setView}
          options={[
            { value: "preview", label: "Preview" },
            { value: "react", label: vue || flutter ? "React" : "Code" },
            ...(vue ? [{ value: "vue" as const, label: "Vue" }] : []),
            ...(flutter ? [{ value: "flutter" as const, label: "Flutter" }] : []),
          ]}
        />
        <span style={{ flex: 1 }} />
        <Button
          label={copied ? "Copied" : "Copy code"}
          labelKey={copied ? "copied" : "copy"}
          tone="subtle"
          onClick={() => doCopy(shown)}
        />
      </div>
    </div>
  );
}

/** Doc comments mark code with backticks. */
function ticks(text: string) {
  return text.split(/`([^`]+)`/).map((part, i) => (i % 2 ? <code key={i}>{part}</code> : part));
}

type PropRow ={ name: string; type: string; values?: string; required: boolean; default?: string; doc: string };

export function PropsTable({ of }: { of: keyof typeof propsData }) {
  const rows = (propsData[of].props as PropRow[]).filter((p) => p.name !== "ref" && p.name !== "className");
  return (
    <table className="props">
      <thead>
        <tr>
          <th>Prop</th>
          <th>Type</th>
          <th>Default</th>
          <th>Description</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((p) => (
          <tr key={p.name}>
            <td className="pname">
              {p.name}
              {p.required && (
                <span style={{ marginInlineStart: 6 }}>
                  <Badge size="small" tone="muted">required</Badge>
                </span>
              )}
            </td>
            <td>
              <code>{p.values ?? p.type}</code>
            </td>
            <td>{p.default ? <code>{p.default}</code> : <span style={{ color: "var(--carbon-text-muted)" }}>-</span>}</td>
            <td>{ticks(p.doc)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// "react/Button.tsx" lives in the React package, "appearance.ts" in the core's
// sources and "tokens.css" beside them.
function repoPath(file: string): string {
  if (file.startsWith("react/")) return `packages/react/src/${file.slice(6)}`;
  return file.endsWith(".ts") ? `packages/core/src/${file}` : `packages/core/${file}`;
}

export function SourceLink({ file }: { file: string }) {
  return (
    <a
      className="nav-link"
      style={{ display: "inline-flex", padding: "0.25rem 0.625rem", background: "var(--carbon-surface2)" }}
      href={`https://github.com/junkerderprovinz/glimstone/blob/main/${repoPath(file)}`}
      target="_blank"
      rel="noreferrer"
    >
      {repoPath(file)}
    </a>
  );
}

export function Callout({ children }: { children: ReactNode }) {
  return <div className="callout">{children}</div>;
}

export function A({ to, children }: { to: string; children: ReactNode }) {
  return <a href={`#${to}`}>{children}</a>;
}

type RowResult = { ok: boolean; error?: string };
export type Results = { ranAt: string; rows: Record<string, Partial<Record<Framework, RowResult>>> };

/** The frameworks the contracts run against, in the order the tables show them. */
export const FRAMEWORKS = [
  { id: "react", name: "React" },
  { id: "vue", name: "Vue" },
  { id: "flutter", name: "Flutter" },
] as const;
export type Framework = (typeof FRAMEWORKS)[number]["id"];

export const results = Object.values(
  import.meta.glob<Results>("./gen/test-results.json", { eager: true, import: "default" }),
).find((r) => r.ranAt);

function Verdict({ res }: { res?: RowResult }) {
  if (!res) return <span className="tested none">-</span>;
  return res.ok ? (
    <span className="tested pass">
      <Glyph name="IconCheck" size={12} /> pass
    </span>
  ) : (
    <span className="tested fail" title={res.error}>
      <Glyph name="IconClose" size={12} /> fails
    </span>
  );
}

/**
 * The behaviour table, with each row's result per framework from the last
 * test run. A dash is a framework that has no such component.
 */
export function ContractTable({ of }: { of: keyof typeof CONTRACTS }) {
  const contract = CONTRACTS[of];
  const shown = FRAMEWORKS.filter((f) => contract.rows.some((r) => results?.rows[r.id]?.[f.id]));
  const tally = shown.map((f) => {
    const tested = contract.rows.filter((r) => results?.rows[r.id]?.[f.id]);
    return `${tested.filter((r) => results!.rows[r.id][f.id]!.ok).length} of ${tested.length} in ${f.name}`;
  });
  return (
    <>
      <p>
        {contract.pattern && (
          <>
            Follows the <a href={contract.pattern.url}>{contract.pattern.name}</a> pattern of the WAI-ARIA Authoring
            Practices.{" "}
          </>
        )}
        {results && shown.length > 0 ? (
          <>
            Rows passing in Chromium: {tally.join(", ")}, tested {new Date(results.ranAt).toLocaleString("en-GB")}.
          </>
        ) : (
          "Not tested yet."
        )}
      </p>
      <table className="props contract">
        <thead>
          <tr>
            <th>Keys</th>
            <th>When</th>
            <th>Then</th>
            {(shown.length > 0 ? shown : FRAMEWORKS.slice(0, 1)).map((f) => (
              <th key={f.id}>{f.name}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {contract.rows.map((r) => (
            <tr key={r.id}>
              <td>
                <span className="kbd-row">
                  {r.keys ? r.keys.map((k) => <span key={k} className="kbd">{k}</span>) : <span style={{ color: "var(--carbon-text-muted)" }}>-</span>}
                </span>
              </td>
              <td>{r.when}</td>
              <td>{r.then}</td>
              {(shown.length > 0 ? shown : FRAMEWORKS.slice(0, 1)).map((f) => (
                <td key={f.id}>
                  <Verdict res={results?.rows[r.id]?.[f.id]} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
