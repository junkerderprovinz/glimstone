<script lang="ts" module>
  import type { Snippet } from "svelte";

  export interface HoverCardProps {
    /** The link's words. */
    label: string;
    href: string;
    /** How long the pointer rests before the card opens, and after it leaves before it closes, in ms. */
    openDelay?: number;
    closeDelay?: number;
    /** Draws the card. */
    content: Snippet;
  }
</script>

<script lang="ts">
  import * as hoverCard from "@zag-js/hover-card";
  import { mergeProps, normalizeProps, useMachine } from "@zag-js/svelte";
  import { pageDir } from "@glimstone/core";
  import { lift } from "./lift.js";
  import { usePortalHue } from "./portalHue.svelte.js";

  // A card that shows what a link leads to while the pointer rests on it or the
  // keyboard reaches it, such as the details of a server named in a sentence.
  // It only previews: everything in it is also behind the link, so a touch
  // screen, which has no hover, loses nothing.
  let { label, href, openDelay = 600, closeDelay = 300, content }: HoverCardProps = $props();

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
    <div {...api.getContentProps()} class="glim-hovercard">{@render content()}</div>
  </div>
{/if}
