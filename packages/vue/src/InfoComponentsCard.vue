<script setup lang="ts">
import { computed } from "vue";
import { componentRows, designRow, numberLink, openInBrowser, withApp } from "@glimstone/core";
import type { InfoComponentsCardProps } from "./info";
import Button from "./Button.vue";
import Card from "./Card.vue";
import FieldRow from "./FieldRow.vue";
import InfoBubble from "./InfoBubble.vue";
import Toggle from "./Toggle.vue";

// The second card of the Info tile: every version the app is made of or brings
// along, as plain numbers in a fixed order, with a status and one action on a
// row that needs one. The switch binds with v-model:auto-update and is drawn
// only when it is bound.
const props = withDefaults(defineProps<InfoComponentsCardProps>(), { updating: false, openUrl: openInBrowser });
const autoUpdate = defineModel<boolean | undefined>("autoUpdate", { default: undefined });

const sorted = computed(() => componentRows([...props.rows, designRow(props.text)]).map((row) => ({ row, link: numberLink(row) })));

function open(e: MouseEvent, href: string) {
  e.preventDefault();
  props.openUrl(href);
}
</script>

<template>
  <Card data-glim="InfoComponentsCard" :title="text.title" :hint="withApp(text.hint, name)" :hue-index="hueIndex">
    <ul class="glim-version-rows">
      <li v-for="{ row, link } in sorted" :key="row.name" class="glim-version-row">
        <span class="glim-version-name">
          <span class="glim-version-part">{{ row.name }}</span>
          <InfoBubble v-if="row.hint" :tip="row.hint" />
        </span>
        <span v-if="row.status" class="glim-version-status" :data-tone="row.tone">{{ row.status }}</span>
        <Button v-if="row.action" :label="row.action.label" :label-key="row.action.labelKey" @click="row.action.onClick()" />
        <a v-if="link.href" :href="link.href" target="_blank" rel="noopener noreferrer" class="glim-num glim-version-number" @click="open($event, link.href)">{{
          link.shown
        }}</a>
        <span v-else class="glim-num glim-version-number">{{ link.released ? link.shown : text.unreleased(link.shown) }}</span>
      </li>
    </ul>
    <FieldRow v-if="autoUpdate !== undefined" :label="text.auto" :hint="withApp(text.autoHint, name)">
      <Toggle v-model="autoUpdate" :label="text.auto" hide-label />
    </FieldRow>
    <div v-if="onUpdate" class="glim-version-actions">
      <Button :label="text.update" label-key="components.update" :busy="updating" @click="onUpdate()" />
    </div>
  </Card>
</template>
