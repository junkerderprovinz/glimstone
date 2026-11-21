<script setup lang="ts">
import { computed } from "vue";
import { autoSwitch, canCheck, numberLink, openInBrowser, updateAction, updateLine, whatsNewLabel, withApp } from "@glimstone/core";
import type { InfoVersionCardProps } from "./info";
import Button from "./Button.vue";
import Card from "./Card.vue";
import FieldRow from "./FieldRow.vue";
import Toggle from "./Toggle.vue";

// The first card of the Info tile: the app's name and version, one line on
// where its updates stand, the one action once there is something to do, and
// two quiet actions, "What's new" and "Check for updates". The switch under
// them binds with v-model:auto-update and is drawn only when it is bound.
const props = withDefaults(defineProps<InfoVersionCardProps>(), { unseen: 0, openUrl: openInBrowser });
const autoUpdate = defineModel<boolean | undefined>("autoUpdate", { default: undefined });

const face = computed(() => updateLine(props.state, props.text));
const action = computed(() => updateAction(props.route, props.state, props.text));
const toggle = computed(() => autoSwitch(props.route, props.text));
const number = computed(() => numberLink({ name: props.name, version: props.version, repoUrl: props.repoUrl }));
const newIn = computed(() => (props.state.kind === "available" && props.repoUrl ? `${props.repoUrl}/releases/latest` : ""));

function press() {
  if (action.value?.kind === "restart") props.onRestart?.();
  else if (action.value?.kind === "guide") props.guideUrl && props.openUrl(props.guideUrl);
  else props.onUpdate?.();
}
function open(e: MouseEvent, href: string) {
  e.preventDefault();
  props.openUrl(href);
}
</script>

<template>
  <Card data-glim="InfoVersionCard" :title="text.title" :hint="withApp(text.hint, name)" :hue-index="hueIndex">
    <div class="glim-version-head">
      <span class="glim-version-app">{{ name }}</span>
      <a v-if="number.href" :href="number.href" target="_blank" rel="noopener noreferrer" class="glim-num glim-version-number" @click="open($event, number.href)">{{
        number.shown
      }}</a>
      <span v-else class="glim-num glim-version-number">{{ number.released ? number.shown : text.unreleased(number.shown) }}</span>
    </div>
    <p class="glim-version-state" :data-tone="face.tone" role="status">
      <span class="glim-version-line">{{ face.line }}</span>
      <span v-if="face.note" class="glim-version-note">{{ face.note }}</span>
      <a v-if="newIn && state.kind === 'available'" :href="newIn" target="_blank" rel="noopener noreferrer" class="glim-text-action" @click="open($event, newIn)">{{
        text.newIn(state.version)
      }}</a>
    </p>
    <div
      v-if="state.kind === 'downloading'"
      class="glim-version-progress"
      role="progressbar"
      :aria-label="face.line"
      :aria-valuemin="0"
      :aria-valuemax="100"
      :aria-valuenow="state.percent"
    >
      <span :style="{ width: `${state.percent}%` }" />
    </div>
    <div v-if="action" class="glim-version-actions">
      <Button :label="action.label" :label-key="action.labelKey" :tone="action.kind === 'guide' ? 'neutral' : 'accent'" @click="press" />
    </div>
    <div class="glim-version-links">
      <button type="button" class="glim-text-action" @click="onWhatsNew()">
        <span class="glim-text-action-dot" :data-unseen="unseen > 0 ? '' : undefined" aria-hidden="true" />
        {{ whatsNewLabel(text, unseen) }}
      </button>
      <button v-if="onCheck && route !== 'store'" type="button" class="glim-text-action" :disabled="!canCheck(route, state)" @click="onCheck()">
        {{ text.check }}
      </button>
    </div>
    <FieldRow v-if="toggle && autoUpdate !== undefined" :label="toggle.label" :hint="withApp(toggle.hint, name)">
      <Toggle v-model="autoUpdate" :label="toggle.label" hide-label />
    </FieldRow>
  </Card>
</template>
