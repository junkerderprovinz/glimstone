<script setup lang="ts">
import { defineComponent, h, ref } from "vue";
import { Button, ColorPicker, Window } from "@glimstone/vue";

const Swatch = defineComponent({
  props: { label: { type: String, required: true } },
  setup(props) {
    const colour = ref<{ hex: string; name: string | null }>({ hex: "#1b6b73", name: "Petrol" });
    const anchor = ref<HTMLElement | null>(null);
    return () =>
      h("span", { class: "demo-swatch-row" }, [
        h("button", {
          type: "button",
          "aria-label": props.label,
          class: "demo-swatch",
          style: { backgroundColor: colour.value.hex },
          onClick: (e: MouseEvent) => (anchor.value = anchor.value ? null : (e.currentTarget as HTMLElement)),
        }),
        h("span", { "data-applied": "" }, `${colour.value.name} ${colour.value.hex}`),
        anchor.value &&
          h(ColorPicker, {
            modelValue: colour.value.hex,
            anchor: anchor.value,
            onApply: (hex: string, name: string | null) => (colour.value = { hex, name }),
            onClose: () => (anchor.value = null),
          }),
      ]);
  },
});

const open = ref(false);
</script>

<template>
  <div style="display: flex; gap: 16px; align-items: center; flex-wrap: wrap">
    <Swatch label="Label colour" />
    <Button label="Open in a window" :label-key="null" @click="open = true" />
    <Window v-if="open" title="Label" :text="{ cancel: 'Cancel', close: 'Close' }" @close="open = false">
      <Swatch label="Label colour in the window" />
    </Window>
  </div>
</template>
