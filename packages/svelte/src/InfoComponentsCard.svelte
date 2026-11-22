<script lang="ts" module>
  import type { ComponentRow, ComponentsCardText, OpenUrl } from "@glimstone/core";

  export type { ComponentRow, ComponentsCardText } from "@glimstone/core";

  export interface InfoComponentsCardProps {
    /** `componentText(lang).componentsCard`, or the app's own words in its shape. */
    text: ComponentsCardText;
    /** The app's name, which fills "{app}" in the card's sentences. */
    name: string;
    /** The app's own parts, the programs it brings along and, for a desktop
     *  build, its installer. The card adds the design language and sorts them. */
    rows: ComponentRow[];
    /** The switch for updating the components, bound with `bind:autoUpdate`. Left out, the card draws none. */
    autoUpdate?: boolean;
    onAutoUpdateChange?: (on: boolean) => void;
    /** "Update components" at the foot of the card. Omit it where the app updates none. */
    onUpdate?: () => void;
    updating?: boolean;
    openUrl?: OpenUrl;
    hueIndex?: number;
  }
</script>

<script lang="ts">
  import { componentRows, designRow, numberLink, openInBrowser, withApp } from "@glimstone/core";
  import Button from "./Button.svelte";
  import Card from "./Card.svelte";
  import FieldRow from "./FieldRow.svelte";
  import InfoBubble from "./InfoBubble.svelte";
  import Toggle from "./Toggle.svelte";

  // The second card of the Info tile: every version the app is made of or
  // brings along, as plain numbers in a fixed order, with a status and one
  // action on a row that needs one.
  let { text, name, rows, autoUpdate = $bindable(), onAutoUpdateChange, onUpdate, updating = false, openUrl = openInBrowser, hueIndex }: InfoComponentsCardProps = $props();

  const sorted = $derived(componentRows([...rows, designRow(text)]));

  function open(e: MouseEvent, href: string) {
    e.preventDefault();
    openUrl(href);
  }
  function flip(on: boolean) {
    autoUpdate = on;
    onAutoUpdateChange?.(on);
  }
</script>

<Card data-glim="InfoComponentsCard" title={text.title} hint={withApp(text.hint, name)} {hueIndex}>
  <ul class="glim-version-rows">
    {#each sorted as row (row.name)}
      {@const link = numberLink(row)}
      <li class="glim-version-row">
        <span class="glim-version-name">
          <span class="glim-version-part">{row.name}</span>
          {#if row.hint}<InfoBubble tip={row.hint} />{/if}
        </span>
        <span class="glim-version-end">
          {#if row.status}<span class="glim-version-status" data-tone={row.tone}>{row.status}</span>{/if}
          <span class="glim-version-tail">
            {#if row.action}
              {@const a = row.action}
              <Button label={a.label} labelKey={a.labelKey} onClick={() => a.onClick()} />
            {/if}
            {#if link.href}
              <a href={link.href} target="_blank" rel="noopener noreferrer" class="glim-num glim-version-number" onclick={(e) => open(e, link.href!)}>{link.shown}</a>
            {:else}
              <span class="glim-num glim-version-number">{link.released ? link.shown : text.unreleased(link.shown)}</span>
            {/if}
          </span>
        </span>
      </li>
    {/each}
  </ul>
  {#if autoUpdate !== undefined}
    <FieldRow label={text.auto} hint={withApp(text.autoHint, name)}>
      <Toggle checked={autoUpdate} onChange={flip} label={text.auto} hideLabel />
    </FieldRow>
  {/if}
  {#if onUpdate}
    <div class="glim-version-actions">
      <Button label={text.update} labelKey="components.update" busy={updating} onClick={() => onUpdate?.()} />
    </div>
  {/if}
</Card>
