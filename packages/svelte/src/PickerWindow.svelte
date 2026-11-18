<script lang="ts" module>
  import type { Snippet } from "svelte";
  import type { PickGroup, PickItem, PickerText } from "@glimstone/core";
  import type { WindowAction } from "./WindowFootRow.svelte";

  export type { PickBadge, PickGroup, PickerText, TileMark } from "@glimstone/core";

  export type PickerItem = PickItem<Snippet>;

  export interface PickerWindowProps {
    /** The notch's words, also the window's accessible name. */
    title: string;
    /** What the picker is for, as the (i) in its notch. */
    hint?: string;
    /** The choices, sorted by their names in the page's language. */
    items: PickerItem[];
    /** The groups the items name, in the order they stand. Without them the tiles stand in one. */
    groups?: PickGroup[];
    text: PickerText;
    onPick: (id: string) => void;
    /** The picked tile's form, which takes the tiles' place until it is gone again. */
    children?: Snippet;
    /** The form's buttons, the forward one last. Cancel and Back stand before them. */
    actions?: WindowAction[];
    /** Back from the form to the tiles, with the search as it was. */
    onBack?: () => void;
    /** A quiet line at the start of the foot, such as the verdict of a test. */
    start?: string | Snippet;
    /** The id of the tile picked before, which stands marked and takes the focus when the tiles show. */
    selected?: string;
    /** Called for every way out: the foot, Escape and, while the tiles show, a press beside the window. */
    onClose: () => void;
  }
</script>

<script lang="ts">
  import { tick } from "svelte";
  import {
    fill,
    holdPickHeight,
    isTileMark,
    pageLocale,
    pickerHue,
    pickFocusTarget,
    pickMarkClass,
    pickSearchKey,
    pickSections,
    pickTileKey,
    pickTileStyle,
  } from "@glimstone/core";
  import Badge from "./Badge.svelte";
  import BrandMark from "./BrandMark.svelte";
  import GlyphField from "./GlyphField.svelte";
  import { IconBack, IconClose, IconSearch } from "./glyphs.js";
  import IconButton from "./IconButton.svelte";
  import InfoBubble from "./InfoBubble.svelte";
  import ReadmeButton from "./ReadmeButton.svelte";
  import { css } from "./style.js";
  import Window from "./Window.svelte";

  // A big picker ("Pickers and wizards" in design-language.md): the app's choices
  // as brand tiles in their groups, under a search that stands open at the top
  // end and narrows all of them at once. The arrows move across the grid, and a
  // click or Enter on a tile hands its id to onPick. The caller decides what
  // follows: it closes the window, or passes the picked tile's form as
  // children, which takes the tiles' place with Back and the form's actions in
  // the foot.
  let { title, hint, items, groups = [], text, onPick, children, actions = [], onBack, start, selected, onClose }: PickerWindowProps = $props();

  let query = $state("");
  const hue = pickerHue();
  let card: HTMLElement | null = $state(null);
  let search: HTMLInputElement | null = $state(null);
  let scroll: HTMLDivElement | undefined = $state();
  const form = $derived(!!children);
  $effect(() => {
    void form;
    void tick().then(() => {
      if (scroll) holdPickHeight(scroll);
      if (card) pickFocusTarget(card, scroll ?? null)?.focus();
    });
  });
  // Back keeps the window open, so it returns false.
  const back = $derived<WindowAction>({
    label: text.back,
    labelKey: "common.back",
    glyph: IconBack,
    onClick: () => {
      onBack?.();
      return false;
    },
  });

  const sections = $derived(pickSections(items, groups, query, pageLocale()));
  function used(e: KeyboardEvent, handled: boolean) {
    if (!handled) return;
    e.preventDefault();
    e.stopPropagation();
  }
  function onTileKey(e: KeyboardEvent) {
    if (e.target !== e.currentTarget) used(e, pickTileKey(e.key, e.target as Element, e.currentTarget as HTMLElement, search ?? null));
  }
</script>

{#snippet clearButton()}
  <IconButton
    tip={text.clear}
    glyph={IconClose}
    onclick={() => {
      query = "";
      search?.focus();
    }}
  />
{/snippet}

{#snippet notch()}{title}<InfoBubble tip={hint ?? ""} onAccent />{/snippet}

<Window
  data-glim="PickerWindow"
  {title}
  drawn={hint ? notch : undefined}
  class={["glim-pick-window", form && "glim-pick-window--form", hue && "glim-hue"].filter(Boolean).join(" ")}
  style={css(hue ?? undefined)}
  bind:ref={card}
  text={{ cancel: text.cancel, close: text.close }}
  {start}
  actions={form ? [back, ...actions] : [{ label: text.close, labelKey: "common.close", glyph: IconClose, wayOut: true }]}
  closeOnBackdrop={!form}
  {onClose}
>
  {#if children}
    {@render children()}
  {:else}
    <GlyphField
      bind:ref={search}
      bind:value={query}
      class="glim-pick-search"
      glyph={IconSearch}
      type="search"
      label={text.search}
      placeholder={text.search}
      spellcheck="false"
      autocomplete="off"
      onkeydown={(e) => used(e, pickSearchKey(e.key, query, scroll ?? null, () => (query = "")))}
      after={query ? clearButton : undefined}
    />
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div bind:this={scroll} class="glim-pick-scroll" onkeydown={onTileKey}>
      {#if sections.length === 0}
        <p class="glim-pick-none">{fill(text.none, { query: query.trim() })}</p>
      {:else}
        {#each sections as s (s.id)}
          <section class="glim-pick-section">
            {#if s.title}
              <div class="glim-pick-eyebrow">
                <h3 class="glim-eyebrow">{s.title}</h3>
                {#if s.badge}<Badge size="small" tone={s.badge.tone}>{s.badge.label}</Badge>{/if}
                {#if s.hint}<InfoBubble tip={s.hint} />{/if}
              </div>
            {/if}
            <ul class="glim-provider-pick">
              {#each s.items as item (item.id)}
                {#snippet brand()}{#if isTileMark(item.mark)}<BrandMark svg={item.mark.svg} hover={item.mark.hover} />{/if}{/snippet}
                <li style={css(pickTileStyle(item.mark))}>
                  <ReadmeButton
                    brand="house"
                    parts={[{ name: item.label, sub: item.sub, onClick: item.status ? undefined : () => onPick(item.id) }]}
                    soonLabel={item.status}
                    current={item.id === selected}
                    mark={isTileMark(item.mark) ? brand : (item.mark as Snippet | undefined)}
                    markClass={pickMarkClass(item.mark)}
                    hint={item.hint}
                    tip={item.tip}
                  />
                </li>
              {/each}
            </ul>
          </section>
        {/each}
      {/if}
    </div>
  {/if}
</Window>
