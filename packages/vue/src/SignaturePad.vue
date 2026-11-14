<script setup lang="ts">
import { computed, useId } from "vue";
import * as signaturePad from "@zag-js/signature-pad";
import { normalizeProps, useMachine } from "@zag-js/vue";
import { SIGNATURE_PAD_TEXT, pageDir, type SignaturePadText } from "@glimstone/core";
import Button from "./Button.vue";
import { IconResetArrow } from "./glyphs";

// A signature drawn with a mouse, a pen or a finger, bound with v-model to its
// strokes as SVG path data, such as the approval of a handover. The strokes
// are drawn in the text colour on the second surface over a hairline to sign on.
const props = withDefaults(
  defineProps<{
    label: string;
    disabled?: boolean;
    text?: Partial<SignaturePadText>;
  }>(),
  { disabled: false },
);
const value = defineModel<string[]>({ required: true });

const words = computed(() => ({ ...SIGNATURE_PAD_TEXT, ...props.text }));
const id = useId();
const service = useMachine(
  signaturePad.machine,
  computed(() => ({
    id,
    dir: pageDir(),
    paths: value.value,
    disabled: props.disabled,
    drawing: { fill: "currentColor", size: 2, simulatePressure: true },
    // Controlled, the machine hands a finished stroke over through onDraw. While
    // a stroke is under way it reports it as currentPath.
    onDraw: (d: { paths: string[]; currentPath: string | null }) => d.currentPath === null && (value.value = d.paths),
    translations: { control: words.value.area, clearTrigger: words.value.clear },
  })),
);
const api = computed(() => signaturePad.connect(service, normalizeProps));
function clear() {
  api.value.clear();
  value.value = [];
}
</script>

<template>
  <div data-glim="SignaturePad" v-bind="api.getRootProps()" class="glim-signature">
    <label v-bind="api.getLabelProps()" class="glim-field-label">{{ label }}</label>
    <div v-bind="api.getControlProps()" class="glim-signature-pad">
      <svg v-bind="api.getSegmentProps()" class="glim-signature-ink">
        <path v-for="(path, i) in api.paths" :key="i" v-bind="api.getSegmentPathProps({ path })" />
        <path v-if="api.currentPath" v-bind="api.getSegmentPathProps({ path: api.currentPath })" />
      </svg>
      <div v-bind="api.getGuideProps()" class="glim-signature-guide" />
    </div>
    <div class="glim-signature-foot">
      <Button :label="words.clear" :label-key="null" :glyph="IconResetArrow" :disabled="api.empty || disabled" @click="clear" />
    </div>
    <input v-bind="api.getHiddenInputProps({ value: api.paths.join(' ') })" />
  </div>
</template>
