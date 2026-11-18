<script lang="ts" module>
  import type { Snippet } from "svelte";
  import type { PickGroup, PickItem, PickerText } from "@glimstone/core";
  import type { WindowAction } from "./WindowFootRow.svelte";

  export type { PickGroup, PickerText, TileMark } from "@glimstone/core";

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
    /** Called for every way out: the foot, Escape and a press beside the window. */
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
    pickSearchKey,
    pickSections,
    pickTileKey,
    pickTileStyle,
    windowFocusTarget,
  } from "@glimstone/core";
  import BrandMark from "./BrandMark.svelte";
  import { IconBack, IconClose } from "./glyphs.js";
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
  let { title, hint, items, groups = [], text, onPick, children, actions = [], onBack, onClose }: PickerWindowProps = $props();

  let query = $state("");
  let card: HTMLElement | null = $state(null);
  let search: HTMLInputElement | undefined = $state();
  let scroll: HTMLDivElement | undefined = $state();
  const form = $derived(!!children);
  $effect(() => {
    void form;
    void tick().then(() => {
      if (scroll) holdPickHeight(scroll);
      if (card) windowFocusTarget(card)?.focus();
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

{#snippet notch()}{title}<InfoBubble tip={hint ?? ""} onAccent />{/snippet}

<Window
  data-glim="PickerWindow"
  {title}
  drawn={hint ? notch : undefined}
  class="glim-pick-window"
  bind:ref={card}
  text={{ cancel: text.cancel, close: text.close }}
  actions={form ? [back, ...actions] : [{ label: text.close, labelKey: "common.close", glyph: IconClose, wayOut: true }]}
  {onClose}
>
  {#if children}
    {@render children()}
  {:else}
    <input
      bind:this={search}
      bind:value={query}
      class="glim-input glim-pick-search"
      type="search"
      aria-label={text.search}
      placeholder={text.search}
      spellcheck="false"
      autocomplete="off"
      onkeydown={(e) => used(e, pickSearchKey(e.key, query, scroll ?? null, () => (query = "")))}
    />
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div bind:this={scroll} class="glim-pick-scroll" onkeydown={onTileKey}>
      {#if sections.length === 0}
        <p class="glim-pick-none">{fill(text.none, { query: query.trim() })}</p>
      {:else}
        {#each sections as s (s.id)}
          <section class="glim-pick-section">
            {#if s.title}<h3 class="glim-eyebrow">{s.title}</h3>{/if}
            <ul class="glim-provider-pick">
              {#each s.items as item (item.id)}
                {#snippet brand()}{#if isTileMark(item.mark)}<BrandMark svg={item.mark.svg} />{/if}{/snippet}
                <li style={css(pickTileStyle(item.mark))}>
                  <ReadmeButton
                    brand="house"
                    parts={[{ name: item.label, onClick: () => onPick(item.id) }]}
                    mark={isTileMark(item.mark) ? brand : (item.mark as Snippet | undefined)}
                    markClass={isTileMark(item.mark) ? undefined : "glim-house-mark"}
                    hint={item.hint}
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
