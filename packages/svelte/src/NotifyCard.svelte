<script lang="ts" module>
  import type { Catalog, NotifyApi, NotifyCardLabelKeys, NotifyCardText, NotifyChoice, NotifyKind, ToastSeverity } from "@glimstone/core";

  export type { NotifyCardLabelKeys, NotifyCardText } from "@glimstone/core";

  export interface NotifyCardProps {
    /** Loads, saves and tests the channels in the kit's notify format. */
    api: NotifyApi;
    /** The card's words, `notifyCardText(lang)` or the app's own. */
    text: NotifyCardText;
    /** The app's name, for the sentences that say it. */
    app: string;
    /** The interface language, which sorts the picker. */
    lang: string;
    /** The notification catalog, `NOTIFY_PROVIDERS`. */
    providers: Catalog;
    /** The kinds the app sends to, every kind of the kit by default. */
    kinds?: readonly NotifyKind[];
    /** The event kinds the app sends, which each channel can choose among. */
    events?: readonly NotifyChoice[];
    /** The keys a Healthchecks channel can give a check of their own, such as a job. */
    checks?: readonly NotifyChoice[];
    /** Kinds that send nothing where the app runs, with the sentence that says why. */
    unavailable?: Partial<Record<NotifyKind, string>>;
    /** Puts what a change did, or why it failed, into the app's toasts. */
    notify?: (message: string, severity: ToastSeverity) => void;
    /** The card's rainbow position. */
    hueIndex?: number;
    labelKeys?: Partial<NotifyCardLabelKeys>;
  }
</script>

<script lang="ts">
  import { onDestroy, onMount, untrack, type Snippet } from "svelte";
  import { connectionTestFace, createNotifyCardFlow, fill, notifyGlyphKey, notifyRemoval, notifyRows, showNotifyRefusal, NOTIFY_CARD_KEYS, NOTIFY_KINDS } from "@glimstone/core";
  import Badge from "./Badge.svelte";
  import BrandMark from "./BrandMark.svelte";
  import Button from "./Button.svelte";
  import Card from "./Card.svelte";
  import EmptyState from "./EmptyState.svelte";
  import GlyphTile from "./GlyphTile.svelte";
  import ListRow from "./ListRow.svelte";
  import NotifyCardWindow from "./NotifyCardWindow.svelte";
  import Toggle from "./Toggle.svelte";
  import { useConfirm } from "./confirm.svelte.js";
  import { glyphFor, IconCheck, IconClose, IconPencil, IconTrash } from "./glyphs.js";

  // The settings card "Notifications" ("The notification card" in the design
  // language): the app's channels as rows, each with its switch, its test, Edit
  // and Remove, and the catalog's picker to add one. The flow lives in the core
  // and talks to the app through three calls, so the card names no app or route.
  let { api, text, app, lang, providers, kinds = NOTIFY_KINDS, events = [], checks = [], unavailable = {}, notify, hueIndex, labelKeys }: NotifyCardProps = $props();

  const flow = createNotifyCardFlow(() => ({ api, text, app, lang, providers, kinds, events, checks, unavailable, notify }));
  let s = $state.raw(flow.state());
  onDestroy(flow.subscribe(() => (s = flow.state())));
  onMount(() => flow.start());
  const refusals = $derived(s.refusal?.count);
  $effect(() => {
    void refusals;
    return untrack(() => showNotifyRefusal(s.refusal));
  });
  const ask = useConfirm({
    get title() {
      return text.remove;
    },
    get cancel() {
      return text.cancel;
    },
    get confirm() {
      return text.remove;
    },
  });

  const keys = $derived<NotifyCardLabelKeys>({ ...NOTIFY_CARD_KEYS, ...labelKeys });
  const rows = $derived(notifyRows(s, { text, providers, unavailable }));
  const glyph = (kind: NotifyKind): Snippet => glyphFor(notifyGlyphKey(kind, keys))!;
  const markOf = (kind: NotifyKind) => providers.entries.find((e) => e.id === kind)?.mark;

  function remove(id: string) {
    const c = s.channels.find((x) => x.id === id);
    if (!c) return;
    const q = notifyRemoval(text, c);
    void ask.confirm(q.message, { confirmLabel: q.confirm, confirmLabelKey: keys.remove }).then((yes) => {
      if (yes) void flow.remove(id);
    });
  }
</script>

<div data-glim="NotifyCard">
  <Card title={text.title} hint={text.hint} {hueIndex}>
    <div class="glim-notify-body">
      {#if s.loadFailed}
        <p class="glim-notify-said glim-notify-said--fail" role="alert">{text.notLoaded}</p>
      {/if}
      {#if rows.length > 0}
        <div class="glim-list glim-notify-rows">
          {#each rows as row (row.id)}
            {@const test = s.rowTests[row.id]}
            {@const face = connectionTestFace(test)}
            {@const m = markOf(row.kind)}
            {#snippet brand()}<BrandMark svg={m?.svg ?? ""} />{/snippet}
            {#snippet idle()}<Badge size="small" tone="warn">{text.idle}</Badge>{/snippet}
            <ListRow steady name={row.name} meta={row.meta} badges={row.idle ? idle : undefined} data-notify-channel={row.id}>
              {#snippet tile()}<GlyphTile glyph={m ? brand : glyph(row.kind)} />{/snippet}
              {#snippet actions()}
                <Toggle bind:checked={() => row.enabled, (on) => void flow.setEnabled(row.id, on)} label={row.name} hideLabel data-notify={`switch-${row.id}`} />
                <Button
                  compact
                  tone={face.tone === "neutral" ? "subtle" : face.tone}
                  label={text.test}
                  labelKey={keys.test}
                  glyph={face.outcome === "cross" ? IconClose : IconCheck}
                  busy={test?.busy}
                  title={test?.title}
                  class={face.shake ? "glim-shake" : undefined}
                  data-notify={`test-${row.id}`}
                  onClick={() => void flow.testRow(row.id)}
                />
                <Button compact tone="subtle" label={text.edit} labelKey={keys.edit} glyph={IconPencil} data-notify={`edit-${row.id}`} onClick={() => flow.edit(row.id)} />
                <Button
                  compact
                  tone="subtle"
                  label={text.remove}
                  labelKey={keys.remove}
                  glyph={IconTrash}
                  busy={s.busy === `remove-${row.id}`}
                  data-notify={`remove-${row.id}`}
                  onClick={() => remove(row.id)}
                />
              {/snippet}
            </ListRow>
          {/each}
        </div>
      {:else if s.loaded}
        <EmptyState nested title={fill(text.empty, { app })} />
      {/if}
      <div class="glim-notify-foot">
        <Button label={text.add} labelKey={keys.add} disabled={!s.loaded} data-notify="add" onClick={flow.pick} />
      </div>
    </div>
  </Card>
  {#if s.window}
    <NotifyCardWindow {flow} flowState={s} {text} {app} {lang} {providers} {kinds} {events} {checks} {unavailable} {keys} {glyph} />
  {/if}
  <ask.confirmDialog />
</div>
