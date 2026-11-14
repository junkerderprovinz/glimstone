<script lang="ts" module>
  import type { FortressApp, FortressInstance, FortressLogLine, FortressStatusReport, FortressText } from "@glimstone/core";

  export type { FortressLogLine, FortressStatusReport } from "@glimstone/core";

  export interface FortressStatusWindowProps {
    app: FortressApp;
    instance: FortressInstance;
    /** The member's status report, its words and times already in the person's language. */
    report?: FortressStatusReport;
    /** The member's log, newest first. The window shows the first ten lines. */
    log?: FortressLogLine[];
    loading?: boolean;
    /** Why the report did not come, such as `openRefusalText` puts it. */
    error?: string;
    text: FortressText;
    /** The interface language. */
    lang: string;
    onClose: () => void;
  }
</script>

<script lang="ts">
  import { statusView } from "@glimstone/core";
  import Badge from "./Badge.svelte";
  import BusyRing from "./BusyRing.svelte";
  import ProgressBar from "./ProgressBar.svelte";
  import Window from "./Window.svelte";
  import { glyphFor, IconClose } from "./glyphs.js";

  // What Open shows for a member without pages of its own, such as an Unraid
  // plugin, whose pages need Unraid's own sign-in and so never go through the
  // fortress: its state from the status report, its last log lines and, for a
  // plugin, where its settings are.
  let { app, instance, report, log, loading, error, text, lang, onClose }: FortressStatusWindowProps = $props();

  const view = $derived(statusView({ app, instance, report, log, loading, error, text }));
  const info = $derived(glyphFor("info"));
</script>

{#snippet title()}
  <span class="glim-status-title">{#if app.logo}<img src={app.logo} alt="" />{/if}{view.title}</span>
{/snippet}

<Window
  data-glim="FortressStatusWindow"
  {lang}
  title={view.title}
  drawn={title}
  text={{ cancel: text.cancel, close: text.close }}
  {onClose}
  actions={[{ label: text.close, labelKey: "common.close", glyph: IconClose, wayOut: true }]}
>
  <div class="glim-fortress-text" data-fortress="status">
    {#if view.loading}
      <p class="glim-fortress-note" data-fortress="loading">
        <BusyRing size="small" delay={0} />
        <span role="status">{view.loading}</span>
      </p>
    {/if}
    {#if view.error !== undefined}
      <p class="glim-fortress-note" role="status" data-fortress="error">
        {#if info}{@render info()}{/if}
        <span>{view.error}</span>
      </p>
    {/if}
    {#if view.state}
      <p class="glim-status-state" data-fortress="state">
        <Badge tone={view.state.tone}>{view.state.label}</Badge>
        {#if view.quiet}<span class="glim-fortress-sub">{view.quiet}</span>{/if}
      </p>
    {/if}
    {#if view.needsYou.length > 0}
      <section class="glim-status-section" data-fortress="needs">
        <h3 class="glim-status-heading">{text.statusNeedsYou}</h3>
        <ul class="glim-status-list">
          {#each view.needsYou as n, i (i)}
            <li class="glim-status-line">
              {#if n.level}<Badge tone={n.level.tone}>{n.level.label}</Badge>{/if}
              <span>{n.text}</span>
            </li>
          {/each}
        </ul>
      </section>
    {/if}
    {#if view.work.length > 0}
      <section class="glim-status-section" data-fortress="work">
        <h3 class="glim-status-heading">{text.statusWork}</h3>
        <ul class="glim-status-list">
          {#each view.work as w, i (i)}
            <li class="glim-status-work">
              <span>{w.title}</span>
              <ProgressBar value={w.progress} label={w.title} />
            </li>
          {/each}
        </ul>
      </section>
    {/if}
    {#if view.next.length > 0}
      <section class="glim-status-section" data-fortress="next">
        <h3 class="glim-status-heading">{text.statusNext}</h3>
        <ul class="glim-status-list">
          {#each view.next as n, i (i)}
            <li class="glim-status-line">
              <span>{n.title}</span>
              <span class="glim-status-at glim-num">{n.at}</span>
            </li>
          {/each}
        </ul>
      </section>
    {/if}
    {#if view.log.length > 0}
      <section class="glim-status-section" data-fortress="log">
        <h3 class="glim-status-heading">{text.statusLog}</h3>
        <ul class="glim-status-list">
          {#each view.log as l, i (i)}
            <li class="glim-status-line">
              <span class="glim-status-at glim-num">{l.at}</span>
              {#if l.level}<Badge tone={l.level.tone}>{l.level.label}</Badge>{/if}
              <span>{l.text}</span>
            </li>
          {/each}
        </ul>
      </section>
    {/if}
    {#if view.where}<p class="glim-fortress-sub" data-fortress="where">{view.where}</p>{/if}
  </div>
</Window>
