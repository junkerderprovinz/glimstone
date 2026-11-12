import { useEffect, useId, useRef, type ReactNode, type Ref, type RefObject } from "react";
import * as menu from "@zag-js/menu";
import * as select from "@zag-js/select";
import { normalizeProps, Portal, useMachine } from "@zag-js/react";
import {
  closeOnPageMove,
  defaultWidth,
  enableWheelStep,
  faceLabels,
  flattenRuns,
  hasSubmenu,
  homeRow,
  isSubmenu,
  pageDir,
  SELECT_POSITIONING,
  selectRootClass,
  selectRowParts,
  selectTriggerClass,
  shake as shakeOnce,
  wheelValue,
  type SelectChoice,
  type SelectEntry as Entry,
  type SelectRowParts,
  type SelectRows,
  type SelectRun,
  type SelectSize,
  type SelectSubmenu as Submenu,
  type SelectWidth,
} from "@glimstone/core";
import { useFieldName } from "./fieldName.ts";
import { IconCheck, IconExpand } from "./glyphs.tsx";
import { usePortalHue, type PortalHue } from "./portalHue.ts";
import { useTipBubble } from "./useTipBubble.tsx";

// The one dropdown. Zag carries the behaviour the contract asks for (typeahead,
// Home and End, focus back on the trigger, dismissal, placement), and the
// select rules in tokens.css carry the look, so a page without a framework
// mounts the same machine through the core's mountSelect and looks the same.
//
// A list is Zag's select machine, a listbox. A list with a submenu is Zag's
// menu machine with radio items, since a listbox cannot nest. Both render into
// a portal, so no card or scroll box can clip them.

export type SelectOption<T extends string = string> = SelectChoice<T, ReactNode>;
export type SelectSubmenu<T extends string = string> = Submenu<T, ReactNode>;
export type SelectEntry<T extends string = string> = Entry<T, ReactNode>;
export type SelectGroup<T extends string = string> = SelectRun<T, ReactNode>;
export type { SelectRows, SelectSize, SelectWidth } from "@glimstone/core";

export interface SelectProps<T extends string = string> {
  /** The field's name, always the accessible name. Inside a FieldRow the row gives it and draws the words. */
  label?: string;
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
  /** Defaults to `fill` for a field and to `steady` for the smaller sizes and inside a FieldRow. */
  width?: SelectWidth;
  size?: SelectSize;
  /** `menu` draws the open list with a context menu's rows, so an app with both shows one kind of menu row. */
  rows?: SelectRows;
  /** Lets a long value run onto a second line instead of ending in an ellipsis, for one whose end says as much as its start, such as a path. */
  wrap?: boolean;
  /** The trigger's id, for a `<label htmlFor>` outside the select. */
  id?: string;
  /** Attributes for the trigger, such as a data hook that says the value. */
  triggerAttrs?: Record<string, string>;
  /** The open list's id. */
  listId?: string;
  /** The trigger's own node, for a caller that hands it the focus. */
  ref?: Ref<HTMLButtonElement>;
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

export function Select<T extends string = string>({
  size = "field",
  rows = "list",
  label,
  hideLabel,
  width,
  wrap = false,
  className = "",
  options,
  groups,
  ...rest
}: SelectProps<T>) {
  const name = useFieldName(label);
  const fromRow = label === undefined;
  const shared = { label: name ?? "", hideLabel: hideLabel || fromRow, width: width ?? (fromRow ? "steady" : defaultWidth(size)), rows };
  const runs = groups ?? [{ entries: options ?? [] }];
  const look = `${selectTriggerClass(size, wrap)} ${className}`.trim();
  return hasSubmenu(runs) ? (
    <MenuSelect {...rest} {...shared} groups={runs} className={look} />
  ) : (
    <ListSelect {...rest} {...shared} groups={runs} className={look} />
  );
}

/** What the two machines take: the runs resolved and `className` the trigger's whole class list. */
type Inner<T extends string> = Omit<SelectProps<T>, "groups" | "options" | "label" | "width" | "size" | "rows" | "wrap"> & {
  label: string;
  groups: SelectGroup<T>[];
  width: SelectWidth;
  rows: SelectRows;
};

function ListSelect<T extends string>({
  label,
  hideLabel,
  groups,
  value,
  onChange,
  placeholder,
  width,
  rows,
  disabled,
  busy,
  tip,
  shake,
  className,
  id,
  triggerAttrs,
  listId,
  ref,
}: Inner<T>) {
  const uid = useId();
  const all = flattenRuns(groups);
  const collection = select.collection({
    items: all,
    itemToValue: (o) => o.value,
    itemToString: (o) => o.label,
    isItemDisabled: (o) => !!o.disabled,
  });
  const service = useMachine(select.machine, {
    id: uid,
    ids: { trigger: id, content: listId },
    dir: pageDir(),
    collection,
    value: value === null ? [] : [value],
    disabled,
    readOnly: busy,
    onValueChange: (d) => {
      const next = d.value[0];
      if (next !== undefined && next !== value) onChange(next as T);
    },
    positioning: SELECT_POSITIONING,
  });
  const api = select.connect(service, normalizeProps);
  const trigger = useTrigger({ all, value, onChange, inert: !!(disabled || busy), tip, disabled, shake, outer: ref });
  useEffect(() => (api.open ? closeOnPageMove(() => api.setOpen(false)) : undefined), [api.open]); // eslint-disable-line react-hooks/exhaustive-deps
  const hue = usePortalHue(api.open, trigger.ref);
  const glyphs = all.some((o) => o.glyph);
  const parts = selectRowParts(rows, glyphs);
  const tp = api.getTriggerProps();
  const positioner = api.getPositionerProps();

  return (
    <div data-glim="Select" {...api.getRootProps()} className={selectRootClass(width)}>
      <label {...api.getLabelProps()} className={hideLabel ? "glim-sr-only" : "glim-field-label"}>
        {label}
      </label>
      <div {...api.getControlProps()}>
        {trigger.tip.wrap(
          <button
            {...triggerAttrs}
            {...tp}
            ref={trigger.attach}
            {...trigger.handlers(tp)}
            aria-busy={busy || undefined}
            className={className}
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
        <div {...positioner} style={{ ...positioner.style, ...hue.style }} className={`glim-select-positioner ${hue.className}`.trim()}>
          <div {...api.getContentProps()} className={parts.content}>
            {groups.map((g, gi) => {
              const items = g.entries as SelectOption<T>[];
              if (items.length === 0) return null;
              const id = `${uid}-g${gi}`;
              return (
                <div key={gi} {...(g.heading ? api.getItemGroupProps({ id }) : {})} className="glim-select-group">
                  {g.heading && (
                    <div {...api.getItemGroupLabelProps({ htmlFor: id })} className={parts.heading}>
                      {g.heading}
                    </div>
                  )}
                  {items.map((item) => (
                    <div key={item.value} {...api.getItemProps({ item })} className={parts.item}>
                      {parts.glyph && <span className={parts.glyph}>{item.glyph}</span>}
                      <span {...api.getItemTextProps({ item })} className={parts.label}>
                        {item.label}
                      </span>
                      <span {...api.getItemIndicatorProps({ item })} className={parts.check}>
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
  rows,
  disabled,
  busy,
  tip,
  shake,
  className,
  id,
  triggerAttrs,
  listId,
  ref,
}: Inner<T>) {
  const uid = useId();
  const service = useMachine(menu.machine, {
    id: uid,
    ids: { trigger: id, content: listId },
    dir: pageDir(),
    "aria-label": label,
    positioning: SELECT_POSITIONING,
  });
  const api = menu.connect(service, normalizeProps);
  const all = flattenRuns(groups);
  const trigger = useTrigger({ all, value, onChange, inert: !!(disabled || busy), tip, disabled, shake, outer: ref });
  useEffect(() => (api.open ? closeOnPageMove(() => api.setOpen(false)) : undefined), [api.open]); // eslint-disable-line react-hooks/exhaustive-deps
  const hue = usePortalHue(api.open, trigger.ref);
  const glyphs = all.some((o) => o.glyph);
  const parts = selectRowParts(rows, glyphs);
  const subId = (gi: number, ei: number) => `${uid}-sub-${gi}-${ei}`;

  // Zag highlights on the frame after the list opens, so the home row goes one
  // frame later still.
  const home = homeRow(groups, value, subId);
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
  const { text } = faceLabels(all, value, placeholder, width);
  // While busy the trigger keeps focus but nothing reaches the machine.
  const hold = <E extends { preventDefault: () => void }>(fn?: (e: E) => void) =>
    (e: E) => {
      if (busy) e.preventDefault();
      else fn?.(e);
    };
  const positioner = api.getPositionerProps();

  return (
    <div data-glim="Select" className={selectRootClass(width)}>
      {!hideLabel && (
        <span aria-hidden="true" className="glim-field-label">
          {label}
        </span>
      )}
      <div>
        {trigger.tip.wrap(
          <button
            {...triggerAttrs}
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
            className={className}
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
        <div {...positioner} style={{ ...positioner.style, ...hue.style }} className={`glim-select-positioner ${hue.className}`.trim()}>
          <div {...api.getContentProps()} className={parts.content}>
            {groups.map((g, gi) => {
              if (g.entries.length === 0) return null;
              const id = `g${gi}`;
              return (
                <div key={gi} {...(g.heading ? api.getItemGroupProps({ id }) : {})} className="glim-select-group">
                  {g.heading && (
                    <div {...api.getItemGroupLabelProps({ htmlFor: id })} className={parts.heading}>
                      {g.heading}
                    </div>
                  )}
                  {g.entries.map((e, ei) =>
                    isSubmenu(e) ? (
                      <SubmenuList
                        key={`s${ei}`}
                        parent={service}
                        parentApi={api}
                        triggerId={subId(gi, ei)}
                        entry={e}
                        value={value}
                        onChange={onChange}
                        parts={parts}
                        hue={hue}
                      />
                    ) : (
                      <Choice key={e.value} api={api} option={e} value={value} onChange={onChange} parts={parts} />
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

function SubmenuList<T extends string>({
  parent,
  parentApi,
  triggerId,
  entry,
  value,
  onChange,
  parts,
  hue,
}: {
  parent: menu.Service;
  parentApi: menu.Api;
  triggerId: string;
  entry: SelectSubmenu<T>;
  value: T | null;
  onChange: (value: T) => void;
  parts: SelectRowParts;
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
      <div {...parentApi.getTriggerItemProps(api)} className={parts.item}>
        {parts.glyph && <span className={parts.glyph}>{entry.glyph}</span>}
        <span className={parts.label}>{entry.label}</span>
        <span aria-hidden="true" className={parts.caret}>
          <IconExpand />
        </span>
      </div>
      <Portal>
        <div {...positioner} style={{ ...positioner.style, ...hue.style }} className={`glim-select-positioner ${hue.className}`.trim()}>
          <div {...api.getContentProps()} className={parts.content}>
            {entry.options.map((o) => (
              <Choice key={o.value} api={api} option={o} value={value} onChange={onChange} parts={parts} />
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
  parts,
}: {
  api: menu.Api;
  option: SelectOption<T>;
  value: T | null;
  onChange: (value: T) => void;
  parts: SelectRowParts;
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
    <div {...api.getOptionItemProps(item)} className={parts.item}>
      {parts.glyph && <span className={parts.glyph}>{option.glyph}</span>}
      <span {...api.getItemTextProps(item)} className={parts.label}>
        {option.label}
      </span>
      <span aria-hidden="true" data-state={checked ? "checked" : "unchecked"} className={parts.check}>
        <IconCheck />
      </span>
    </div>
  );
}

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
  const { text, labels } = faceLabels(all, value, placeholder, width);
  return (
    <>
      {glyphs && <span className="glim-select-glyph">{all.find((o) => o.value === value)?.glyph}</span>}
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

/** What the two triggers share: the wheel, the tip bubble and the shake. */
function useTrigger<T extends string>(o: {
  all: SelectOption<T>[];
  value: T | null;
  onChange: (value: T) => void;
  inert: boolean;
  tip?: string;
  disabled?: boolean;
  shake?: number;
  outer?: Ref<HTMLButtonElement>;
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
      const next = wheelValue(all, value, delta);
      if (next !== undefined) onChange(next);
    });
  }, []);

  const count = o.shake ?? 0;
  useEffect(() => (ref.current && count > 0 ? shakeOnce(ref.current) : undefined), [count]);

  return {
    ref: ref as RefObject<HTMLElement | null>,
    tip,
    attach: (el: HTMLButtonElement | null) => {
      ref.current = el;
      tip.ref(el);
      if (typeof o.outer === "function") o.outer(el);
      else if (o.outer) o.outer.current = el;
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
