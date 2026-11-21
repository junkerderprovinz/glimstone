<script setup lang="ts">
import InfoAboutCard from "./InfoAboutCard.vue";
import InfoComponentsCard from "./InfoComponentsCard.vue";
import InfoHelpCard from "./InfoHelpCard.vue";
import InfoVersionCard from "./InfoVersionCard.vue";
import type { InfoAboutCardProps, InfoComponentsCardProps, InfoHelpCardProps, InfoVersionCardProps } from "./info";

// The Info tile's cards in their fixed order (design-language.md, "The Info
// tile and the About card"): Version, Components, Help and About, in a wrapper
// that draws no box, so they stack in the page's own rhythm. `hueIndex` is the
// Version card's rainbow position; the others take the next ones. A switch
// rides along in its card's object as `autoUpdate` with `onUpdate:autoUpdate`.
type Switch = { autoUpdate?: boolean; "onUpdate:autoUpdate"?: (on: boolean | undefined) => void };
const props = defineProps<{
  version: Omit<InfoVersionCardProps, "hueIndex"> & Switch;
  components: Omit<InfoComponentsCardProps, "hueIndex"> & Switch;
  help: Omit<InfoHelpCardProps, "hueIndex">;
  about: Omit<InfoAboutCardProps, "hueIndex">;
  hueIndex?: number;
}>();
const at = (offset: number) => (props.hueIndex === undefined ? undefined : props.hueIndex + offset);
</script>

<template>
  <div data-glim="InfoTile" style="display: contents">
    <InfoVersionCard v-bind="version" :hue-index="at(0)" />
    <InfoComponentsCard v-bind="components" :hue-index="at(1)" />
    <InfoHelpCard v-bind="help" :hue-index="at(2)" />
    <InfoAboutCard v-bind="about" :hue-index="at(3)" />
  </div>
</template>
