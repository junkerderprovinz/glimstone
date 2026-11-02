<script setup lang="ts">
import { computed, shallowRef } from "vue";
import { openInBrowser, runUpdateCheck, updateFace, updateStage, versionLink, type UpdateVerdict } from "@glimstone/core";
import type { InfoVersionCardProps } from "./info";
import Button from "./Button.vue";
import Card from "./Card.vue";

// The first card of the Info tile: every version as a row, then the app's
// own "New · n" button (the `whats-new` slot) or "Release notes", and the
// update check, which shows its verdict on itself like a test button.
const props = withDefaults(defineProps<InfoVersionCardProps>(), { openUrl: openInBrowser });
const slots = defineSlots<{ "whats-new"?: () => unknown }>();

const notes = computed(() => !slots["whats-new"] && props.onReleaseNotes && props.text.releaseNotes);
const verdict = shallowRef<UpdateVerdict>({ kind: "idle" });
const shakes = shallowRef(0);
const face = computed(() => props.updateCheck && updateFace(verdict.value, props.updateCheck.text));

function check() {
  void runUpdateCheck(props.updateCheck!, verdict.value, (v) => {
    verdict.value = v;
    if (v.kind === "failed") shakes.value++;
  });
}
function open(e: MouseEvent, href: string) {
  e.preventDefault();
  props.openUrl(href);
}
</script>

<template>
  <Card :title="text.title" :hint="text.hint" :hue-index="hueIndex">
    <ul class="glim-version-rows">
      <li v-for="row in rows" :key="row.name" class="glim-version-row">
        <span class="glim-version-name">
          <span class="glim-version-part">{{ row.name }}</span>
          <span v-if="row.sub" class="glim-version-sub">{{ row.sub }}</span>
        </span>
        <!-- No underline on the link; the ink lifts on hover. -->
        <a
          v-if="versionLink(row).href"
          :href="versionLink(row).href"
          target="_blank"
          rel="noopener noreferrer"
          class="glim-num glim-version-number"
          @click="open($event, versionLink(row).href!)"
        >{{ versionLink(row).shown }}</a>
        <span v-else class="glim-num glim-version-number">
          {{ versionLink(row).released ? versionLink(row).shown : text.unreleased(versionLink(row).shown) }}
        </span>
      </li>
    </ul>
    <div v-if="notes || $slots['whats-new'] || updateCheck" class="glim-version-actions">
      <Button v-if="notes" :label="text.releaseNotes!" label-key="about.releaseNotes" @click="onReleaseNotes!()" />
      <slot name="whats-new" />
      <template v-if="updateCheck && face">
        <Button
          :key="shakes"
          :label="face.label"
          :label-key="face.labelKey"
          :tone="face.tone"
          :stage="updateStage(updateCheck.text, face.label)"
          :busy="verdict.kind === 'busy'"
          :class="shakes > 0 ? 'glim-shake' : ''"
          @click="check"
        />
        <span role="status" class="glim-sr-only">{{ face.announced }}</span>
      </template>
    </div>
  </Card>
</template>
