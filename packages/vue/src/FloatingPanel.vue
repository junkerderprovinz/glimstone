<script setup lang="ts">
import { computed, useId } from "vue";
import * as floatingPanel from "@zag-js/floating-panel";
import { normalizeProps, useMachine } from "@zag-js/vue";
import { FLOATING_PANEL_TEXT, pageDir, portalTarget, type FloatingPanelText, type PanelSize } from "@glimstone/core";
import Badge from "./Badge.vue";
import Button from "./Button.vue";
import { IconClose, IconWindowMaximise, IconWindowMinimise, IconWindowRestore } from "./glyphs";

// A window that stays open beside the work, bound with v-model:open, such as a
// transfer log, and that somebody moves by its head and sizes by its edges. It
// is a window like any other (rule 15): the same surface and radius, its title
// in the notch and its way out in the foot, at the float step since nothing
// behind it is darkened.
const props = withDefaults(
  defineProps<{
    title: string;
    /** The size it opens at. */
    defaultSize?: PanelSize;
    resizable?: boolean;
    text?: Partial<FloatingPanelText>;
  }>(),
  { defaultSize: () => ({ width: 360, height: 280 }), resizable: true },
);
const open = defineModel<boolean>("open", { required: true });

const AXES = ["n", "e", "s", "w", "ne", "se", "sw", "nw"] as const;
const words = computed(() => ({ ...FLOATING_PANEL_TEXT, ...props.text }));
const id = useId();
const service = useMachine(
  floatingPanel.machine,
  computed(() => ({
    id,
    dir: pageDir(),
    open: open.value,
    defaultSize: props.defaultSize,
    resizable: props.resizable,
    strategy: "fixed" as const,
    closeOnEscape: true,
    onOpenChange: (d: { open: boolean }) => (open.value = d.open),
    translations: { minimize: words.value.minimize, maximize: words.value.maximize, restore: words.value.restore },
  })),
);
const api = computed(() => floatingPanel.connect(service, normalizeProps));
</script>

<template>
  <Teleport :to="portalTarget()">
    <div data-glim="FloatingPanel" class="glim-fpanel-layer">
      <div v-bind="api.getPositionerProps()" class="glim-fpanel-positioner">
        <div v-bind="api.getContentProps()" class="glim-fpanel">
          <div v-bind="api.getDragTriggerProps()" class="glim-fpanel-drag">
            <div v-bind="api.getHeaderProps()" class="glim-fpanel-head">
              <h2 v-bind="api.getTitleProps()" class="glim-panel-heading">
                <Badge tone="heading" size="heading" wrap>{{ title }}</Badge>
              </h2>
              <div v-bind="api.getControlProps()" class="glim-fpanel-control">
                <button v-bind="api.getStageTriggerProps({ stage: 'minimized' })" class="glim-btn-bare glim-icon-btn"><IconWindowMinimise /></button>
                <button v-bind="api.getStageTriggerProps({ stage: 'maximized' })" class="glim-btn-bare glim-icon-btn"><IconWindowMaximise /></button>
                <button v-bind="api.getStageTriggerProps({ stage: 'default' })" class="glim-btn-bare glim-icon-btn"><IconWindowRestore /></button>
              </div>
            </div>
          </div>
          <div v-bind="api.getBodyProps()" class="glim-fpanel-body"><slot /></div>
          <div class="glim-fpanel-foot">
            <Button :label="words.close" :label-key="null" :glyph="IconClose" @click="api.setOpen(false)" />
          </div>
          <template v-if="resizable">
            <div v-for="axis in AXES" :key="axis" v-bind="api.getResizeTriggerProps({ axis })" class="glim-fpanel-edge" />
          </template>
        </div>
      </div>
    </div>
  </Teleport>
</template>
