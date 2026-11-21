<script lang="ts" module>
  import type { OpenUrl, UpdateRoute, UpdateState, VersionCardText } from "@glimstone/core";

  export type { UpdateCheck, UpdateRoute, UpdateState, VersionCardText, VersionRow } from "@glimstone/core";

  export interface InfoVersionCardProps {
    /** `componentText(lang).versionCard`, or the app's own words in its shape. */
    text: VersionCardText;
    /** The app's name, which fills "{app}" in the card's sentences. */
    name: string;
    /** Read from the build, never typed in. */
    version: string;
    /** The repository whose newest release the number opens. */
    repoUrl?: string;
    /** How the app gets a new version, which decides the one action. */
    route: UpdateRoute;
    /** Where the updates stand. The app finds out; the card shows it. */
    state: UpdateState;
    /** "Check for updates". A store app passes none. */
    onCheck?: () => void;
    /** Fetches and installs the new version, or leads to the host's plugin page. */
    onUpdate?: () => void;
    /** Starts the downloaded version. */
    onRestart?: () => void;
    /** Where a container's update instructions live. */
    guideUrl?: string;
    /** Opens the app's window of what changed, a card per release with its notes. */
    onWhatsNew: () => void;
    /** How many marked changes are still unseen. */
    unseen?: number;
    /** The switch under the state, bound with `bind:autoUpdate`. Left out, the card draws none. */
    autoUpdate?: boolean;
    onAutoUpdateChange?: (on: boolean) => void;
    openUrl?: OpenUrl;
    hueIndex?: number;
  }
</script>

<script lang="ts">
  import { autoSwitch, canCheck, numberLink, openInBrowser, updateAction, updateLine, whatsNewLabel, withApp } from "@glimstone/core";
  import Button from "./Button.svelte";
  import Card from "./Card.svelte";
  import FieldRow from "./FieldRow.svelte";
  import Toggle from "./Toggle.svelte";

  // The first card of the Info tile: the app's name and version, one line on
  // where its updates stand, the one action once there is something to do, and
  // two quiet actions, "What's new" and "Check for updates".
  let {
    text,
    name,
    version,
    repoUrl,
    route,
    state,
    onCheck,
    onUpdate,
    onRestart,
    guideUrl,
    onWhatsNew,
    unseen = 0,
    autoUpdate = $bindable(),
    onAutoUpdateChange,
    openUrl = openInBrowser,
    hueIndex,
  }: InfoVersionCardProps = $props();

  const face = $derived(updateLine(state, text));
  const action = $derived(updateAction(route, state, text));
  const toggle = $derived(autoSwitch(route, text));
  const number = $derived(numberLink({ name, version, repoUrl }));

  function press() {
    if (action?.kind === "restart") onRestart?.();
    else if (action?.kind === "guide") guideUrl && openUrl(guideUrl);
    else onUpdate?.();
  }
  function open(e: MouseEvent, href: string) {
    e.preventDefault();
    openUrl(href);
  }
  function flip(on: boolean) {
    autoUpdate = on;
    onAutoUpdateChange?.(on);
  }
</script>

<Card data-glim="InfoVersionCard" title={text.title} hint={withApp(text.hint, name)} {hueIndex}>
  <div class="glim-version-head">
    <span class="glim-version-app">{name}</span>
    {#if number.href}
      <a href={number.href} target="_blank" rel="noopener noreferrer" class="glim-num glim-version-number" onclick={(e) => open(e, number.href!)}>{number.shown}</a>
    {:else}
      <span class="glim-num glim-version-number">{number.released ? number.shown : text.unreleased(number.shown)}</span>
    {/if}
  </div>
  <p class="glim-version-state" data-tone={face.tone} role="status">
    <span class="glim-version-line">{face.line}</span>
    {#if face.note}<span class="glim-version-note">{face.note}</span>{/if}
    {#if state.kind === "available" && repoUrl}
      {@const href = `${repoUrl}/releases/latest`}
      <a {href} target="_blank" rel="noopener noreferrer" class="glim-text-action" onclick={(e) => open(e, href)}>{text.newIn(state.version)}</a>
    {/if}
  </p>
  {#if state.kind === "downloading"}
    <div class="glim-version-progress" role="progressbar" aria-label={face.line} aria-valuemin={0} aria-valuemax={100} aria-valuenow={state.percent}>
      <span style:width={`${state.percent}%`}></span>
    </div>
  {/if}
  {#if action}
    <div class="glim-version-actions">
      <Button label={action.label} labelKey={action.labelKey} tone={action.kind === "guide" ? "neutral" : "accent"} onClick={press} />
    </div>
  {/if}
  <div class="glim-version-links">
    <button type="button" class="glim-text-action" onclick={() => onWhatsNew()}>
      <span class="glim-text-action-dot" data-unseen={unseen > 0 ? "" : undefined} aria-hidden="true"></span>
      {whatsNewLabel(text, unseen)}
    </button>
    {#if onCheck && route !== "store"}
      <button type="button" class="glim-text-action" disabled={!canCheck(route, state)} onclick={() => onCheck?.()}>{text.check}</button>
    {/if}
  </div>
  {#if toggle && autoUpdate !== undefined}
    <FieldRow label={toggle.label} hint={withApp(toggle.hint, name)}>
      <Toggle checked={autoUpdate} onChange={flip} label={toggle.label} hideLabel />
    </FieldRow>
  {/if}
</Card>
