<script lang="ts" module>
  import type { Snippet } from "svelte";
  import type { ReadmeBrand, ReadmePart } from "@glimstone/core";

  export type { ReadmeBrand, ReadmePart } from "@glimstone/core";

  export interface ReadmeButtonProps {
    /** The brand whose colour the unit lights up in. */
    brand: ReadmeBrand;
    /** The button, then its segments. */
    parts: [ReadmePart, ...ReadmePart[]];
    mark?: Snippet;
    /** The class that paints the mark at rest, such as `glim-windows-mark`. It
     *  sits on the mark's box, where the lit unit's ink can override it. */
    markClass?: string;
    /** A vendor's own button artwork, which replaces the first part's mark and words. */
    art?: Snippet;
    /** The "(i)" at the end of the unit, for what the name cannot say. */
    hint?: string;
    /** Holds the second lines in view while one reports what it did, such as "Copied". */
    note?: boolean;
    /** The second line of a unit whose first part has neither `href` nor `onClick`. */
    soonLabel?: string;
    /** Runs on a click on a part's link, for an app whose webview has no browser
     *  behind it to open the address in. */
    onLinkClick?: (e: MouseEvent) => void;
  }
</script>

<script lang="ts">
  import { keepReadmeFit, readmePartClass, readmePartLabel, readmeSoon, readmeUnitClass } from "@glimstone/core";
  import InfoBubble from "./InfoBubble.svelte";

  // A button in the shape of the README's download buttons, on the App tab and
  // the About card ("The App tab" in design-language.md). The first part carries
  // the mark and the full name; the parts after it are segments that name only
  // what differs, such as ARM beside Windows. The unit lights up as one in its
  // brand's colour ("Brand tiles"). A link where a part leads to a file or a
  // listing, a button where it does something on the page, and a quiet unit with
  // "Soon" as its second line where the listing does not exist yet.
  let { brand, parts, mark, markClass, art, hint, note, soonLabel, onLinkClick }: ReadmeButtonProps = $props();

  let root: HTMLDivElement;
  const soon = $derived(readmeSoon(parts));
  const words = $derived(parts.map((p) => `${p.name}\n${p.sub ?? ""}`).join("\n") + (soon ? soonLabel : ""));
  $effect(() => {
    void words;
    return keepReadmeFit(root);
  });

  const sub = (part: ReadmePart) => (soon ? soonLabel : part.sub);
</script>

{#snippet face(part: ReadmePart, i: number)}
  {#if i === 0 && art}
    <span class="glim-readme-btn-art" aria-hidden="true">{@render art()}</span>
  {:else}
    {#if i === 0 && mark}
      <span class={`glim-readme-btn-mark ${markClass ?? ""}`} aria-hidden="true">{@render mark()}</span>
    {/if}
    <span class="glim-readme-btn-text">
      <span class="glim-readme-btn-name">{part.name}</span>
      {#if sub(part)}<span class="glim-readme-btn-sub">{sub(part)}</span>{/if}
    </span>
  {/if}
{/snippet}

<div data-glim="ReadmeButton" bind:this={root} class={readmeUnitClass(brand, parts.length, !!note, soon)}>
  {#each parts as part, i (i)}
    {#if soon}
      <span class={readmePartClass(i, soon)} aria-disabled="true" aria-label={readmePartLabel(part, sub(part))}>{@render face(part, i)}</span>
    {:else if part.href}
      <a href={part.href} target="_blank" rel="noreferrer noopener" onclick={onLinkClick} aria-label={readmePartLabel(part, sub(part))} class={readmePartClass(i, soon)}>
        {@render face(part, i)}
      </a>
    {:else}
      <button type="button" onclick={part.onClick} aria-label={readmePartLabel(part, sub(part))} class={readmePartClass(i, soon)}>{@render face(part, i)}</button>
    {/if}
  {/each}
  {#if !soon}<span class="glim-readme-btn-sheen" aria-hidden="true"></span>{/if}
  {#if hint}<span class="glim-readme-btn-hint"><InfoBubble tip={hint} /></span>{/if}
</div>
