<script lang="ts" module>
  import type { SelectMode, SelectorActivation, SelectorOrientation, SelectorSize, SelectorVariant } from "@glimstone/core";
  import type { SelectorItem } from "./selectorItem.js";

  export type { SelectMode, SelectorActivation, SelectorOrientation, SelectorSize, SelectorVariant } from "@glimstone/core";
  export type { SelectorItem } from "./selectorItem.js";
  export { selectorTabId } from "@glimstone/core";

  export interface SelectorProps<M extends SelectMode = "one", V extends string | number = string> {
    items: SelectorItem<V>[];
    /** The accessible name of the strip, such as "Sort" or "Settings pages". Inside a FieldRow the row gives it. */
    label?: string;
    /** `one` picks a value, `many` toggles any number of them. Default `one`. */
    select?: M;
    /** The chosen id, or the chosen ids for `many`, bound with `bind:value`. */
    value: M extends "many" ? readonly V[] : V | null;
    /** Called with the new id, or the new list for `many`. */
    onChange?: (next: M extends "many" ? V[] : V) => void;
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
</script>

<script lang="ts" generics="M extends SelectMode = 'one', V extends string | number = string">
  import { untrack } from "svelte";
  import {
    countSelector,
    mediaMatches,
    roveSelector,
    rovedIndex,
    selectorAxis,
    selectorFlex,
    selectorView,
    subscribeMedia,
    toggleSelection,
    watchSelectorFit,
    WIDE_QUERY,
    type SelectorLayout,
  } from "@glimstone/core";
  import { useLabelMode } from "./engines.svelte.js";
  import { useFieldName } from "./fieldName.js";
  import Select from "./Select.svelte";
  import SelectorSegment from "./SelectorSegment.svelte";

  // The one horizontal selector and its vertical form; roles, classes, layout
  // and keys come from selector.ts in the core.
  //
  // A caption such as "Sort by:" belongs in a plain <span> outside it, not a
  // <label> around the row: a label around several segments hands its clicks to
  // the first one and gives a screen reader that segment's name.
  //
  // A strip of one whose labels do not fit its row shows the one dropdown in
  // their place, inside the track, so the track keeps the box it measures.
  let {
    items,
    label,
    select,
    value = $bindable(),
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
    class: className = "",
  }: SelectorProps<M, V> = $props();

  const name = useFieldName(() => label);
  const inline = $derived(ownInline || (label === undefined && name() !== undefined));
  const vertical = $derived(orientation === "vertical");
  const many = $derived(select === "many");
  // svelte-ignore state_referenced_locally
  const mode = useLabelMode(selectorAxis(size, orientation));
  let wide = $state(mediaMatches(WIDE_QUERY));
  $effect(() => subscribeMedia(WIDE_QUERY, () => (wide = mediaMatches(WIDE_QUERY))));
  const strip = $derived(
    selectorView({
      mode: mode.current,
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
      wide,
      items: items.map((it) => ({ hasGlyph: !!it.glyph, iconOnly: !!it.iconOnly })),
    }),
  );
  let track: HTMLDivElement;

  $effect(() => {
    if (strip.counted) return countSelector(track);
  });

  // Measured again only when something it measures changes, not on every
  // choice. A segment that turns disabled with a tip is mounted afresh inside
  // the bubble's box, so the watch moves to it through the disabled flags.
  let layout = $state<SelectorLayout | null>(null);
  const fitKey = $derived(
    [
      vertical,
      strip.pinWidth,
      fit,
      strip.canSqueeze,
      strip.canList,
      inline,
      items.map((it) => it.label).join("\n"),
      items.map((it) => (disabled || it.disabled ? "1" : "0")).join(""),
      size,
      strip.mode,
    ].join("|"),
  );
  $effect(() => {
    void fitKey;
    return untrack(() => {
      if (vertical) {
        layout = null;
        return;
      }
      const { pinWidth, canSqueeze, canList } = strip;
      return watchSelectorFit(track, { pinWidth, fit, canSqueeze, canList }, (next) => (layout = next));
    });
  });

  const flex = $derived(selectorFlex({ layout, inline, fit }));

  // countSelector writes the strip's colour onto the track's style itself, so
  // the layout's properties go on one by one rather than as style text.
  $effect(() => {
    const props = Object.entries(flex.track).map(([key, v]) => [key.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`), v] as const);
    for (const [key, v] of props) track.style.setProperty(key, v);
    return () => props.forEach(([key]) => track.style.removeProperty(key));
  });

  const listed = $derived(layout?.fit === "list");
  const chosen = $derived(many ? (value as readonly V[]) : null);
  const isOn = (id: V) => (chosen ? chosen.includes(id) : value === id);
  const disabledFlags = $derived(items.map((it) => disabled || !!it.disabled));
  const roved = $derived(rovedIndex(disabledFlags, items.findIndex((it) => isOn(it.id))));

  function choose(id: V) {
    onPress?.(id);
    const next = (chosen ? toggleSelection(chosen, id, items.map((it) => it.id)) : id) as M extends "many" ? V[] : V;
    value = next;
    onChange?.(next);
  }

  function onKeyDown(e: KeyboardEvent) {
    // The dropdown's keys reach the track through the portal too.
    if (listed) return;
    const target = e.target as HTMLElement;
    // A tile is a link, and Space does not follow a link on its own.
    if (vertical && e.key === " " && target.dataset.selId) {
      e.preventDefault();
      target.click();
      return;
    }
    const node = roveSelector(track, e.key, orientation);
    if (!node) return;
    e.preventDefault();
    const item = items.find((it) => String(it.id) === node.dataset.selId);
    if (strip.autoSelect && item) choose(item.id);
  }
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  data-glim="Selector"
  bind:this={track}
  role={listed ? undefined : strip.role}
  aria-label={listed ? undefined : name()}
  aria-orientation={listed || strip.role === "group" ? undefined : orientation}
  onkeydown={onKeyDown}
  class={`${strip.className}${listed ? " glim-sel--listed" : ""} ${className}`.trim()}
>
  {#each items as item, i (item.id)}
    <SelectorSegment
      {item}
      index={i}
      {strip}
      on={isOn(item.id)}
      disabled={disabledFlags[i]!}
      roved={i === roved}
      {listed}
      share={vertical ? undefined : flex.segment}
      squeezed={layout?.fit === "squeezed"}
      cut={!!layout?.cut[i]}
      {orientation}
      {size}
      {variant}
      {equalWidth}
      {buttonHeight}
      {hue}
      {hueOffset}
      {panelId}
      onSelect={() => choose(item.id)}
    />
  {/each}
  {#if listed}
    <div class="glim-sel-list">
      <Select
        label={name() ?? ""}
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
  {/if}
</div>
