<script setup lang="ts">
import { computed } from "vue";
import { autoSwitch, checkButton, numberLink, openInBrowser, updateAction, updateLine, whatsNewLabel, withApp } from "@glimstone/core";
import type { InfoVersionCardProps } from "./info";
import Button from "./Button.vue";
import Card from "./Card.vue";
import FieldRow from "./FieldRow.vue";
import Toggle from "./Toggle.vue";

// The first card of the Info tile: the app's name and version, the switch, and
// a last row with where the updates stand at its start and the buttons at its
// end. The switch binds with v-model:auto-update and is drawn only when bound.
const props = withDefaults(defineProps<InfoVersionCardProps>(), { unseen: 0, openUrl: openInBrowser });
const autoUpdate = defineModel<boolean | undefined>("autoUpdate", { default: undefined });

const face = computed(() => updateLine(props.state, props.text));
const action = computed(() => updateAction(props.route, props.state, props.text));
const toggle = computed(() => autoSwitch(props.route, props.text));
const number = computed(() => numberLink({ name: props.name, version: props.version, repoUrl: props.repoUrl }));
const check = computed(() => checkButton(props.route, props.state));

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
    <FieldRow v-if="toggle && autoUpdate !== undefined" :label="toggle.label" :hint="withApp(toggle.hint, name)">
      <Toggle v-model="autoUpdate" :label="toggle.label" hide-label />
    </FieldRow>
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
    <div class="glim-version-foot">
      <p class="glim-version-state" :data-tone="face.tone" role="status">
        <span class="glim-version-line">{{ face.line }}</span>
        <span v-if="face.note" class="glim-version-note">{{ face.note }}</span>
      </p>
      <div class="glim-version-actions">
        <Button :label="whatsNewLabel(text, unseen)" label-key="version.whatsNew" @click="onWhatsNew()">
          <template #before><span class="glim-version-dot" :data-unseen="unseen > 0 ? '' : undefined" aria-hidden="true" /></template>
        </Button>
        <Button v-if="check && onCheck" :label="text.check" label-key="version.check" :busy="check.busy" :disabled="check.busy" @click="onCheck()" />
        <Button v-if="action" :label="action.label" :label-key="action.labelKey" :tone="action.kind === 'guide' ? 'neutral' : 'accent'" @click="press" />
      </div>
    </div>
  </Card>
</template>
