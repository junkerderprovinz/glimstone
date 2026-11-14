<script lang="ts" module>
  import type { Snippet } from "svelte";
  import type {
    ChangeAnswer,
    FortressAnswer,
    FortressApp,
    FortressInstance,
    FortressLabelKeys,
    FortressPermission,
    FortressText,
    PhraseAnswer,
    ToastSeverity,
  } from "@glimstone/core";

  export type { ChangeAnswer, FortressAnswer, FortressLabelKeys, FortressText, PhraseAnswer } from "@glimstone/core";

  export interface FortressProps {
    text: FortressText;
    /** The interface language, for counts and lists. */
    lang: string;
    /** The app showing the page. */
    app: { id: string; name: string; logo?: string };
    joined: boolean;
    /** The other apps of the fortress, each with its instances. */
    apps: FortressApp[];
    permissions: FortressPermission[];
    onPermission: (id: string, on: boolean) => Promise<FortressAnswer>;
    /** Puts the small confirmation of a saved permission, or the reason it failed, into the app's toasts. */
    notify?: (message: string, severity: ToastSeverity) => void;
    onJoin: (words: string[]) => Promise<FortressAnswer>;
    /** Removes an instance, of this app or another. Without it no other app offers Remove. */
    onRemove?: (id: string) => Promise<FortressAnswer>;
    /** `password` is set where `phrasePassword` asks for it first. Without it there is no Show phrase. */
    onShowPhrase?: (password?: string) => Promise<PhraseAnswer>;
    /** Offered right after a removal and beside `removed`, since until the phrase changes the fortress takes no new app. */
    onChangePhrase?: () => Promise<ChangeAnswer>;
    /** The instances removed since the phrase last changed, by name ("Bravo on Atlas"). While there are any, a line says that no new app can join. */
    removed?: string[];
    /** Another member removed this app, so the empty place says so until it joins again. */
    removedHere?: boolean;
    /** Whether the other apps show. Without it the switch keeps its state on this device. */
    showOthers?: boolean;
    onShowOthers?: (on: boolean) => void;
    /** The app draws the switch for the other apps itself, such as at the top of its pairing card, with `showOthers` and `othersLine`. */
    hideSwitch?: boolean;
    /** The devices this app is paired with today, whose pairing moves into the fortress on joining. */
    pairedWith?: string[];
    /** A member of a fortress this app saw on the network while it is in none. */
    found?: { app: string; device: string; logo?: string };
    /** Asks for the app's password before the phrase shows. */
    phrasePassword?: boolean;
    onOpen?: (app: FortressApp, instance: FortressInstance) => void;
    /** The app's own card for another app, such as the one its Instances tab draws, in place of FortressAppCard. With `onRemove` it gets `remove`, which asks before an instance goes, as the app's own cards do. */
    renderApp?: Snippet<[app: FortressApp, hueIndex: number, remove: ((id: string, name: string) => void) | undefined]>;
    /** What the QR code beside the words carries, the words alone without it. */
    phraseQr?: (words: string[]) => string;
    /** Something of the app's own under a permission's words. */
    permissionExtra?: Snippet<[permission: FortressPermission]>;
    labelKeys?: Partial<FortressLabelKeys>;
    /** The rainbow position the fortress's first card takes, after the app's own cards. */
    hueStart?: number;
    /** This app's own instance cards. The snippet gets `remove`, which asks before an instance goes. */
    children?: Snippet<[remove: (id: string, device: string) => void]>;
  }
</script>

<script lang="ts">
  import { createFortressFlow, fill, hueVars, joinRefusalText, listOf, othersLine, storedShowOthers, storeShowOthers } from "@glimstone/core";
  import Button from "./Button.svelte";
  import FortressAppCard from "./FortressAppCard.svelte";
  import FortressPermissions from "./FortressPermissions.svelte";
  import FortressWindow from "./FortressWindow.svelte";
  import InfoBubble from "./InfoBubble.svelte";
  import Toggle from "./Toggle.svelte";
  import { LABEL_KEYS } from "./fortressParts.js";
  import { glyphFor } from "./glyphs.js";
  import { css } from "./style.js";

  // The fortress in the Instances tab ("The fortress" in the design language):
  // the app's own instances first, the switch for the other apps and, once it is
  // on, their cards and the permissions, with Show phrase or Enter phrase in the
  // corner. Changing the phrase and leaving live in the pairing settings
  // (FortressPairing).
  let {
    text,
    lang,
    app,
    joined,
    apps,
    permissions,
    onPermission,
    notify,
    onJoin,
    onRemove,
    onShowPhrase,
    onChangePhrase,
    removed = [],
    removedHere,
    showOthers,
    onShowOthers,
    hideSwitch,
    pairedWith,
    found,
    phrasePassword,
    onOpen,
    renderApp,
    phraseQr,
    permissionExtra,
    labelKeys,
    hueStart = 0,
    children,
  }: FortressProps = $props();

  const flow = createFortressFlow(() => ({
    onJoin,
    onRemove,
    onShowPhrase,
    onChangePhrase,
    phrasePassword,
    failed: text.failed,
    joinRefusal: (code) => joinRefusalText(text, code),
  }));
  let s = $state.raw(flow.state());
  $effect(() => flow.subscribe(() => (s = flow.state())));
  const keys = $derived({ ...LABEL_KEYS, ...labelKeys });

  let ownShow = $state(storedShowOthers());
  const others = $derived(showOthers ?? ownShow);
  function setShowOthers(on: boolean) {
    if (onShowOthers) onShowOthers(on);
    else {
      storeShowOthers(on);
      ownShow = on;
    }
  }
  const info = $derived(glyphFor("info"));
  const remove = $derived(onRemove && flow.openRemove);
</script>

<div data-glim="Fortress" class="glim-fortress">
  <div class="glim-fortress-grid">
    {@render children?.(flow.openRemove)}
    {#if !joined}
      <div class="glim-card glim-instance glim-instance--out" data-fortress="out">
        <h3 class="glim-instance-title">{removedHere ? text.removedHereTitle : text.outTitle}</h3>
        <p class="glim-instance-hint">{fill(removedHere ? text.removedHereHint : text.outHint, { app: app.name })}</p>
        {#if found}
          <p class="glim-instance-found">
            {#if found.logo}<img src={found.logo} alt="" />{/if}
            <span>{fill(text.found, { app: found.app, device: found.device })}</span>
          </p>
        {/if}
      </div>
    {/if}
  </div>

  {#if joined && !hideSwitch}
    <div class="glim-card glim-fortress-switch glim-hue" style={css(hueVars(hueStart))}>
      <span class="glim-fortress-switch-text">
        <span class="glim-fortress-switch-name">{text.showOthers}<InfoBubble tip={text.about} /></span>
        <span class="glim-fortress-sub">{othersLine(text, lang, apps)}</span>
      </span>
      <!-- The switch shows what the app holds, so an app that keeps it itself decides. -->
      <Toggle label={text.showOthers} hideLabel bind:checked={() => others, setShowOthers} data-fortress="others" />
    </div>
  {/if}

  {#if joined && removed.length > 0}
    <div class="glim-fortress-removed" data-fortress="removed" role="status">
      {#if info}{@render info()}{/if}
      <span>{fill(text.removedNote, { devices: listOf(lang, removed) })}</span>
      {#if onChangePhrase}
        <Button label={text.changePhrase} labelKey={keys.changePhrase} tone="subtle" onClick={flow.openChange} data-fortress="open-change" />
      {/if}
    </div>
  {/if}

  {#if joined && others}
    <div class="glim-fortress-grid">
      {#each apps as a, i (a.id)}
        {#if renderApp}
          {@render renderApp(a, hueStart + 1 + i, remove)}
        {:else}
          <FortressAppCard app={a} {text} {lang} hueIndex={hueStart + 1 + i} {onOpen} onRemove={remove} removeKey={keys.remove} />
        {/if}
      {/each}
    </div>
    <FortressPermissions
      {text}
      {app}
      apps={[app, ...apps]}
      {permissions}
      {onPermission}
      {notify}
      hueIndex={hueStart + 1 + apps.length}
      extra={permissionExtra}
    />
  {/if}

  <!-- An app that shows the phrase in its pairing settings leaves the corner out. -->
  {#if !joined || onShowPhrase}
    <div class="glim-fortress-actions">
      {#if !joined}
        <Button label={text.enterPhrase} labelKey={keys.join} tone="accent" size="key" onClick={flow.openJoin} data-fortress="open-join" />
      {:else}
        <Button
          label={text.showPhrase}
          labelKey={keys.showPhrase}
          tone="accent"
          size="key"
          busy={s.busy === "show"}
          onClick={() => void flow.openPhrase()}
          data-fortress="show"
        />
      {/if}
    </div>
  {/if}

  {#if s.window}
    <FortressWindow {flow} flowState={s} {text} {lang} {app} {pairedWith} {phraseQr} {keys} />
  {/if}
</div>
