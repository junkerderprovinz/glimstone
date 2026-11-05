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
  DESKTOP_QUERY,
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
  watchSelectorRows,
  WIDE_QUERY,
  type SelectMode,
  type SelectorActivation,
  type SelectorFit,
  type SelectorOrientation,
  type SelectorRows,
  type SelectorSize,
  type SelectorVariant,
  type SelectorView,
} from "@glimstone/core";
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
  /** The accessible name of the strip, such as "Sort" or "Settings pages". */
  label: string;
  /** `one` picks a value, `many` toggles any number of them. Default `one`. */
  select?: M;
  /** The chosen id, or the chosen ids for `many`. */
  value: M extends "many" ? readonly V[] : V | null;
  /** Called with the new id, or the new list for `many`. */
  onChange: (next: M extends "many" ? V[] : V) => void;
  /** Called on every press, before the choice changes, also one on the segment already chosen. */
  onPress?: (id: V) => void;
  /** `vertical` is the column of tiles beside a settings area's pages. */
  orientation?: SelectorOrientation;
  size?: SelectorSize;
  variant?: SelectorVariant;
  /** "manual" moves the focus with the arrows and chooses on Space, Enter or a
   *  click, as a radio group; for a strip that saves a setting. */
  activation?: SelectorActivation;
  /** Pin every segment to the widest one's measured width, at least the shared
   *  floor where the row has room; the page-level picker. */
  equalWidth?: boolean;
  /** Hug the segments instead of spanning the box, for a strip that shares a
   *  toolbar row. */
  inline?: boolean;
  /** Keep every segment on one row, for page tabs: once the labels do not fit
   *  together every segment shows its glyph alone. */
  fit?: boolean;
  /** Below 600px, two segments to a row with labels that wrap. */
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
  inline = false,
  fit = false,
  pairsOnPhone = false,
  buttonHeight = false,
  hue = true,
  hueOffset,
  disabled = false,
  panelId,
  className = "",
}: SelectorProps<M, V>) {
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
    pairsOnPhone,
    hue,
    hueOffset,
    desktop: useMedia(DESKTOP_QUERY),
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
  const [rows, setRows] = useState<SelectorRows | null>(null);
  useLayoutEffect(() => {
    if (!strip.pinWidth) {
      setRows(null);
      return;
    }
    return watchSelectorRows(track.current!, { inline, equalWidth }, setRows);
  }, [strip.pinWidth, equalWidth, inline, itemsKey, disabledKey, size, strip.mode]);

  const [fitMode, setFitMode] = useState<SelectorFit>("even");
  useLayoutEffect(() => {
    if (!strip.canSqueeze) {
      setFitMode("even");
      return;
    }
    return watchSelectorFit(track.current!, setFitMode);
  }, [strip.canSqueeze, itemsKey, disabledKey, size]);

  const layout = selectorFlex({ rows, pinWidth: strip.pinWidth, inline, fit, fitMode, pairsOnPhone });
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
      role={strip.role}
      aria-label={label}
      aria-orientation={strip.role === "group" ? undefined : orientation}
      onKeyDown={onKeyDown}
      className={`${strip.className} ${className}`.trim()}
      style={layout.track as CSSProperties}
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
          share={vertical ? undefined : (layout.segment as CSSProperties)}
          squeezed={strip.canSqueeze && fitMode === "squeezed"}
          orientation={orientation}
          size={size}
          variant={variant}
          equalWidth={equalWidth}
          buttonHeight={buttonHeight}
          pairsOnPhone={pairsOnPhone}
          hue={hue}
          hueOffset={hueOffset}
          panelId={panelId}
          onSelect={() => choose(item.id)}
        />
      ))}
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
  share,
  squeezed,
  orientation,
  size,
  variant,
  equalWidth,
  buttonHeight,
  pairsOnPhone,
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
  share: CSSProperties | undefined;
  squeezed: boolean;
  orientation: SelectorOrientation;
  size: SelectorSize;
  variant: SelectorVariant;
  equalWidth: boolean;
  buttonHeight: boolean;
  pairsOnPhone: boolean;
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
    pairsOnPhone,
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
      disabled={disabled}
      tabIndex={roved ? 0 : -1}
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
