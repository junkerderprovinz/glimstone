<script lang="ts" module>
  import type { Snippet } from "svelte";
  import type { MarqueeText } from "@glimstone/core";

  export type { MarqueeText } from "@glimstone/core";

  export interface MarqueeProps<T> {
    /** The row's accessible name. */
    label: string;
    items: readonly T[];
    /** How fast it runs, in pixels a second. */
    speed?: number;
    /** Runs the other way. */
    reverse?: boolean;
    /** Draws one item. */
    item: Snippet<[T]>;
    text?: Partial<MarqueeText>;
  }
</script>

<script lang="ts" generics="T">
  import * as marquee from "@zag-js/marquee";
  import { normalizeProps, useMachine } from "@zag-js/svelte";
  import { MARQUEE_TEXT, pageDir } from "@glimstone/core";
  import IconButton from "./IconButton.svelte";
  import { IconPause, IconPlay } from "./glyphs.js";

  // A row that runs past on its own, such as the names of the people a release
  // thanks. It is a continuous animation, so it stops outright at the motion
  // level off and under reduced motion, it halts while the pointer or the focus
  // is on it, and its own button holds it for good, as WCAG 2.2.2 asks.
  let { label, items, speed = 40, reverse = false, item, text }: MarqueeProps<T> = $props();

  const words = $derived({ ...MARQUEE_TEXT, ...text });
  let held = $state(false);
  const id = $props.id();
  const service = useMachine(marquee.machine, () => ({
    id,
    dir: pageDir(),
    speed,
    reverse,
    autoFill: true,
    paused: held,
    spacing: "var(--space-10)",
    translations: { root: label },
  }));
  const api = $derived(marquee.connect(service, normalizeProps));
</script>

<div data-glim="Marquee" class="glim-marquee-frame">
  <div {...api.getRootProps()} class="glim-marquee">
    <div {...api.getViewportProps()} class="glim-marquee-viewport">
      {#each Array.from({ length: api.contentCount }) as _, index (index)}
        <div {...api.getContentProps({ index })} class="glim-marquee-content">
          {#each items as entry, i (i)}
            <div {...api.getItemProps()} class="glim-marquee-item">{@render item(entry)}</div>
          {/each}
        </div>
      {/each}
    </div>
  </div>
  <IconButton tip={held ? words.resume : words.pause} glyph={held ? IconPlay : IconPause} pressed={held} onclick={() => (held = !held)} />
</div>
