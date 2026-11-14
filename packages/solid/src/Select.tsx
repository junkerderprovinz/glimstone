import { createEffect, createMemo, createSignal, createUniqueId, For, mergeProps, on, onCleanup, onMount, Show, splitProps, type Accessor, type JSX } from "solid-js";
import * as menu from "@zag-js/menu";
import * as select from "@zag-js/select";
import { normalizeProps, useMachine } from "@zag-js/solid";
import {
  closeOnPageMove,
  endOption,
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
import { Lift } from "./Lift.tsx";
import { usePortalHue, type PortalHue } from "./portalHue.ts";
import { css } from "./style.ts";
import { TipWrap } from "./TipWrap.tsx";
import { useTipBubble } from "./useTipBubble.tsx";

// The one dropdown. Zag carries the behaviour the contract asks for (typeahead,
// Home and End, focus back on the trigger, dismissal, placement), and the
// select rules in tokens.css carry the look, so a page without a framework
// mounts the same machine through the core's mountSelect and looks the same.
//
// A list is Zag's select machine, a listbox. A list with a submenu is Zag's
// menu machine with radio items, since a listbox cannot nest. Both render into
// the portal target, so no card or scroll box can clip them.
//
// A glyph stands in the list and on the trigger at once, and a Solid node can
// stand in one place only, so a glyph is a function that draws a fresh one.

type Glyph = () => JSX.Element;
export type SelectOption<T extends string = string> = SelectChoice<T, Glyph>;
export type SelectSubmenu<T extends string = string> = Submenu<T, Glyph>;
export type SelectEntry<T extends string = string> = Entry<T, Glyph>;
export type SelectGroup<T extends string = string> = SelectRun<T, Glyph>;
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
  /** The trigger's id, for a `<label for>` outside the select. */
  id?: string;
  /** Attributes for the trigger, such as a data hook that says the value. */
  triggerAttrs?: Record<string, string>;
  /** The open list's id. */
  listId?: string;
  /** The trigger's own node, for a caller that hands it the focus. */
  ref?: HTMLButtonElement | ((el: HTMLButtonElement) => void);
  disabled?: boolean;
  /** A choice is out and its answer not back yet: the trigger keeps its focus but takes no input. */
  busy?: boolean;
  /** A hover bubble, for a trigger with no label beside it whose value does not say what it picks. */
  tip?: string;
  /** The caller's failure counter. Each bump shakes the trigger once, as the value snaps back. */
  shake?: number;
  /** Classes for the trigger, for a size the call site needs. */
  class?: string;
}

export function Select<T extends string = string>(props: SelectProps<T>) {
  const merged = mergeProps({ size: "field", rows: "list", wrap: false, class: "" } as const, props);
  const [own, rest] = splitProps(merged, ["size", "rows", "label", "hideLabel", "width", "wrap", "class", "options", "groups"]);
  const name = useFieldName(() => own.label);
  const fromRow = () => own.label === undefined;
  const runs = () => own.groups ?? [{ entries: own.options ?? [] }];
  const shared = {
    get label() {
      return name() ?? "";
    },
    get hideLabel() {
      return own.hideLabel || fromRow();
    },
    get width() {
      return own.width ?? (fromRow() ? "steady" : defaultWidth(own.size));
    },
    get rows() {
      return own.rows;
    },
    get groups() {
      return runs();
    },
    get class() {
      return `${selectTriggerClass(own.size, own.wrap)} ${own.class}`.trim();
    },
  };
  return (
    <Show when={hasSubmenu(runs())} fallback={<ListSelect {...rest} {...shared} />}>
      <MenuSelect {...rest} {...shared} />
    </Show>
  );
}

/** What the two machines take: the runs resolved and `class` the trigger's whole class list. */
type Inner<T extends string> = Omit<SelectProps<T>, "groups" | "options" | "label" | "width" | "size" | "rows" | "wrap"> & {
  label: string;
  groups: SelectGroup<T>[];
  width: SelectWidth;
  rows: SelectRows;
};

function ListSelect<T extends string>(props: Inner<T>) {
  const uid = createUniqueId();
  const all = createMemo(() => flattenRuns(props.groups));
  const service = useMachine(select.machine, () => ({
    id: uid,
    ids: { trigger: props.id, content: props.listId },
    dir: pageDir(),
    collection: select.collection({
      items: all(),
      itemToValue: (o) => o.value,
      itemToString: (o) => o.label,
      isItemDisabled: (o) => !!o.disabled,
    }),
    value: props.value === null ? [] : [props.value],
    disabled: props.disabled,
    readOnly: props.busy,
    onValueChange: (d: { value: string[] }) => {
      const next = d.value[0];
      if (next !== undefined && next !== props.value) props.onChange(next as T);
    },
    positioning: SELECT_POSITIONING,
  }));
  const api = createMemo(() => select.connect(service, normalizeProps));
  const trigger = useTrigger(props, all);
  createEffect(on(() => api().open, (open) => open && onCleanup(closeOnPageMove(() => api().setOpen(false)))));
  const hue = usePortalHue(() => api().open, trigger.el);
  const glyphs = () => all().some((o) => o.glyph);
  const parts = () => selectRowParts(props.rows, glyphs());
  const onKeyDown = (e: KeyboardEvent) => {
    const to = api().open ? undefined : endOption(all(), e.key);
    if (to === undefined) return (api().getTriggerProps().onKeyDown as ((e: KeyboardEvent) => void) | undefined)?.(e);
    e.preventDefault();
    api().setOpen(true);
    api().setHighlightValue(to);
  };

  return (
    <div data-glim="Select" {...api().getRootProps()} class={selectRootClass(props.width)}>
      <label {...api().getLabelProps()} class={props.hideLabel ? "glim-sr-only" : "glim-field-label"}>
        {props.label}
      </label>
      <div {...api().getControlProps()}>
        <TipWrap on={!!props.disabled && !!props.tip} show={trigger.tip.show} hide={trigger.tip.hide}>
          <button
            {...props.triggerAttrs}
            {...api().getTriggerProps()}
            onKeyDown={onKeyDown}
            ref={trigger.attach}
            {...trigger.handlers}
            aria-describedby={trigger.tip.describedBy()}
            aria-busy={props.busy || undefined}
            class={props.class}
          >
            <Face all={all()} value={props.value} placeholder={props.placeholder} width={props.width} glyphs={glyphs()} />
            <span {...api().getIndicatorProps()} class="glim-select-indicator">
              <IconExpand />
            </span>
          </button>
        </TipWrap>
      </div>
      {trigger.tip.bubble}
      <Lift>
        <Positioner attrs={api().getPositionerProps()} hue={hue}>
          <div {...api().getContentProps()} class={parts().content}>
            <For each={props.groups}>
              {(g, gi) => {
                const id = () => `${uid}-g${gi()}`;
                return (
                  <Show when={g.entries.length > 0}>
                    <div {...(g.heading ? api().getItemGroupProps({ id: id() }) : {})} class="glim-select-group">
                      <Show when={g.heading}>
                        <div {...api().getItemGroupLabelProps({ htmlFor: id() })} class={parts().heading}>
                          {g.heading}
                        </div>
                      </Show>
                      <For each={g.entries as SelectOption<T>[]}>
                        {(item) => (
                          <div {...api().getItemProps({ item })} class={parts().item}>
                            <Show when={parts().glyph}>
                              <span class={parts().glyph!}>{item.glyph?.()}</span>
                            </Show>
                            <span {...api().getItemTextProps({ item })} class={parts().label}>
                              {item.label}
                            </span>
                            <span {...api().getItemIndicatorProps({ item })} class={parts().check}>
                              <IconCheck />
                            </span>
                          </div>
                        )}
                      </For>
                    </div>
                  </Show>
                );
              }}
            </For>
          </div>
        </Positioner>
      </Lift>
      <select {...api().getHiddenSelectProps()} />
    </div>
  );
}

function MenuSelect<T extends string>(props: Inner<T>) {
  const uid = createUniqueId();
  const service = useMachine(menu.machine, () => ({
    id: uid,
    ids: { trigger: props.id, content: props.listId },
    dir: pageDir(),
    "aria-label": props.label,
    positioning: SELECT_POSITIONING,
  }));
  const api = createMemo(() => menu.connect(service, normalizeProps));
  const all = createMemo(() => flattenRuns(props.groups));
  const trigger = useTrigger(props, all);
  const hue = usePortalHue(() => api().open, trigger.el);
  const glyphs = () => all().some((o) => o.glyph);
  const parts = () => selectRowParts(props.rows, glyphs());
  const subId = (gi: number, ei: number) => `${uid}-sub-${gi}-${ei}`;

  createEffect(
    on(
      () => api().open,
      (open) => {
        if (!open) return;
        onCleanup(closeOnPageMove(() => api().setOpen(false)));
        // Zag highlights on the frame after the list opens, so the home row
        // goes one frame later still.
        const home = homeRow(props.groups, props.value, subId);
        if (home === null) return;
        let inner = 0;
        const outer = requestAnimationFrame(() => {
          inner = requestAnimationFrame(() => api().setHighlightedValue(home));
        });
        onCleanup(() => {
          cancelAnimationFrame(outer);
          cancelAnimationFrame(inner);
        });
      },
    ),
  );

  const text = () => faceLabels(all(), props.value, props.placeholder, props.width).text;
  // While busy the trigger keeps focus but nothing reaches the machine.
  const hold = (name: "onPointerDown" | "onClick" | "onKeyDown") => (e: Event) => {
    if (props.busy) e.preventDefault();
    else (api().getTriggerProps()[name] as ((e: Event) => void) | undefined)?.(e);
  };

  return (
    <div data-glim="Select" class={selectRootClass(props.width)}>
      <Show when={!props.hideLabel}>
        <span aria-hidden="true" class="glim-field-label">
          {props.label}
        </span>
      </Show>
      <div>
        <TipWrap on={!!props.disabled && !!props.tip} show={trigger.tip.show} hide={trigger.tip.hide}>
          <button
            {...props.triggerAttrs}
            {...api().getTriggerProps()}
            ref={trigger.attach}
            {...trigger.handlers}
            aria-describedby={trigger.tip.describedBy()}
            onPointerDown={hold("onPointerDown")}
            onClick={hold("onClick")}
            onKeyDown={hold("onKeyDown")}
            disabled={props.disabled}
            data-disabled={props.disabled ? "" : undefined}
            data-readonly={props.busy ? "" : undefined}
            aria-busy={props.busy || undefined}
            aria-label={`${props.label}: ${text()}`}
            class={props.class}
          >
            <Face all={all()} value={props.value} placeholder={props.placeholder} width={props.width} glyphs={glyphs()} />
            <span {...api().getIndicatorProps()} class="glim-select-indicator">
              <IconExpand />
            </span>
          </button>
        </TipWrap>
      </div>
      {trigger.tip.bubble}
      <Lift>
        <Positioner attrs={api().getPositionerProps()} hue={hue}>
          <div {...api().getContentProps()} class={parts().content}>
            <For each={props.groups}>
              {(g, gi) => {
                const id = () => `g${gi()}`;
                return (
                  <Show when={g.entries.length > 0}>
                    <div {...(g.heading ? api().getItemGroupProps({ id: id() }) : {})} class="glim-select-group">
                      <Show when={g.heading}>
                        <div {...api().getItemGroupLabelProps({ htmlFor: id() })} class={parts().heading}>
                          {g.heading}
                        </div>
                      </Show>
                      <For each={g.entries}>
                        {(e, ei) =>
                          isSubmenu(e) ? (
                            <SubmenuList
                              parent={service}
                              parentApi={api()}
                              triggerId={subId(gi(), ei())}
                              entry={e}
                              value={props.value}
                              onChange={props.onChange}
                              parts={parts()}
                              hue={hue}
                            />
                          ) : (
                            <Choice api={api()} option={e} value={props.value} onChange={props.onChange} parts={parts()} />
                          )
                        }
                      </For>
                    </div>
                  </Show>
                );
              }}
            </For>
          </div>
        </Positioner>
      </Lift>
    </div>
  );
}

function SubmenuList<T extends string>(props: {
  parent: menu.Service;
  parentApi: menu.Api;
  triggerId: string;
  entry: SelectSubmenu<T>;
  value: T | null;
  onChange: (value: T) => void;
  parts: SelectRowParts;
  hue: PortalHue;
}) {
  const id = createUniqueId();
  const service = useMachine(menu.machine, () => ({
    id,
    ids: { trigger: props.triggerId },
    dir: pageDir(),
    "aria-label": props.entry.label,
  }));
  const api = createMemo(() => menu.connect(service, normalizeProps));
  onMount(() => {
    props.parentApi.setChild(service);
    api().setParent(props.parent);
  });

  return (
    <>
      <div {...props.parentApi.getTriggerItemProps(api())} class={props.parts.item}>
        <Show when={props.parts.glyph}>
          <span class={props.parts.glyph!}>{props.entry.glyph?.()}</span>
        </Show>
        <span class={props.parts.label}>{props.entry.label}</span>
        <span aria-hidden="true" class={props.parts.caret}>
          <IconExpand />
        </span>
      </div>
      <Lift>
        <Positioner attrs={api().getPositionerProps()} hue={props.hue}>
          <div {...api().getContentProps()} class={props.parts.content}>
            <For each={props.entry.options}>
              {(o) => <Choice api={api()} option={o} value={props.value} onChange={props.onChange} parts={props.parts} />}
            </For>
          </div>
        </Positioner>
      </Lift>
    </>
  );
}

/** The positioner Zag places, in the trigger's palette position. */
function Positioner(props: { attrs: JSX.HTMLAttributes<HTMLDivElement>; hue: PortalHue; children: JSX.Element }) {
  return (
    <div
      {...props.attrs}
      style={{ ...(props.attrs.style as JSX.CSSProperties), ...css(props.hue.style()) }}
      class={`glim-select-positioner ${props.hue.className()}`.trim()}
    >
      {props.children}
    </div>
  );
}

function Choice<T extends string>(props: {
  api: menu.Api;
  option: SelectOption<T>;
  value: T | null;
  onChange: (value: T) => void;
  parts: SelectRowParts;
}) {
  const checked = () => props.option.value === props.value;
  const item = () => ({
    type: "radio" as const,
    value: props.option.value,
    valueText: props.option.label,
    checked: checked(),
    disabled: props.option.disabled,
    onCheckedChange: () => {
      if (!checked()) props.onChange(props.option.value);
    },
  });
  return (
    <div {...props.api.getOptionItemProps(item())} class={props.parts.item}>
      <Show when={props.parts.glyph}>
        <span class={props.parts.glyph!}>{props.option.glyph?.()}</span>
      </Show>
      <span {...props.api.getItemTextProps(item())} class={props.parts.label}>
        {props.option.label}
      </span>
      <span aria-hidden="true" data-state={checked() ? "checked" : "unchecked"} class={props.parts.check}>
        <IconCheck />
      </span>
    </div>
  );
}

function Face<T extends string>(props: { all: SelectOption<T>[]; value: T | null; placeholder?: string; width: SelectWidth; glyphs: boolean }) {
  const face = createMemo(() => faceLabels(props.all, props.value, props.placeholder, props.width));
  return (
    <>
      <Show when={props.glyphs}>
        <span class="glim-select-glyph">{props.all.find((o) => o.value === props.value)?.glyph?.()}</span>
      </Show>
      <span class="glim-select-value">
        <For each={face().labels}>
          {(l) => (
            <span aria-hidden={l !== face().text || undefined} class={l === face().text ? undefined : "glim-select-ghost"}>
              {l}
            </span>
          )}
        </For>
      </span>
    </>
  );
}

/** What the two triggers share: the wheel, the tip bubble and the shake. */
function useTrigger<T extends string>(props: Inner<T>, all: Accessor<SelectOption<T>[]>) {
  const [el, setEl] = createSignal<HTMLButtonElement>();
  const tip = useTipBubble(() => props.tip, () => !!props.disabled);

  createEffect(() => {
    const node = el();
    if (!node) return;
    onCleanup(
      enableWheelStep(node, (delta) => {
        if (props.disabled || props.busy) return;
        const next = wheelValue(all(), props.value, delta);
        if (next !== undefined) props.onChange(next);
      }),
    );
  });

  createEffect(
    on(
      () => props.shake ?? 0,
      (count) => {
        const node = el();
        if (node && count > 0) onCleanup(shakeOnce(node));
      },
    ),
  );

  return {
    el,
    tip,
    attach: (node: HTMLButtonElement) => {
      setEl(node);
      tip.ref(node);
      if (typeof props.ref === "function") props.ref(node);
    },
    /** The bubble's handlers, beside the machine's focusin and focusout. */
    handlers: {
      onFocus: tip.handlers.onFocus,
      onBlur: tip.handlers.onBlur,
      onMouseEnter: tip.handlers.onMouseEnter,
      onMouseLeave: tip.handlers.onMouseLeave,
    },
  };
}
