import { useEffect, useRef, useState, useSyncExternalStore, type CSSProperties } from "react";
import { COPIED_MS, copyText, hueVars } from "@glimstone/core";
import { Button, FieldRow, FieldRowGroup, SubCard } from "@glimstone/react";
import { resetLook, useLook } from "./look";
import { LOOK_AXES, LOOK_GROUPS, lookSnippet, rootSnippet, storeSnippet } from "./lookAxes";
import { Code } from "./ui";

// Whether the panel is open belongs to the page, not to one button: the header
// and the start page both open the same panel.
let open = false;
const listeners = new Set<() => void>();

export function setLookPanel(next: boolean) {
  open = next;
  // Wide screens make room beside the panel instead of covering the page.
  document.documentElement.toggleAttribute("data-look-open", open);
  listeners.forEach((fn) => fn());
}

export function useLookPanel(): boolean {
  return useSyncExternalStore(
    (fn) => {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    () => open,
  );
}

export function LookPanel() {
  const shown = useLookPanel();
  const look = useLook();
  const ref = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const timer = useRef<number>(undefined);

  useEffect(() => {
    if (!shown) return;
    const back = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    ref.current?.focus();
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setLookPanel(false);
    addEventListener("keydown", esc);
    return () => {
      removeEventListener("keydown", esc);
      back?.focus();
    };
  }, [shown]);
  useEffect(() => () => clearTimeout(timer.current), []);

  if (!shown) return null;
  const copy = async () => {
    if (!(await copyText(lookSnippet(look)))) return;
    setCopied(true);
    clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), COPIED_MS);
  };
  return (
    <div ref={ref} tabIndex={-1} className="look-panel" role="dialog" aria-labelledby="look-panel-title">
      <div className="look-panel-head">
        <h2 id="look-panel-title">Make it yours</h2>
        <p>Every page follows each change at once.</p>
      </div>
      <div className="look-panel-body">
        {LOOK_GROUPS.map((group) => (
          <SubCard key={group} title={group}>
            <FieldRowGroup>
              {LOOK_AXES.filter((a) => a.group === group && (a.shown?.(look) ?? true)).map(({ id, label, hint, kind, hue, Control }) => (
                <FieldRow
                  key={id}
                  label={label}
                  hint={typeof hint === "function" ? hint(look) : hint}
                  data-axis={id}
                  data-kind={kind}
                  className={hue === undefined ? undefined : "glim-hue"}
                  style={hue === undefined ? undefined : (hueVars(hue) as CSSProperties)}
                >
                  {/* A choice names its own strip, which then spans the row instead of
                      hugging its end, at the small scale a settings row gives it. */}
                  {kind === "choice" ? <Control label={label} size="sm" /> : <Control />}
                </FieldRow>
              ))}
            </FieldRowGroup>
          </SubCard>
        ))}
        <SubCard title="For your app" hint="The look above as attributes for the app's root element, and as the values its settings start at.">
          <Code code={rootSnippet(look)} copy={false} />
          <Code code={storeSnippet(look)} copy={false} />
          <div className="look-snippet-copy">
            <Button
              label={copied ? "Copied" : "Copy snippet"}
              labelKey={copied ? "copied" : "copy"}
              tone="accent"
              onClick={copy}
              data-look="copy"
            />
          </div>
        </SubCard>
      </div>
      <div className="look-panel-foot">
        <Button label="Reset" labelKey="reset" tone="subtle" onClick={resetLook} />
        <span style={{ flex: 1 }} />
        <Button label="Close" labelKey="close" onClick={() => setLookPanel(false)} />
      </div>
    </div>
  );
}
