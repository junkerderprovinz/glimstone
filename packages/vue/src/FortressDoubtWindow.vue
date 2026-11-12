<script setup lang="ts">
import { computed } from "vue";
import { doubtView, type FortressApp, type FortressInstance, type FortressText } from "@glimstone/core";
import Window from "./Window.vue";
import type { WindowAction } from "./windowParts";

// The question before an instance with `doubt` opens: two members claim the
// same app on the same device, so the person opens one only by the end of its
// id. An app that draws the other apps in cards of its own shows it before
// `onOpen`.
const props = defineProps<{
  app: FortressApp;
  instance: FortressInstance;
  text: FortressText;
  /** Runs on Open anyway. The window closes either way. */
  onOpen: () => void;
  onClose: () => void;
}>();

const view = computed(() => doubtView(props.text, props.app, props.instance));
const actions = computed<WindowAction[]>(() => [
  { label: view.value.open, labelKey: "open", primary: true, attrs: { "data-fortress": "open-anyway" }, onClick: () => props.onOpen() },
]);
</script>

<template>
  <Window data-glim="FortressDoubtWindow" :title="view.title" :actions="actions" :text="{ cancel: text.cancel, close: text.close }" @close="onClose()">
    <div class="glim-fortress-text">
      <p>{{ view.body }}</p>
    </div>
  </Window>
</template>
