<script setup lang="ts">
import { shallowRef } from "vue";
import Badge from "./Badge.vue";
import Button from "./Button.vue";

// The window for Buy Me a Coffee: the maker's own BMAC widget inside a house
// window, so a donor pays without leaving the app.
//
// The widget page is the one BMAC page that allows framing; the profile page
// answers X-Frame-Options: SAMEORIGIN. It keeps BMAC's look and every feature
// BMAC offers there, card and wallet payments included. Mount the window only
// while it is open, so nothing from BMAC loads before somebody asks for it.
// `card` is exposed for the app's Escape handling and focus trap.
defineProps<{
  /** `https://buymeacoffee.com/widget/page/<handle>` with its query. */
  widgetUrl: string;
  text: {
    title: string;
    /** The app's appeal, the same in every giving window. */
    appeal: string;
    /** One sentence: the payment happens at BMAC, and no account is needed. */
    intro: string;
    closeLabel: string;
  };
}>();
const emit = defineEmits<{ close: [] }>();
const card = shallowRef<HTMLDivElement | null>(null);
defineExpose({ card });
</script>

<!-- As tall as the screen allows less a margin: BMAC's payment step is about
     1200px, and every pixel here is scrolling a donor is spared. -->
<template>
  <div class="glim-modal-backdrop" @click.self="emit('close')">
    <div
      ref="card"
      data-glim="CoffeeDialog"
      :data-glim-title="text.title"
      tabindex="-1"
      role="dialog"
      aria-modal="true"
      aria-labelledby="coffee-title"
      class="glim-modal-card glim-modal-card--wide glim-modal-card--tall"
    >
      <div class="glim-modal-head">
        <h2 id="coffee-title" class="glim-modal-title">
          <Badge tone="heading" size="heading" wrap>{{ text.title }}</Badge>
        </h2>
      </div>
      <div class="glim-give-body">
        <p class="glim-give-appeal">{{ text.appeal }}</p>
        <p class="glim-give-intro">{{ text.intro }}</p>
        <div class="glim-give-frame">
          <iframe :src="widgetUrl" :title="text.title" allow="payment" class="glim-give-iframe" />
        </div>
      </div>
      <div class="glim-give-foot">
        <Button :label="text.closeLabel" label-key="common.close" tone="neutral" @click="emit('close')" />
      </div>
    </div>
  </div>
</template>
