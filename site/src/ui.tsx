import { useEffect, useRef, useState, type ComponentType, type KeyboardEvent, type ReactNode } from "react";
import { highlight } from "sugar-high";
import { Button } from "@gs/react/Button";
import { Badge } from "@gs/react/Badge";
import propsData from "./gen/props.json";
import { CONTRACTS } from "./contracts";
import { Glyph } from "./glyph";

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

function useCopied(): [boolean, (text: string) => void] {
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

/** A live demo from src/demos, with its own source one click away. */
export function Demo({ name, left }: { name: string; left?: boolean }) {
  const mod = demoModules[`./demos/${name}.tsx`];
  const raw = demoSources[`./demos/${name}.tsx`] ?? "";
  const [view, setView] = useState<"preview" | "code">("preview");
  const [copied, doCopy] = useCopied();
  if (!mod) return <div className="callout">Missing demo {name}</div>;
  const Comp = mod.default;
  // The demo files import from "@gs/react/..."; an app copies the component
  // next to its own code, so the shown source points there.
  const shown = raw.replace(/@gs\/react\//g, "./components/").replace(/@gs\//g, "./lib/").trim();
  return (
    <div className="demo">
      {view === "preview" ? (
        <div className={`demo-stage${left ? " left" : ""}`} data-demo={name}>
          <Comp />
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
            { value: "code", label: "Code" },
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

export function SourceLink({ file }: { file: string }) {
  return (
    <a
      className="nav-link"
      style={{ display: "inline-flex", padding: "0.25rem 0.625rem", background: "var(--carbon-surface2)" }}
      href={`https://github.com/junkerderprovinz/glimstone/blob/main/reference/${file}`}
      target="_blank"
      rel="noreferrer"
    >
      reference/{file}
    </a>
  );
}

export function Callout({ children }: { children: ReactNode }) {
  return <div className="callout">{children}</div>;
}

export function A({ to, children }: { to: string; children: ReactNode }) {
  return <a href={`#${to}`}>{children}</a>;
}

const results = Object.values(
  import.meta.glob<{ ranAt: string; rows: Record<string, { ok: boolean; error?: string }> }>("./gen/test-results.json", {
    eager: true,
    import: "default",
  }),
).find((r) => r.ranAt);

/** The behaviour table, with each row's result from the last test run. */
export function ContractTable({ of }: { of: keyof typeof CONTRACTS }) {
  const contract = CONTRACTS[of];
  const passed = contract.rows.filter((r) => results?.rows[r.id]?.ok).length;
  return (
    <>
      <p>
        {contract.pattern && (
          <>
            Follows the <a href={contract.pattern.url}>{contract.pattern.name}</a> pattern of the WAI-ARIA Authoring
            Practices.{" "}
          </>
        )}
        {results ? (
          <>
            {passed} of {contract.rows.length} rows pass in Chromium, tested {new Date(results.ranAt).toLocaleString("en-GB")}.
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
            <th>Test</th>
          </tr>
        </thead>
        <tbody>
          {contract.rows.map((r) => {
            const res = results?.rows[r.id];
            return (
              <tr key={r.id}>
                <td>
                  <span className="kbd-row">
                    {r.keys ? r.keys.map((k) => <span key={k} className="kbd">{k}</span>) : <span style={{ color: "var(--carbon-text-muted)" }}>-</span>}
                  </span>
                </td>
                <td>{r.when}</td>
                <td>{r.then}</td>
                <td title={res?.error}>
                  {!res ? (
                    <span className="tested none">untested</span>
                  ) : res.ok ? (
                    <span className="tested pass">
                      <Glyph name="IconCheck" size={12} /> pass
                    </span>
                  ) : (
                    <span className="tested fail">
                      <Glyph name="IconClose" size={12} /> fails
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );
}
