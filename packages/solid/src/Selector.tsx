import { createEffect, createMemo, createSignal, createUniqueId, For, mergeProps, on, onCleanup, Show, type JSX } from "solid-js";
import {
  countSelector,
  mediaMatches,
  roveSelector,
  rovedIndex,
  segmentView,
  selectorAxis,
  selectorFlex,
  selectorTabId,
  selectorView,
  subscribeMedia,
  toggleSelection,
  watchSelectorFit,
  WIDE_QUERY,
  type SelectMode,
  type SelectorActivation,
  type SelectorLayout,
  type SelectorOrientation,
  type SelectorSize,
  type SelectorVariant,
  type SelectorView,
} from "@glimstone/core";
import { useLabelMode } from "./engines.ts";
import { useFieldName } from "./fieldName.ts";
import { Select } from "./Select.tsx";
import { css } from "./style.ts";
import { useTipBubble } from "./useTipBubble.tsx";

export type { SelectMode, SelectorActivation, SelectorOrientation, SelectorSize, SelectorVariant } from "@glimstone/core";
export { selectorTabId } from "@glimstone/core";

// The one horizontal selector and its vertical form; roles, classes, layout
// and keys come from selector.ts in the core.
//
// A caption such as "Sort by:" belongs in a plain <span> outside it, not a
// <label> around the row: a label around several segments hands its clicks to
// the first one and gives a screen reader that segment's name.
//
// A strip of one whose labels do not fit its row shows the one dropdown in
// their place, inside the track, so the track keeps the box it measures.

export interface SelectorItem<V extends string | number = string> {
  /** Stable id, handed back by onChange as it stands here. */
  id: V;
  label: string;
  /** Shown before the label; in a tab strip it is tinted with its tab's hue.
   *  A function that draws a fresh one, since a strip that turns into its
   *  dropdown shows it in the list and on the trigger at once. */
  glyph?: () => JSX.Element;
  disabled?: boolean;
  /** Why the segment is in its state, such as "Pick a folder first" on a
   *  disabled one. It goes into the bubble, which a keyboard reaches. */
  title?: string;
  /** The fuller version of a terse label, shown in the bubble. */
  tip?: string;
  /** Shows the glyph alone in every mode but text; the label stays the name. */
  iconOnly?: boolean;
  /** Tiles only: the page's own address, so a tile can open in a new tab. */
  href?: string;
  /** Tiles only: a page with nothing on it yet, dimmed rather than hidden. */
  dim?: boolean;
  /** Attributes for the item's own segment, such as a data hook. */
  attrs?: Record<string, string>;
}

export interface SelectorProps<M extends SelectMode = "one", V extends string | number = string> {
  items: SelectorItem<V>[];
  /** The accessible name of the strip, such as "Sort" or "Settings pages". Inside a FieldRow the row gives it. */
  label?: string;
  /** `one` picks a value, `many` toggles any number of them. Default `one`. */
  select?: M;
  /** The chosen id, or the chosen ids for `many`. */
  value: M extends "many" ? readonly V[] : V | null;
  /** Called with the new id, or the new list for `many`. */
  onChange: (next: M extends "many" ? V[] : V) => void;
  /** Called on every press and every arrow key that chooses, before the choice changes, also one on the segment already chosen. */
  onPress?: (id: V) => void;
  /** `vertical` is the column of tiles beside a settings area's pages. */
  orientation?: SelectorOrientation;
  size?: SelectorSize;
  variant?: SelectorVariant;
  /** "manual" moves the focus with the arrows and chooses on Space, Enter or a
   *  click, as a radio group; for a strip that saves a setting. */
  activation?: SelectorActivation;
  /** Pin every segment to the widest one's measured width, at least the shared
   *  floor where the row has room; the page-level picker. Where the pinned
   *  widths do not fit the row, the segments share it by their labels. */
  equalWidth?: boolean;
  /** Hug the segments instead of spanning the box, for a strip that shares a
   *  toolbar row, as it does inside a FieldRow. */
  inline?: boolean;
  /** Share the row evenly without a pinned width, for page tabs. Every strip
   *  keeps to one row; once its labels do not fit together it shows glyphs
   *  alone where every segment has one, a strip of one turns into a dropdown
   *  otherwise, and a `many` strip cuts its labels short. */
  fit?: boolean;
  /** Has no effect: every strip keeps to one row. */
  pairsOnPhone?: boolean;
  /** The button height for every segment, for a strip beside a Button. */
  buttonHeight?: boolean;
  /** Take a colour under rainbow. Turn it off where the colour means nothing,
   *  such as a strip of one, not for looks. */
  hue?: boolean;
  /** Makes the strip a tab strip for colour: each segment keeps its own
   *  palette position, counting from here. */
  hueOffset?: number;
  /** Disables every item; an item's own `disabled` applies on top. */
  disabled?: boolean;
  /** The id of the panel a tab strip switches. The chosen tab controls it, and
   *  the panel names itself with `aria-labelledby={selectorTabId(panelId, id)}`. */
  panelId?: string;
  class?: string;
}

function useMedia(query: string) {
  const [on, setOn] = createSignal(mediaMatches(query));
  onCleanup(subscribeMedia(query, () => setOn(mediaMatches(query))));
  return on;
}

export function Selector<M extends SelectMode = "one", V extends string | number = string>(props: SelectorProps<M, V>) {
  const merged = mergeProps(
    {
      orientation: "horizontal",
      size: "md",
      variant: "well",
      activation: "auto",
      equalWidth: false,
      inline: false,
      fit: false,
      buttonHeight: false,
      hue: true,
      disabled: false,
      class: "",
    } as const,
    props,
  );
  const name = useFieldName(() => merged.label);
  const inline = () => merged.inline || (merged.label === undefined && name() !== undefined);
  const vertical = () => merged.orientation === "vertical";
  const many = () => merged.select === "many";
  const mode = useLabelMode(selectorAxis(merged.size, merged.orientation));
  const wide = useMedia(WIDE_QUERY);
  const strip = createMemo(() =>
    selectorView({
      mode: mode(),
      select: many() ? "many" : "one",
      activation: merged.activation,
      orientation: merged.orientation,
      size: merged.size,
      variant: merged.variant,
      equalWidth: merged.equalWidth,
      inline: inline(),
      fit: merged.fit,
      hue: merged.hue,
      hueOffset: merged.hueOffset,
      wide: wide(),
      items: merged.items.map((it) => ({ hasGlyph: !!it.glyph, iconOnly: !!it.iconOnly })),
    }),
  );
  let track!: HTMLDivElement;

  createEffect(() => {
    if (strip().counted) onCleanup(countSelector(track));
  });

  // Measured again only when something it measures changes, not on every
  // choice. A segment that turns disabled with a tip is mounted afresh inside
  // the bubble's box, so the watch moves to it through the disabled flags.
  const [layout, setLayout] = createSignal<SelectorLayout | null>(null);
  const fitKey = createMemo(() =>
    [
      vertical(),
      strip().pinWidth,
      merged.fit,
      strip().canSqueeze,
      strip().canList,
      inline(),
      merged.items.map((it) => it.label).join("\n"),
      merged.items.map((it) => (merged.disabled || it.disabled ? "1" : "0")).join(""),
      merged.size,
      strip().mode,
    ].join("|"),
  );
  createEffect(
    on(fitKey, () => {
      if (vertical()) return setLayout(null);
      const { pinWidth, canSqueeze, canList } = strip();
      onCleanup(watchSelectorFit(track, { pinWidth, fit: merged.fit, canSqueeze, canList }, setLayout));
    }),
  );

  const flex = createMemo(() => selectorFlex({ layout: layout(), inline: inline(), fit: merged.fit }));
  const listed = () => layout()?.fit === "list";
  const chosen = () => (many() ? (merged.value as readonly V[]) : null);
  const isOn = (id: V) => {
    const list = chosen();
    return list ? list.includes(id) : merged.value === id;
  };
  const disabledFlags = createMemo(() => merged.items.map((it) => merged.disabled || !!it.disabled));
  const roved = createMemo(() => rovedIndex(disabledFlags(), merged.items.findIndex((it) => isOn(it.id))));

  function choose(id: V) {
    merged.onPress?.(id);
    const change = merged.onChange as (next: V | V[]) => void;
    const list = chosen();
    change(list ? toggleSelection(list, id, merged.items.map((it) => it.id)) : id);
  }

  function onKeyDown(e: KeyboardEvent) {
    // The dropdown's keys reach the track through the portal too.
    if (listed()) return;
    const target = e.target as HTMLElement;
    // A tile is a link, and Space does not follow a link on its own.
    if (vertical() && e.key === " " && target.dataset.selId) {
      e.preventDefault();
      target.click();
      return;
    }
    const node = roveSelector(track, e.key, merged.orientation);
    if (!node) return;
    e.preventDefault();
    const item = merged.items.find((it) => String(it.id) === node.dataset.selId);
    if (strip().autoSelect && item) choose(item.id);
  }

  return (
    <div
      data-glim="Selector"
      ref={track}
      role={listed() ? undefined : strip().role}
      aria-label={listed() ? undefined : name()}
      aria-orientation={listed() || strip().role === "group" ? undefined : merged.orientation}
      onKeyDown={onKeyDown}
      class={`${strip().className}${listed() ? " glim-sel--listed" : ""} ${merged.class}`.trim()}
      style={css(flex().track)}
    >
      <For each={merged.items}>
        {(item, i) => (
          <Segment
            item={item}
            index={i()}
            strip={strip()}
            on={isOn(item.id)}
            disabled={disabledFlags()[i()]!}
            roved={i() === roved()}
            listed={listed()}
            share={vertical() ? undefined : flex().segment}
            squeezed={layout()?.fit === "squeezed"}
            cut={!!layout()?.cut[i()]}
            orientation={merged.orientation}
            size={merged.size}
            variant={merged.variant}
            equalWidth={merged.equalWidth}
            buttonHeight={merged.buttonHeight}
            hue={merged.hue}
            hueOffset={merged.hueOffset}
            panelId={merged.panelId}
            onSelect={() => choose(item.id)}
          />
        )}
      </For>
      <Show when={listed()}>
        <div class="glim-sel-list">
          <Select
            label={name() ?? ""}
            hideLabel
            wrap
            width="fill"
            size={merged.size === "sm" ? "row" : "field"}
            options={merged.items.map((it, i) => ({ value: String(it.id), label: it.label, glyph: it.glyph, disabled: disabledFlags()[i] }))}
            value={merged.value === null ? null : String(merged.value)}
            onChange={(next) => {
              const item = merged.items.find((it) => String(it.id) === next);
              if (item) choose(item.id);
            }}
            disabled={disabledFlags().every(Boolean)}
          />
        </div>
      </Show>
    </div>
  );
}

// One segment or tile, a component of its own so each holds its own bubble.
function Segment(props: {
  item: SelectorItem<string | number>;
  index: number;
  strip: SelectorView;
  on: boolean;
  disabled: boolean;
  roved: boolean;
  /** The strip shows its dropdown, and the segment is only there to be measured. */
  listed: boolean;
  share: Record<string, string> | undefined;
  squeezed: boolean;
  cut: boolean;
  orientation: SelectorOrientation;
  size: SelectorSize;
  variant: SelectorVariant;
  equalWidth: boolean;
  buttonHeight: boolean;
  hue: boolean;
  hueOffset?: number;
  panelId?: string;
  onSelect: () => void;
}) {
  const view = createMemo(() =>
    segmentView({
      strip: props.strip,
      orientation: props.orientation,
      size: props.size,
      variant: props.variant,
      equalWidth: props.equalWidth,
      buttonHeight: props.buttonHeight,
      hue: props.hue,
      hueOffset: props.hueOffset,
      index: props.index,
      label: props.item.label,
      hasGlyph: !!props.item.glyph,
      iconOnly: !!props.item.iconOnly,
      tip: props.item.tip,
      title: props.item.title,
      on: props.on,
      disabled: props.disabled,
      dim: props.item.dim,
      squeezed: props.squeezed,
      cut: props.cut,
    }),
  );
  const tooltip = useTipBubble(() => view().tip, () => props.disabled);
  // A disabled segment takes no hover or focus, so its reason is a
  // description from the start rather than one that exists only while the
  // bubble is open.
  const descId = createUniqueId();
  const hiddenTip = () => props.disabled && !!view().tip;
  const described = () => (hiddenTip() ? descId : tooltip.describedBy());
  const tab = () => props.strip.kind === "tab";
  const style = () => ({ ...css(view().style), ...css(props.share) });
  const content = () => (
    <>
      <Show when={view().showGlyph}>{props.item.glyph?.()}</Show>
      <Show when={view().labelClass !== null}>
        <span data-sel-label class={view().labelClass!}>
          {props.item.label}
        </span>
      </Show>
    </>
  );

  // A plain click stays in the app; a modified one opens the address beside
  // it, as a link does.
  const open = (e: MouseEvent) => {
    if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    props.onSelect();
  };

  const button = () => (
    <button
      {...props.item.attrs}
      ref={tooltip.ref}
      type="button"
      data-sel-id={props.item.id}
      id={props.panelId && tab() ? selectorTabId(props.panelId, props.item.id) : undefined}
      role={props.strip.kind === "toggle" ? undefined : props.strip.kind}
      aria-selected={tab() ? props.on : undefined}
      aria-controls={props.panelId && tab() && props.on ? props.panelId : undefined}
      aria-checked={props.strip.kind === "radio" ? props.on : undefined}
      aria-pressed={props.strip.kind === "toggle" ? props.on : undefined}
      aria-label={view().ariaLabel}
      aria-describedby={described()}
      aria-hidden={props.listed || undefined}
      disabled={props.disabled}
      tabindex={props.roved && !props.listed ? 0 : -1}
      class={view().className}
      style={style()}
      onClick={() => props.onSelect()}
      {...tooltip.handlers}
    >
      {content()}
    </button>
  );

  return (
    <>
      <Show
        when={props.orientation === "vertical"}
        fallback={
          <>
            <Show when={hiddenTip()} fallback={button()}>
              <span class="glim-tip-wrap" style={css(props.share)} onMouseEnter={tooltip.show} onMouseLeave={tooltip.hide}>
                {button()}
              </span>
            </Show>
            <Show when={hiddenTip()}>
              <span id={descId} hidden>
                {view().tip}
              </span>
            </Show>
          </>
        }
      >
        <a
          {...props.item.attrs}
          ref={tooltip.ref}
          href={props.item.href}
          data-sel-id={props.item.id}
          role="tab"
          aria-selected={props.on}
          aria-current={props.on ? "page" : undefined}
          aria-describedby={described()}
          tabindex={props.roved ? 0 : -1}
          class={view().className}
          style={style()}
          onClick={open}
          {...tooltip.handlers}
        >
          {content()}
        </a>
      </Show>
      {tooltip.bubble}
    </>
  );
}
