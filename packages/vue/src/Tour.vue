<script setup lang="ts">
import { computed, useId, watch } from "vue";
import * as tour from "@zag-js/tour";
import { normalizeProps, useMachine } from "@zag-js/vue";
import { TOUR_TEXT, pageDir, portalTarget, tourSteps, type TourStep, type TourText } from "@glimstone/core";
import Badge from "./Badge.vue";
import Button from "./Button.vue";
import { IconBack, IconCheck, IconForward } from "./glyphs";

// A short walk through a screen, bound with v-model:open, one step a part of
// it, such as the first start of a new page. The page behind is darkened and
// blurred like the page behind a window, with the part the step points at
// left clear, and the step is a small window beside it: its title in the
// notch, Back and Next in its foot.
const props = defineProps<{
  steps: readonly TourStep[];
  text?: Partial<TourText>;
}>();
const open = defineModel<boolean>("open", { required: true });

const words = computed(() => ({ ...TOUR_TEXT, ...props.text }));
const id = useId();
const service = useMachine(
  tour.machine,
  computed(() => ({
    id,
    dir: pageDir(),
    steps: tourSteps(props.steps),
    onStatusChange: (d: { status: string }) => {
      if (d.status === "dismissed" || d.status === "completed" || d.status === "skipped") {
        open.value = false;
      }
    },
  })),
);
const api = computed(() => tour.connect(service, normalizeProps));
// The machine ends a tour through its close trigger. Next on the last step
// would only stay where it is.
const end = () => (api.value.getCloseTriggerProps().onClick as () => void)();
watch(open, (on) => on && !api.value.open && api.value.start(), { immediate: true });
</script>

<template>
  <Teleport :to="portalTarget()">
    <div v-if="api.open && api.step" data-glim="Tour" class="glim-tour-layer">
      <div v-bind="api.getBackdropProps()" class="glim-tour-backdrop" />
      <div v-bind="api.getSpotlightProps()" class="glim-tour-spotlight" />
      <div v-bind="api.getPositionerProps()" class="glim-tour-positioner">
        <div v-bind="api.getContentProps()" class="glim-tour">
          <h2 v-bind="api.getTitleProps()" class="glim-panel-heading">
            <Badge tone="heading" size="heading" wrap>{{ api.step.title }}</Badge>
          </h2>
          <p v-bind="api.getDescriptionProps()" class="glim-tour-text">{{ api.step.description }}</p>
          <div class="glim-tour-foot">
            <span v-bind="api.getProgressTextProps()" class="glim-tour-progress glim-num">{{ words.progress(api.stepIndex + 1, api.totalSteps) }}</span>
            <Button :label="words.back" :label-key="null" :glyph="IconBack" :disabled="!api.hasPrevStep" @click="api.prev()" />
            <Button v-if="api.lastStep" :label="words.close" :label-key="null" :glyph="IconCheck" tone="accent" @click="end" />
            <Button v-else :label="words.next" :label-key="null" :glyph="IconForward" tone="accent" @click="api.next()" />
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>
