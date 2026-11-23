<script setup lang="ts">
import { computed, h, onBeforeUnmount, shallowRef, watch, type Component } from "vue";
import {
  connectionTestFace,
  createNotifyCardFlow,
  fill,
  notifyGlyphKey,
  notifyRemoval,
  notifyRows,
  showNotifyRefusal,
  NOTIFY_CARD_KEYS,
  NOTIFY_KINDS,
  type Catalog,
  type NotifyApi,
  type NotifyCardLabelKeys,
  type NotifyCardText,
  type NotifyChoice,
  type NotifyKind,
  type ToastSeverity,
} from "@glimstone/core";
import Badge from "./Badge.vue";
import BrandMark from "./BrandMark.vue";
import Button from "./Button.vue";
import Card from "./Card.vue";
import { useConfirm } from "./confirm";
import EmptyState from "./EmptyState.vue";
import GlyphTile from "./GlyphTile.vue";
import { glyphFor, IconCheck, IconClose, IconPencil, IconTrash } from "./glyphs";
import ListRow from "./ListRow.vue";
import NotifyCardWindow from "./NotifyCardWindow.vue";
import Toggle from "./Toggle.vue";

// The settings card "Notifications" ("The notification card" in the design
// language): the app's channels as rows, each with its switch, its test, Edit
// and Remove, and the catalog's picker to add one. The flow lives in the core
// and talks to the app through three calls, so the card names no app or route.
const props = withDefaults(
  defineProps<{
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
  }>(),
  { kinds: () => NOTIFY_KINDS, events: () => [], checks: () => [], unavailable: () => ({}) },
);

const flow = createNotifyCardFlow(() => props);
const s = shallowRef(flow.state());
const unsubscribe = flow.subscribe(() => (s.value = flow.state()));
const stop = flow.start();
onBeforeUnmount(() => {
  unsubscribe();
  stop();
});
watch(
  () => s.value.refusal?.count,
  (_, __, onCleanup) => onCleanup(showNotifyRefusal(s.value.refusal)),
  { flush: "post" },
);

const keys = computed<NotifyCardLabelKeys>(() => ({ ...NOTIFY_CARD_KEYS, ...props.labelKeys }));
const rows = computed(() => notifyRows(s.value, props));
const face = (id: string) => connectionTestFace(s.value.rowTests[id]);
function mark(kind: NotifyKind): Component {
  const m = props.providers.entries.find((e) => e.id === kind)?.mark;
  return m ? () => h(BrandMark, { svg: m.svg }) : (glyphFor(notifyGlyphKey(kind, keys.value)) as Component);
}

const { confirm, ConfirmHost } = useConfirm({ title: props.text.remove, cancel: props.text.cancel, confirm: props.text.remove });
function ask(id: string) {
  const c = s.value.channels.find((x) => x.id === id);
  if (!c) return;
  const q = notifyRemoval(props.text, c);
  void confirm(q.message, { confirmLabel: q.confirm, confirmLabelKey: keys.value.remove }).then((yes) => {
    if (yes) void flow.remove(id);
  });
}
</script>

<template>
  <div data-glim="NotifyCard">
    <Card :title="text.title" :hint="text.hint" :hue-index="hueIndex">
      <div class="glim-notify-body">
        <p v-if="s.loadFailed" class="glim-notify-said glim-notify-said--fail" role="alert">{{ text.notLoaded }}</p>
        <div v-if="rows.length > 0" class="glim-list glim-notify-rows">
          <ListRow v-for="row in rows" :key="row.id" steady :name="row.name" :meta="row.meta" :data-notify-channel="row.id">
            <template #tile><GlyphTile :glyph="mark(row.kind)" /></template>
            <template v-if="row.idle" #badges>
              <Badge size="small" tone="warn">{{ text.idle }}</Badge>
            </template>
            <template #actions>
              <Toggle :model-value="row.enabled" :label="row.name" hide-label :data-notify="`switch-${row.id}`" @update:model-value="flow.setEnabled(row.id, $event)" />
              <Button
                compact
                :tone="face(row.id).tone === 'neutral' ? 'subtle' : face(row.id).tone"
                :label="text.test"
                :label-key="keys.test"
                :glyph="face(row.id).outcome === 'cross' ? IconClose : IconCheck"
                :busy="s.rowTests[row.id]?.busy"
                :title="s.rowTests[row.id]?.title"
                :class="{ 'glim-shake': face(row.id).shake }"
                :data-notify="`test-${row.id}`"
                @click="flow.testRow(row.id)"
              />
              <Button compact tone="subtle" :label="text.edit" :label-key="keys.edit" :glyph="IconPencil" :data-notify="`edit-${row.id}`" @click="flow.edit(row.id)" />
              <Button
                compact
                tone="subtle"
                :label="text.remove"
                :label-key="keys.remove"
                :glyph="IconTrash"
                :busy="s.busy === `remove-${row.id}`"
                :data-notify="`remove-${row.id}`"
                @click="ask(row.id)"
              />
            </template>
          </ListRow>
        </div>
        <EmptyState v-else-if="s.loaded" nested :title="fill(text.empty, { app })" />
        <div class="glim-notify-foot">
          <Button :label="text.add" :label-key="keys.add" :disabled="!s.loaded" data-notify="add" @click="flow.pick()" />
        </div>
      </div>
    </Card>
    <NotifyCardWindow
      :state="s"
      :flow="flow"
      :text="text"
      :app="app"
      :lang="lang"
      :providers="providers"
      :kinds="kinds"
      :events="events"
      :checks="checks"
      :unavailable="unavailable"
      :keys="keys"
      :mark="mark"
    />
    <ConfirmHost />
  </div>
</template>
