<script lang="ts" module>
  import type { Snippet } from "svelte";
  import type { HoverCardFact } from "@glimstone/core";

  export type { HoverCardFact } from "@glimstone/core";

  export interface HoverCardProps {
    /** The link's words. */
    label: string;
    href: string;
    /** How long the pointer rests before the card opens, and after it leaves before it closes, in ms. */
    openDelay?: number;
    closeDelay?: number;
    /** A glyph or an avatar for the card's head, in a 40px tile. */
    media?: Snippet;
    /** The head's name. */
    title?: string;
    /** One quiet line under the name, such as an address or a state. */
    meta?: string;
    /** Up to three figures under the head, each a name and a value. */
    facts?: readonly HoverCardFact[];
    /** Draws the card's body below the head, or the whole card without one. */
    content?: Snippet;
  }
</script>

<script lang="ts">
  import * as hoverCard from "@zag-js/hover-card";
  import { mergeProps, normalizeProps, useMachine } from "@zag-js/svelte";
  import { hoverCardFacts, pageDir } from "@glimstone/core";
  import { lift } from "./lift.js";
  import { usePortalHue } from "./portalHue.svelte.js";

  // A card that shows what a link leads to while the pointer rests on it or the
  // keyboard reaches it, such as the details of a server named in a sentence.
  // It only previews: everything in it is also behind the link, so a touch
  // screen, which has no hover, loses nothing.
  let { label, href, openDelay = 400, closeDelay = 150, media, title, meta, facts, content }: HoverCardProps = $props();

  const id = $props.id();
  const service = useMachine(hoverCard.machine, () => ({
    id,
    dir: pageDir(),
    openDelay,
    closeDelay,
    positioning: { placement: "bottom" as const, gutter: 8 },
  }));
  const api = $derived(hoverCard.connect(service, normalizeProps));
  let trigger = $state<HTMLAnchorElement | null>(null);
  const hue = usePortalHue(() => api.open, () => trigger);
</script>

<a data-glim="HoverCard" {...api.getTriggerProps()} bind:this={trigger} {href} class="glim-hovercard-link">{label}</a>
{#if api.open}
  <div {@attach lift} {...mergeProps(api.getPositionerProps(), { style: hue.style })} class={`glim-hovercard-positioner ${hue.className}`.trim()}>
    <div {...api.getContentProps()} class="glim-hovercard">
      {#if media || title}
        <div class="glim-hovercard-head">
          {#if media}<span class="glim-hovercard-media">{@render media()}</span>{/if}
          <span class="glim-hovercard-names">
            {#if title}<strong class="glim-hovercard-title">{title}</strong>{/if}
            {#if meta}<span class="glim-hovercard-meta">{meta}</span>{/if}
          </span>
        </div>
      {/if}
      {#if hoverCardFacts(facts).length}
        <dl class="glim-hovercard-facts">
          {#each hoverCardFacts(facts) as f (f.label)}
            <div class="glim-hovercard-fact"><dt>{f.label}</dt><dd class="glim-num">{f.value}</dd></div>
          {/each}
        </dl>
      {/if}
      {@render content?.()}
    </div>
  </div>
{/if}
