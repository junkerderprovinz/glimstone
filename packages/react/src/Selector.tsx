import {
  useId,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from "react";
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
import { useFieldName } from "./fieldName.ts";
import { Select } from "./Select.tsx";
import { useLabelMode } from "./useLabelMode.ts";
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
  /** Shown before the label; in a tab strip it is tinted with its tab's hue. */
  glyph?: ReactNode;
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
  className?: string;
}

function useMedia(query: string): boolean {
  return useSyncExternalStore(
    (fn) => subscribeMedia(query, fn),
    () => mediaMatches(query),
    () => true,
  );
}

export function Selector<M extends SelectMode = "one", V extends string | number = string>({
  items,
  label,
  select,
  value,
  onChange,
  onPress,
  orientation = "horizontal",
  size = "md",
  variant = "well",
  activation = "auto",
  equalWidth = false,
  inline: ownInline = false,
  fit = false,
  buttonHeight = false,
  hue = true,
  hueOffset,
  disabled = false,
  panelId,
  className = "",
}: SelectorProps<M, V>) {
  const name = useFieldName(label);
  const inline = ownInline || (label === undefined && name !== undefined);
  const vertical = orientation === "vertical";
  const many = select === "many";
  const mode = useLabelMode(selectorAxis(size, orientation));
  const strip = selectorView({
    mode,
    select: many ? "many" : "one",
    activation,
    orientation,
    size,
    variant,
    equalWidth,
    inline,
    fit,
    hue,
    hueOffset,
    wide: useMedia(WIDE_QUERY),
    items: items.map((it) => ({ hasGlyph: !!it.glyph, iconOnly: !!it.iconOnly })),
  });
  const track = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (strip.counted) return countSelector(track.current!);
  }, [strip.counted]);

  // The labels stand in for `items` in the deps: callers rebuild the array on
  // every render, and measuring each time would be wasted work. A segment that
  // turns disabled with a tip is mounted afresh inside the bubble's box, so the
  // watch moves to it through disabledKey.
  const itemsKey = items.map((it) => it.label).join("\n");
  const disabledKey = items.map((it) => (disabled || it.disabled ? "1" : "0")).join("");
  const [layout, setLayout] = useState<SelectorLayout | null>(null);
  useLayoutEffect(() => {
    if (vertical) {
      setLayout(null);
      return;
    }
    const { pinWidth, canSqueeze, canList } = strip;
    return watchSelectorFit(track.current!, { pinWidth, fit, canSqueeze, canList }, setLayout);
  }, [vertical, strip.pinWidth, fit, strip.canSqueeze, strip.canList, inline, itemsKey, disabledKey, size, strip.mode]);

  const flex = selectorFlex({ layout, inline, fit });
  const listed = layout?.fit === "list";
  const chosen = many ? (value as readonly V[]) : null;
  const isOn = (id: V) => (chosen ? chosen.includes(id) : value === id);
  const disabledFlags = items.map((it) => disabled || !!it.disabled);
  const roved = rovedIndex(disabledFlags, items.findIndex((it) => isOn(it.id)));

  function choose(id: V) {
    onPress?.(id);
    const change = onChange as (next: V | V[]) => void;
    change(chosen ? toggleSelection(chosen, id, items.map((it) => it.id)) : id);
  }

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    // The dropdown's keys reach the track through the portal too.
    if (listed) return;
    // A tile is a link, and Space does not follow a link on its own.
    if (vertical && e.key === " " && (e.target as HTMLElement).dataset.selId) {
      e.preventDefault();
      (e.target as HTMLElement).click();
      return;
    }
    const node = roveSelector(track.current!, e.key, orientation);
    if (!node) return;
    e.preventDefault();
    const item = items.find((it) => String(it.id) === node.dataset.selId);
    if (strip.autoSelect && item) choose(item.id);
  }

  return (
    <div
      ref={track}
      role={listed ? undefined : strip.role}
      aria-label={listed ? undefined : name}
      aria-orientation={listed || strip.role === "group" ? undefined : orientation}
      onKeyDown={onKeyDown}
      className={`${strip.className}${listed ? " glim-sel--listed" : ""} ${className}`.trim()}
      style={flex.track as CSSProperties}
    >
      {items.map((item, i) => (
        <Segment
          key={item.id}
          item={item}
          index={i}
          strip={strip}
          on={isOn(item.id)}
          disabled={disabledFlags[i]}
          roved={i === roved}
          listed={listed}
          share={vertical ? undefined : (flex.segment as CSSProperties)}
          squeezed={layout?.fit === "squeezed"}
          cut={!!layout?.cut[i]}
          orientation={orientation}
          size={size}
          variant={variant}
          equalWidth={equalWidth}
          buttonHeight={buttonHeight}
          hue={hue}
          hueOffset={hueOffset}
          panelId={panelId}
          onSelect={() => choose(item.id)}
        />
      ))}
      {listed && (
        <div className="glim-sel-list">
          <Select
            label={name ?? ""}
            hideLabel
            wrap
            width="fill"
            size={size === "sm" ? "row" : "field"}
            options={items.map((it, i) => ({ value: String(it.id), label: it.label, glyph: it.glyph, disabled: disabledFlags[i] }))}
            value={value === null ? null : String(value)}
            onChange={(next) => {
              const item = items.find((it) => String(it.id) === next);
              if (item) choose(item.id);
            }}
            disabled={disabledFlags.every(Boolean)}
          />
        </div>
      )}
    </div>
  );
}

// One segment or tile, a component of its own so each holds its own bubble.
function Segment({
  item,
  index,
  strip,
  on,
  disabled,
  roved,
  listed,
  share,
  squeezed,
  cut,
  orientation,
  size,
  variant,
  equalWidth,
  buttonHeight,
  hue,
  hueOffset,
  panelId,
  onSelect,
}: {
  item: SelectorItem<string | number>;
  index: number;
  strip: SelectorView;
  on: boolean;
  disabled: boolean;
  roved: boolean;
  /** The strip shows its dropdown, and the segment is only there to be measured. */
  listed: boolean;
  share: CSSProperties | undefined;
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
  const view = segmentView({
    strip,
    orientation,
    size,
    variant,
    equalWidth,
    buttonHeight,
    hue,
    hueOffset,
    index,
    label: item.label,
    hasGlyph: !!item.glyph,
    iconOnly: !!item.iconOnly,
    tip: item.tip,
    title: item.title,
    on,
    disabled,
    dim: item.dim,
    squeezed,
    cut,
  });
  const tooltip = useTipBubble(view.tip, disabled);
  // A disabled segment takes no hover or focus, so its reason is a
  // description from the start rather than one that exists only while the
  // bubble is open.
  const descId = useId();
  const described = disabled && view.tip ? descId : tooltip.describedBy;
  const tab = strip.kind === "tab";
  const content = (
    <>
      {view.showGlyph && item.glyph}
      {view.labelClass !== null && (
        <span data-sel-label className={view.labelClass}>
          {item.label}
        </span>
      )}
    </>
  );
  const style = { ...view.style, ...share } as CSSProperties;

  if (orientation === "vertical") {
    const open = (e: MouseEvent<HTMLAnchorElement>) => {
      // A plain click stays in the app; a modified one opens the address
      // beside it, as a link does.
      if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey || e.button !== 0) return;
      e.preventDefault();
      onSelect();
    };
    return (
      <>
        <a
          {...item.attrs}
          ref={tooltip.ref}
          href={item.href}
          data-sel-id={item.id}
          role="tab"
          aria-selected={on}
          aria-current={on ? "page" : undefined}
          aria-describedby={described}
          tabIndex={roved ? 0 : -1}
          className={view.className}
          style={style}
          onClick={open}
          {...tooltip.handlers}
        >
          {content}
        </a>
        {tooltip.bubble}
      </>
    );
  }

  const button = (
    <button
      {...item.attrs}
      ref={tooltip.ref}
      type="button"
      data-sel-id={item.id}
      id={panelId && tab ? selectorTabId(panelId, item.id) : undefined}
      role={strip.kind === "toggle" ? undefined : strip.kind}
      aria-selected={tab ? on : undefined}
      aria-controls={panelId && tab && on ? panelId : undefined}
      aria-checked={strip.kind === "radio" ? on : undefined}
      aria-pressed={strip.kind === "toggle" ? on : undefined}
      aria-label={view.ariaLabel}
      aria-describedby={described}
      aria-hidden={listed || undefined}
      disabled={disabled}
      tabIndex={roved && !listed ? 0 : -1}
      className={view.className}
      style={style}
      onClick={onSelect}
      {...tooltip.handlers}
    >
      {content}
    </button>
  );
  return (
    <>
      {disabled && view.tip ? (
        <span className="glim-tip-wrap" style={share} onMouseEnter={tooltip.show} onMouseLeave={tooltip.hide}>
          {button}
        </span>
      ) : (
        button
      )}
      {disabled && view.tip && (
        <span id={descId} hidden>
          {view.tip}
        </span>
      )}
      {tooltip.bubble}
    </>
  );
}
