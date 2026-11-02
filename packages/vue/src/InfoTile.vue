<script setup lang="ts">
import InfoAboutCard from "./InfoAboutCard.vue";
import InfoHelpCard from "./InfoHelpCard.vue";
import InfoVersionCard from "./InfoVersionCard.vue";
import type { InfoAboutCardProps, InfoHelpCardProps, InfoVersionCardProps } from "./info";

// The Info tile's cards in their fixed order (design-language.md, "The Info
// tile and the About card"), without a wrapper, so they stack in the page's own
// rhythm. `hueIndex` is the Version card's rainbow position; the others take
// the next ones. The `whats-new` slot goes to the Version card.
const props = defineProps<{
  version: Omit<InfoVersionCardProps, "hueIndex">;
  help: Omit<InfoHelpCardProps, "hueIndex">;
  about: Omit<InfoAboutCardProps, "hueIndex">;
  hueIndex?: number;
}>();
const at = (offset: number) => (props.hueIndex === undefined ? undefined : props.hueIndex + offset);
</script>

<template>
  <InfoVersionCard v-bind="version" :hue-index="at(0)">
    <template v-if="$slots['whats-new']" #whats-new><slot name="whats-new" /></template>
  </InfoVersionCard>
  <InfoHelpCard v-bind="help" :hue-index="at(1)" />
  <InfoAboutCard v-bind="about" :hue-index="at(2)" />
</template>
