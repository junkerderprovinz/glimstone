<script setup lang="ts">
import { computed } from "vue";
import { appCardView, openInBrowser, presenceTone, type FortressApp, type FortressInstance, type FortressText } from "@glimstone/core";
import Badge from "./Badge.vue";
import Button from "./Button.vue";
import InstanceCard from "./InstanceCard.vue";
import { glyphFor } from "./glyphs";

// Another app of the fortress: its state, where it runs, and the way to open
// it. A device's glyph is asked for by its kind through the app's resolver
// (`deviceServer`, `devicePc`, `deviceLaptop`, `devicePhone`).
const props = defineProps<{
  app: FortressApp;
  text: FortressText;
  /** The interface language, for the counts. */
  lang: string;
  hueIndex?: number;
  /** Opens an instance's own page. Without it the page opens in a new tab. */
  onOpen?: (app: FortressApp, instance: FortressInstance) => void;
}>();

const view = computed(() => appCardView(props.app, props.text, props.lang));
const presence = (i: FortressInstance) => ({ connected: props.text.connected, checking: props.text.checking, away: props.text.away })[i.presence];
const device = (i: FortressInstance) => (i.deviceKind ? glyphFor(`device${i.deviceKind[0].toUpperCase()}${i.deviceKind.slice(1)}`) : undefined);

function open() {
  const { main, open } = view.value;
  if (props.onOpen) props.onOpen(props.app, main);
  else if (open) openInBrowser(open.href);
}
</script>

<template>
  <InstanceCard :data-fortress-app="app.id" :logo="app.logo" :name="app.name" :eyebrow="view.eyebrow" :facts="view.facts" :hue-index="hueIndex">
    <template #badges>
      <Badge v-if="view.needs" tone="warn">{{ view.needs }}</Badge>
      <Badge v-if="view.main.relay">{{ text.viaRelay }}</Badge>
      <Badge :tone="presenceTone(view.main.presence)">{{ presence(view.main) }}</Badge>
    </template>
    <template v-if="view.rows.length" #default>
      <ul class="glim-instance-rows">
        <li v-for="{ instance, sub } in view.rows" :key="instance.id" class="glim-instance-row" :data-instance="instance.id">
          <span class="glim-instance-device" aria-hidden="true"><component :is="device(instance)" v-if="device(instance)" /></span>
          <span class="glim-instance-row-text">
            <span class="glim-instance-row-name">{{ instance.device }}</span>
            <span class="glim-instance-row-sub glim-num">{{ sub }}</span>
          </span>
          <Badge :tone="presenceTone(instance.presence)">{{ presence(instance) }}</Badge>
        </li>
      </ul>
    </template>
    <template #actions>
      <Button v-if="view.open" :label="view.open.label" label-key="open" @click="open" />
      <span v-else class="glim-instance-note">{{ view.note }}</span>
    </template>
  </InstanceCard>
</template>
