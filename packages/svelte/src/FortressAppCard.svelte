<script lang="ts" module>
  import type { FortressApp, FortressInstance, FortressText } from "@glimstone/core";

  export type { FortressApp, FortressInstance } from "@glimstone/core";

  export interface FortressAppCardProps {
    app: FortressApp;
    text: FortressText;
    /** The interface language, for the counts. */
    lang: string;
    hueIndex?: number;
    /** Opens an instance, through the fortress where it runs elsewhere. Without it the instance's `open.href` opens in a new tab. */
    onOpen?: (app: FortressApp, instance: FortressInstance) => void;
    /** Asks before an instance is removed, with its name. Without it nothing here removes. */
    onRemove?: (id: string, name: string) => void;
    /** The label key behind Remove, which picks its glyph. */
    removeKey?: string;
  }
</script>

<script lang="ts">
  import { appCardView, memberName, openInstance, presenceTone } from "@glimstone/core";
  import Badge from "./Badge.svelte";
  import Button from "./Button.svelte";
  import FortressDoubtWindow from "./FortressDoubtWindow.svelte";
  import InfoBubble from "./InfoBubble.svelte";
  import InstanceCard from "./InstanceCard.svelte";
  import PresenceBadges from "./PresenceBadges.svelte";
  import { deviceGlyph, presenceText } from "./fortressParts.js";

  // Another app of the fortress: its state, where it runs, and the way to open it.
  let { app, text, lang, hueIndex, onOpen, onRemove, removeKey = "delete" }: FortressAppCardProps = $props();

  const view = $derived(appCardView(app, text, lang));
  const single = $derived(view.rows.length === 0);
  const removes = $derived(single && !!onRemove && !view.main.self);
  let asking = $state.raw<FortressInstance | null>(null);
  const open = (instance: FortressInstance) => (instance.doubt ? (asking = instance) : openInstance(app, instance, onOpen));
  const name = (instance: FortressInstance) => memberName(text, app, instance);
</script>

<!-- Remove stays quiet at the end of a row, or after Open on a card with one instance. -->
{#snippet remove(instance: FortressInstance, inRow: boolean)}
  {#if onRemove && !instance.self}
    <Button
      label={text.remove}
      labelKey={removeKey}
      tone="subtle"
      variant={inRow ? "icon" : "default"}
      compact={inRow}
      title={name(instance)}
      onClick={() => onRemove(instance.id, name(instance))}
      data-fortress="open-remove"
    />
  {/if}
{/snippet}

{#snippet badges()}
  {#if view.doubt}<Badge tone="warn">{view.doubt.label}<InfoBubble tip={view.doubt.tip} onAccent /></Badge>{/if}
  {#if view.needs}<Badge tone="warn">{view.needs}</Badge>{/if}
  <PresenceBadges instance={view.main} {text} />
{/snippet}

{#snippet actions()}
  {#if view.open}<Button label={view.open.label} labelKey="open" onClick={() => open(view.main)} data-fortress="open" />{/if}
  {#if single}{@render remove(view.main, false)}{/if}
{/snippet}

{#snippet rows()}
  <ul class="glim-instance-rows">
    {#each view.rows as { instance, sub, open: opens } (instance.id)}
      {@const device = deviceGlyph(instance.deviceKind)}
      <li class="glim-instance-row" data-instance={instance.id}>
        <span class="glim-instance-device" aria-hidden="true">{#if device}{@render device()}{/if}</span>
        <span class="glim-instance-row-text">
          <span class="glim-instance-row-name">{instance.device}</span>
          <span class="glim-instance-row-sub glim-num">{sub}</span>
        </span>
        <span class="glim-instance-row-end">
          <Badge tone={presenceTone(instance.presence)}>{presenceText(text, instance)}</Badge>
          {#if opens}
            <Button
              label={text.open}
              labelKey="open"
              tone="subtle"
              variant="icon"
              compact
              title={name(instance)}
              onClick={() => open(instance)}
              data-fortress="open"
            />
          {/if}
          {@render remove(instance, true)}
        </span>
      </li>
    {/each}
  </ul>
{/snippet}

<InstanceCard
  data-glim="FortressAppCard"
  data-fortress-app={app.id}
  logo={app.logo}
  name={app.name}
  eyebrow={view.eyebrow}
  {hueIndex}
  {badges}
  facts={view.facts}
  actions={view.open || removes ? actions : undefined}
  children={single ? undefined : rows}
/>
{#if asking}
  {@const instance = asking}
  <FortressDoubtWindow {app} {instance} {text} onOpen={() => openInstance(app, instance, onOpen)} onClose={() => (asking = null)} />
{/if}
