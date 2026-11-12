<script setup lang="ts">
import { computed } from "vue";
import { statusView, type FortressApp, type FortressInstance, type FortressLogLine, type FortressStatusReport, type FortressText } from "@glimstone/core";
import Badge from "./Badge.vue";
import BusyRing from "./BusyRing.vue";
import ProgressBar from "./ProgressBar.vue";
import Window from "./Window.vue";
import { glyphFor, IconClose } from "./glyphs";
import type { WindowAction } from "./windowParts";

// What Open shows for a member without pages of its own, such as an Unraid
// plugin, whose pages need Unraid's own sign-in and so never go through the
// fortress: its state from the status report, its last log lines and, for a
// plugin, where its settings are.
const props = defineProps<{
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
}>();

const view = computed(() =>
  statusView({ app: props.app, instance: props.instance, report: props.report, log: props.log, loading: props.loading, error: props.error, text: props.text }),
);
const actions = computed<WindowAction[]>(() => [{ label: props.text.close, labelKey: "common.close", glyph: IconClose, wayOut: true }]);
const info = glyphFor("info");
</script>

<template>
  <Window
    data-glim="FortressStatusWindow"
    :lang="lang"
    :title="view.title"
    :actions="actions"
    :text="{ cancel: text.cancel, close: text.close }"
    @close="onClose()"
  >
    <template #title>
      <span class="glim-status-title"><img v-if="app.logo" :src="app.logo" alt="" />{{ view.title }}</span>
    </template>
    <div class="glim-fortress-text" data-fortress="status">
      <p v-if="view.loading" class="glim-fortress-note" data-fortress="loading">
        <BusyRing size="small" :delay="0" />
        <span role="status">{{ view.loading }}</span>
      </p>
      <p v-if="view.error !== undefined" class="glim-fortress-note" role="status" data-fortress="error">
        <component :is="info" v-if="info" />
        <span>{{ view.error }}</span>
      </p>
      <p v-if="view.state" class="glim-status-state" data-fortress="state">
        <Badge :tone="view.state.tone">{{ view.state.label }}</Badge>
        <span v-if="view.quiet" class="glim-fortress-sub">{{ view.quiet }}</span>
      </p>
      <section v-if="view.needsYou.length" class="glim-status-section" data-fortress="needs">
        <h3 class="glim-status-heading">{{ text.statusNeedsYou }}</h3>
        <ul class="glim-status-list">
          <li v-for="(n, i) in view.needsYou" :key="i" class="glim-status-line">
            <Badge v-if="n.level" :tone="n.level.tone">{{ n.level.label }}</Badge> <span>{{ n.text }}</span>
          </li>
        </ul>
      </section>
      <section v-if="view.work.length" class="glim-status-section" data-fortress="work">
        <h3 class="glim-status-heading">{{ text.statusWork }}</h3>
        <ul class="glim-status-list">
          <li v-for="(w, i) in view.work" :key="i" class="glim-status-work">
            <span>{{ w.title }}</span>
            <ProgressBar :value="w.progress" :label="w.title" />
          </li>
        </ul>
      </section>
      <section v-if="view.next.length" class="glim-status-section" data-fortress="next">
        <h3 class="glim-status-heading">{{ text.statusNext }}</h3>
        <ul class="glim-status-list">
          <li v-for="(n, i) in view.next" :key="i" class="glim-status-line">
            <span>{{ n.title }}</span> <span class="glim-status-at glim-num">{{ n.at }}</span>
          </li>
        </ul>
      </section>
      <section v-if="view.log.length" class="glim-status-section" data-fortress="log">
        <h3 class="glim-status-heading">{{ text.statusLog }}</h3>
        <ul class="glim-status-list">
          <li v-for="(l, i) in view.log" :key="i" class="glim-status-line">
            <span class="glim-status-at glim-num">{{ l.at }}</span> <Badge v-if="l.level" :tone="l.level.tone">{{ l.level.label }}</Badge> <span>{{ l.text }}</span>
          </li>
        </ul>
      </section>
      <p v-if="view.where" class="glim-fortress-sub" data-fortress="where">{{ view.where }}</p>
    </div>
  </Window>
</template>
