<script lang="ts" module>
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";
  import type { InstanceFigure } from "@glimstone/core";

  export type { InstanceFigure } from "@glimstone/core";

  export interface InstanceCardProps extends Omit<HTMLAttributes<HTMLDivElement>, "children" | "class"> {
    /** The app's mark, as an address or as an inline `<svg>`. */
    logo?: string | Snippet;
    /** The device's name for an instance of this app, the app's name for another app. */
    name: string;
    eyebrow?: string;
    /** Badges after the name, such as the state. */
    badges?: Snippet;
    /** One quiet line of facts, joined with a dot. Empty ones are left out. */
    facts?: (string | undefined)[];
    /** A few numbers under the facts, each with its small label. */
    figures?: InstanceFigure[];
    /** What the card holds under the head, such as a row per instance. */
    children?: Snippet;
    /** The card's buttons. Without a body they stand beside the mark. */
    actions?: Snippet;
    /** The card's position in the rainbow, counted over the cards on the page. */
    hueIndex?: number;
    class?: string;
  }
</script>

<script lang="ts">
  import { hueVars } from "@glimstone/core";
  import { css } from "./style.js";

  // One instance as a card in the Instances grid, or one app of the fortress
  // with a row for each place it runs ("The fortress" in the design language).
  // The mark stands at the start, the name with its badges beside it, and the
  // actions at the end of the card's foot.
  let { logo, name, eyebrow, badges, facts, figures, children, actions, hueIndex, class: className, style, ...rest }: InstanceCardProps = $props();

  const shown = $derived(facts?.filter(Boolean) ?? []);
  const styleText = $derived(hueIndex !== undefined ? [css(hueVars(hueIndex)), style].filter(Boolean).join("; ") : style);
</script>

{#snippet acts()}
  {#if actions}<div class="glim-instance-acts">{@render actions()}</div>{/if}
{/snippet}

<div
  data-glim="InstanceCard"
  data-glim-title={name}
  {...rest}
  class={["glim-card glim-instance", hueIndex !== undefined && "glim-hue", className].filter(Boolean).join(" ")}
  style={styleText}
>
  <div class="glim-instance-top">
    {#if typeof logo === "string"}
      <img class="glim-instance-mark" src={logo} alt="" draggable="false" />
    {:else if logo}
      <span class="glim-instance-mark" aria-hidden="true">{@render logo()}</span>
    {/if}
    <div class="glim-instance-main">
      <div class="glim-instance-name">
        <h3 class="glim-instance-title">{name}</h3>
        {#if badges}<span class="glim-instance-badges">{@render badges()}</span>{/if}
      </div>
      {#if eyebrow}<span class="glim-eyebrow">{eyebrow}</span>{/if}
      {#if shown.length > 0}<p class="glim-instance-facts glim-num">{shown.join(" · ")}</p>{/if}
      {#if figures && figures.length > 0}
        <dl class="glim-instance-figures">
          {#each figures as f (f.label)}
            <div>
              <dt>{f.label}</dt>
              <dd class="glim-num">{f.value}</dd>
            </div>
          {/each}
        </dl>
      {/if}
      {#if !children}{@render acts()}{/if}
    </div>
  </div>
  {#if children}
    <div class="glim-instance-body">{@render children()}</div>
    {@render acts()}
  {/if}
</div>
