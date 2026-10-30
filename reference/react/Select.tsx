import { useEffect, useId, useRef, type ReactNode, type RefObject } from "react";
import * as menu from "@zag-js/menu";
import * as select from "@zag-js/select";
import { normalizeProps, Portal, useMachine } from "@zag-js/react";
import { enableWheelStep, stepIndex } from "../selectScroll";
import { IconCheck, IconExpand } from "./glyphs";
import { usePortalHue, type PortalHue } from "./portalHue";
import { useTipBubble } from "./useTipBubble";

// The one dropdown. Zag carries the behaviour the contract asks for (typeahead,
// Home and End, focus back on the trigger, dismissal, placement), and the
// select rules in tokens.css, `.glim-select-trigger` and its siblings, carry
// the look, so a page without React mounts the same machine through
// ../select.ts and looks the same.
//
// A list is Zag's select machine, a listbox. A list with a submenu is Zag's
// menu machine with radio items, since a listbox cannot nest. Both render into
// a portal, so no card or scroll box can clip them.

export interface SelectOption<T extends string = string> {
  value: T;
  label: string;
  /** A mark before the label, in the list and on the trigger. */
  glyph?: ReactNode;
  disabled?: boolean;
}

/** A row that opens a list of its own beside it, for a list too long to show flat. */
export interface SelectSubmenu<T extends string = string> {
  label: string;
  glyph?: ReactNode;
  options: SelectOption<T>[];
}

export type SelectEntry<T extends string = string> = SelectOption<T> | SelectSubmenu<T>;

/** A run of rows, set off from its neighbours by a hairline and named by its heading where it has one. */
export interface SelectGroup<T extends string = string> {
  heading?: string;
  entries: SelectEntry<T>[];
}

/**
 * How wide the trigger is. `fill` takes its line like a text field. `steady`
 * is as wide as the longest option, so choosing never moves what stands beside
 * it. `squeeze` is `steady` where there is room and narrower where there is
 * not, down to a few letters and an ellipsis, for a table that has to fit its
 * card. `hug` fits the value on show, for a list cell too narrow for the
 * longest option. The open list shows every option in full in all four.
 */
export type SelectWidth = "fill" | "steady" | "squeeze" | "hug";

export interface SelectProps<T extends string = string> {
  /** The field's name, always the accessible name. */
  label: string;
  /** Draw the label off screen, for a settings row that names the field at its start. */
  hideLabel?: boolean;
  /** Every choice, in list order, for a list without groups. */
  options?: SelectOption<T>[];
  /** The list in runs, with headings and submenus. The wheel steps through every option in list order. */
  groups?: SelectGroup<T>[];
  /** Null when there is no one value, such as over a selection whose rows disagree. */
  value: T | null;
  onChange: (value: T) => void;
  /** Shown while the value is null. */
  placeholder?: string;
  width?: SelectWidth;
  disabled?: boolean;
  /** A choice is out and its answer not back yet: the trigger keeps its focus but takes no input. */
  busy?: boolean;
  /** A hover bubble, for a trigger with no label beside it whose value does not say what it picks. */
  tip?: string;
  /** The caller's failure counter. Each bump shakes the trigger once, as the value snaps back. */
  shake?: number;
  /** Classes for the trigger, for a size the call site needs. */
  className?: string;
}

const WIDTH: Record<SelectWidth, string> = {
  fill: "",
  steady: "glim-select--steady",
  squeeze: "glim-select--squeeze",
  hug: "glim-select--hug",
};

// Below the trigger on the side its text starts from; where that does not fit,
// ending where the trigger ends or above it.
const POSITIONING: select.Props["positioning"] = {
  placement: "bottom-start",
  flip: ["top-start", "bottom-end", "top-end"],
  gutter: 4,
  overflowPadding: 8,
  fitViewport: true,
};

function isSubmenu<T extends string>(e: SelectEntry<T>): e is SelectSubmenu<T> {
  return "options" in e;
}

const pageDir = (): "ltr" | "rtl" =>
  typeof document !== "undefined" && document.documentElement.dir === "rtl" ? "rtl" : "ltr";

export function Select<T extends string = string>({ width = "fill", ...rest }: SelectProps<T>) {
  const groups = rest.groups ?? [{ entries: rest.options ?? [] }];
  const nested = groups.some((g) => g.entries.some(isSubmenu));
  return nested ? (
    <MenuSelect {...rest} width={width} groups={groups} />
  ) : (
    <ListSelect {...rest} width={width} groups={groups} />
  );
}

type Inner<T extends string> = Omit<SelectProps<T>, "groups" | "options" | "width"> & {
  groups: SelectGroup<T>[];
  width: SelectWidth;
};

function ListSelect<T extends string>({
  label,
  hideLabel,
  groups,
  value,
  onChange,
  placeholder,
  width,
  disabled,
  busy,
  tip,
  shake,
  className = "",
}: Inner<T>) {
  const uid = useId();
  const all = flatten(groups);
  const collection = select.collection({
    items: all,
    itemToValue: (o) => o.value,
    itemToString: (o) => o.label,
    isItemDisabled: (o) => !!o.disabled,
  });
  const service = useMachine(select.machine, {
    id: uid,
    dir: pageDir(),
    collection,
    value: value === null ? [] : [value],
    disabled,
    readOnly: busy,
    onValueChange: (d) => {
      const next = d.value[0];
      if (next !== undefined && next !== value) onChange(next as T);
    },
    positioning: POSITIONING,
  });
  const api = select.connect(service, normalizeProps);
  const trigger = useTrigger({ all, value, onChange, inert: !!(disabled || busy), tip, disabled, shake });
  useCloseOnScroll(api.open, () => api.setOpen(false));
  const hue = usePortalHue(api.open, trigger.ref);
  const glyphs = all.some((o) => o.glyph);
  const tp = api.getTriggerProps();
  const positioner = api.getPositionerProps();

  return (
    <div {...api.getRootProps()} className={`glim-select ${WIDTH[width]}`}>
      <label {...api.getLabelProps()} className={hideLabel ? "sr-only" : "glim-field-label"}>
        {label}
      </label>
      <div {...api.getControlProps()}>
        {trigger.tip.wrap(
          <button
            {...tp}
            ref={trigger.attach}
            {...trigger.handlers(tp)}
            aria-busy={busy || undefined}
            className={`glim-select-trigger ${className}`}
          >
            <Face all={all} value={value} placeholder={placeholder} width={width} glyphs={glyphs} />
            <span {...api.getIndicatorProps()} className="glim-select-indicator">
              <IconExpand />
            </span>
          </button>,
        )}
      </div>
      {trigger.tip.bubble}
      <Portal>
        <div {...positioner} style={{ ...positioner.style, ...hue.style }} className={`z-50 ${hue.className}`}>
          <div {...api.getContentProps()} className={`glim-select-content glim-fade${glyphs ? " glim-select-content--glyphs" : ""}`}>
            {groups.map((g, gi) => {
              const items = g.entries as SelectOption<T>[];
              if (items.length === 0) return null;
              const id = `${uid}-g${gi}`;
              return (
                <div key={gi} {...(g.heading ? api.getItemGroupProps({ id }) : {})} className="glim-select-group">
                  {g.heading && (
                    <div {...api.getItemGroupLabelProps({ htmlFor: id })} className="glim-select-heading">
                      {g.heading}
                    </div>
                  )}
                  {items.map((item) => (
                    <div key={item.value} {...api.getItemProps({ item })} className="glim-select-item">
                      {glyphs && <span className="glim-select-glyph">{item.glyph}</span>}
                      <span {...api.getItemTextProps({ item })} className="glim-select-label">
                        {item.label}
                      </span>
                      <span {...api.getItemIndicatorProps({ item })} className="glim-select-check">
                        <IconCheck />
                      </span>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </Portal>
      <select {...api.getHiddenSelectProps()} />
    </div>
  );
}

function MenuSelect<T extends string>({
  label,
  hideLabel,
  groups,
  value,
  onChange,
  placeholder,
  width,
  disabled,
  busy,
  tip,
  shake,
  className = "",
}: Inner<T>) {
  const uid = useId();
  const service = useMachine(menu.machine, {
    id: uid,
    dir: pageDir(),
    "aria-label": label,
    positioning: POSITIONING,
  });
  const api = menu.connect(service, normalizeProps);
  const all = flatten(groups);
  const trigger = useTrigger({ all, value, onChange, inert: !!(disabled || busy), tip, disabled, shake });
  useCloseOnScroll(api.open, () => api.setOpen(false));
  const hue = usePortalHue(api.open, trigger.ref);
  const glyphs = all.some((o) => o.glyph);
  const subId = (gi: number, ei: number) => `${uid}-sub-${gi}-${ei}`;

  // The list opens on the value in force, or on the row of the submenu that
  // holds it, as a native select does. Zag highlights on the frame after it
  // opens, so this goes one frame later still.
  const home = (() => {
    for (const [gi, g] of groups.entries()) {
      for (const [ei, e] of g.entries.entries()) {
        if (isSubmenu(e) ? e.options.some((o) => o.value === value) : e.value === value) {
          return isSubmenu(e) ? subId(gi, ei) : e.value;
        }
      }
    }
    return null;
  })();
  useEffect(() => {
    if (!api.open || home === null) return;
    let inner = 0;
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() => api.setHighlightedValue(home));
    });
    return () => {
      cancelAnimationFrame(outer);
      cancelAnimationFrame(inner);
    };
  }, [api.open]); // eslint-disable-line react-hooks/exhaustive-deps

  const tp = api.getTriggerProps();
  const text = all.find((o) => o.value === value)?.label ?? placeholder ?? "";
  // While busy the trigger keeps focus but nothing reaches the machine.
  const hold = <E extends { preventDefault: () => void }>(fn?: (e: E) => void) =>
    (e: E) => {
      if (busy) e.preventDefault();
      else fn?.(e);
    };
  const positioner = api.getPositionerProps();

  return (
    <div className={`glim-select ${WIDTH[width]}`}>
      {!hideLabel && (
        <span aria-hidden="true" className="glim-field-label">
          {label}
        </span>
      )}
      <div>
        {trigger.tip.wrap(
          <button
            {...tp}
            ref={trigger.attach}
            {...trigger.handlers(tp)}
            onPointerDown={hold(tp.onPointerDown)}
            onClick={hold(tp.onClick)}
            onKeyDown={hold(tp.onKeyDown)}
            disabled={disabled}
            data-disabled={disabled ? "" : undefined}
            data-readonly={busy ? "" : undefined}
            aria-busy={busy || undefined}
            aria-label={`${label}: ${text}`}
            className={`glim-select-trigger ${className}`}
          >
            <Face all={all} value={value} placeholder={placeholder} width={width} glyphs={glyphs} />
            <span {...api.getIndicatorProps()} className="glim-select-indicator">
              <IconExpand />
            </span>
          </button>,
        )}
      </div>
      {trigger.tip.bubble}
      <Portal>
        <div {...positioner} style={{ ...positioner.style, ...hue.style }} className={`z-50 ${hue.className}`}>
          <div {...api.getContentProps()} className={`glim-select-content glim-fade${glyphs ? " glim-select-content--glyphs" : ""}`}>
            {groups.map((g, gi) => {
              if (g.entries.length === 0) return null;
              const id = `g${gi}`;
              return (
                <div key={gi} {...(g.heading ? api.getItemGroupProps({ id }) : {})} className="glim-select-group">
                  {g.heading && (
                    <div {...api.getItemGroupLabelProps({ htmlFor: id })} className="glim-select-heading">
                      {g.heading}
                    </div>
                  )}
                  {g.entries.map((e, ei) =>
                    isSubmenu(e) ? (
                      <Submenu
                        key={`s${ei}`}
                        parent={service}
                        parentApi={api}
                        triggerId={subId(gi, ei)}
                        entry={e}
                        value={value}
                        onChange={onChange}
                        glyphs={glyphs}
                        hue={hue}
                      />
                    ) : (
                      <Choice key={e.value} api={api} option={e} value={value} onChange={onChange} glyphs={glyphs} />
                    ),
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </Portal>
    </div>
  );
}

function Submenu<T extends string>({
  parent,
  parentApi,
  triggerId,
  entry,
  value,
  onChange,
  glyphs,
  hue,
}: {
  parent: menu.Service;
  parentApi: menu.Api;
  triggerId: string;
  entry: SelectSubmenu<T>;
  value: T | null;
  onChange: (value: T) => void;
  glyphs: boolean;
  hue: PortalHue;
}) {
  const service = useMachine(menu.machine, {
    id: useId(),
    ids: { trigger: triggerId },
    dir: pageDir(),
    "aria-label": entry.label,
  });
  const api = menu.connect(service, normalizeProps);
  useEffect(() => {
    parentApi.setChild(service);
    api.setParent(parent);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const positioner = api.getPositionerProps();

  return (
    <>
      <div {...parentApi.getTriggerItemProps(api)} className="glim-select-item">
        {glyphs && <span className="glim-select-glyph">{entry.glyph}</span>}
        <span className="glim-select-label">{entry.label}</span>
        <span aria-hidden="true" className="glim-select-caret">
          <IconExpand />
        </span>
      </div>
      <Portal>
        <div {...positioner} style={{ ...positioner.style, ...hue.style }} className={`z-50 ${hue.className}`}>
          <div {...api.getContentProps()} className={`glim-select-content glim-fade${glyphs ? " glim-select-content--glyphs" : ""}`}>
            {entry.options.map((o) => (
              <Choice key={o.value} api={api} option={o} value={value} onChange={onChange} glyphs={glyphs} />
            ))}
          </div>
        </div>
      </Portal>
    </>
  );
}

function Choice<T extends string>({
  api,
  option,
  value,
  onChange,
  glyphs,
}: {
  api: menu.Api;
  option: SelectOption<T>;
  value: T | null;
  onChange: (value: T) => void;
  glyphs: boolean;
}) {
  const checked = option.value === value;
  const item = {
    type: "radio" as const,
    value: option.value,
    valueText: option.label,
    checked,
    disabled: option.disabled,
    onCheckedChange: () => {
      if (!checked) onChange(option.value);
    },
  };
  return (
    <div {...api.getOptionItemProps(item)} className="glim-select-item">
      {glyphs && <span className="glim-select-glyph">{option.glyph}</span>}
      <span {...api.getItemTextProps(item)} className="glim-select-label">
        {option.label}
      </span>
      <span aria-hidden="true" data-state={checked ? "checked" : "unchecked"} className="glim-select-check">
        <IconCheck />
      </span>
    </div>
  );
}

/**
 * The value on the trigger. Every label stands in one grid cell with only the
 * chosen one visible, so `steady` and `squeeze` are as wide as the longest and
 * the trigger does not move when the value does.
 */
function Face<T extends string>({
  all,
  value,
  placeholder,
  width,
  glyphs,
}: {
  all: SelectOption<T>[];
  value: T | null;
  placeholder?: string;
  width: SelectWidth;
  glyphs: boolean;
}) {
  const shown = all.find((o) => o.value === value);
  const text = shown?.label ?? placeholder ?? "";
  const stacked = width === "steady" || width === "squeeze";
  const labels = stacked ? [...new Set([text, ...all.map((o) => o.label)])] : [text];
  return (
    <>
      {glyphs && <span className="glim-select-glyph">{shown?.glyph}</span>}
      <span className="glim-select-value">
        {labels.map((l) => (
          <span key={l} aria-hidden={l !== text || undefined} className={l === text ? undefined : "glim-select-ghost"}>
            {l}
          </span>
        ))}
      </span>
    </>
  );
}

function flatten<T extends string>(groups: SelectGroup<T>[]): SelectOption<T>[] {
  return groups.flatMap((g) => g.entries.flatMap((e) => (isSubmenu(e) ? e.options : [e])));
}

/**
 * What the two triggers share: the wheel, the tip bubble and the shake. The
 * wheel steps through every option in list order while the closed trigger has
 * focus, skipping disabled ones and stopping at both ends (rule 14).
 */
function useTrigger<T extends string>(o: {
  all: SelectOption<T>[];
  value: T | null;
  onChange: (value: T) => void;
  inert: boolean;
  tip?: string;
  disabled?: boolean;
  shake?: number;
}) {
  const ref = useRef<HTMLButtonElement | null>(null);
  const tip = useTipBubble(o.tip, o.disabled);

  // Read through a ref, so the listener is attached once per trigger node.
  const live = useRef(o);
  live.current = o;
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    return enableWheelStep(el, (delta) => {
      const { all, value, onChange, inert } = live.current;
      if (inert) return;
      const at = all.findIndex((x) => x.value === value);
      // A value the list does not carry steps onto the first option.
      if (at < 0) {
        const first = all.find((x) => !x.disabled);
        if (first) onChange(first.value);
        return;
      }
      let next = at;
      for (;;) {
        const candidate = stepIndex(all.length, next, delta);
        if (candidate === next) return;
        next = candidate;
        if (!all[next].disabled) break;
      }
      onChange(all[next].value);
    });
  }, []);

  useShake(ref, o.shake ?? 0);

  return {
    ref: ref as RefObject<HTMLElement | null>,
    tip,
    attach: (el: HTMLButtonElement | null) => {
      ref.current = el;
      tip.ref(el);
    },
    /** The bubble's handlers chained after the machine's own. */
    handlers: (tp: { onFocus?: unknown; onBlur?: unknown }) => {
      if (!o.tip) return {};
      const run = (fn: unknown, e: unknown) => {
        if (typeof fn === "function") fn(e);
      };
      return {
        onFocus: (e: unknown) => {
          run(tp.onFocus, e);
          tip.handlers.onFocus();
        },
        onBlur: (e: unknown) => {
          run(tp.onBlur, e);
          tip.handlers.onBlur();
        },
        onMouseEnter: tip.handlers.onMouseEnter,
        onMouseLeave: tip.handlers.onMouseLeave,
        "aria-describedby": tip.describedBy,
      };
    },
  };
}

// A wheel or a finger moving the page past the open list closes it, as a
// resize does. Scroll events do not: the list follows its trigger, and a page
// still gliding to a trigger that just took focus would close it as it opens.
function useCloseOnScroll(open: boolean, close: () => void) {
  const latest = useRef(close);
  latest.current = close;
  useEffect(() => {
    if (!open) return;
    const onMove = (e: Event) => {
      if (e.target instanceof Element && e.target.closest(".glim-select-content")) return;
      latest.current();
    };
    const onResize = () => latest.current();
    const opts = { capture: true, passive: true };
    window.addEventListener("wheel", onMove, opts);
    window.addEventListener("touchmove", onMove, opts);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("wheel", onMove, opts);
      window.removeEventListener("touchmove", onMove, opts);
      window.removeEventListener("resize", onResize);
    };
  }, [open]);
}

// The class has to be gone for a whole frame before it comes back, or the
// animation does not start again.
function useShake(ref: RefObject<HTMLElement | null>, count: number) {
  useEffect(() => {
    const el = ref.current;
    if (!el || count === 0) return;
    el.classList.remove("glim-shake");
    let inner = 0;
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() => el.classList.add("glim-shake"));
    });
    const done = (e: AnimationEvent) => {
      if (e.target === el) el.classList.remove("glim-shake");
    };
    el.addEventListener("animationend", done);
    return () => {
      cancelAnimationFrame(outer);
      cancelAnimationFrame(inner);
      el.removeEventListener("animationend", done);
    };
  }, [ref, count]);
}
