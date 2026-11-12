<script setup lang="ts">
import { computed } from "vue";
import { hueVars } from "@glimstone/core";

// One instance as a card in the Instances grid, or one app of the fortress
// with a row for each place it runs ("The fortress" in the design language).
// The slot `logo` takes the place of the `logo` address, `badges` stands
// after the name, the default slot is the body under the head, and `actions`
// holds the card's buttons, beside the mark where there is no body.
const props = defineProps<{
  /** The address of the app's mark. */
  logo?: string;
  /** The device's name for an instance of this app, the app's name for another app. */
  name: string;
  eyebrow?: string;
  /** One quiet line of facts, joined with a dot. Empty ones are left out. */
  facts?: (string | undefined)[];
  /** A few numbers under the facts, each with its small label. */
  figures?: { value: string; label: string }[];
  /** The card's position in the rainbow, counted over the cards on the page. */
  hueIndex?: number;
}>();

const shown = computed(() => (props.facts ?? []).filter(Boolean).join(" · "));
const style = computed(() => (props.hueIndex !== undefined ? hueVars(props.hueIndex) : undefined));
</script>

<template>
  <div data-glim="InstanceCard" :data-glim-title="name" :class="['glim-card glim-instance', hueIndex !== undefined && 'glim-hue']" :style="style">
    <div class="glim-instance-top">
      <span v-if="$slots.logo" class="glim-instance-mark" aria-hidden="true"><slot name="logo" /></span>
      <img v-else-if="logo" class="glim-instance-mark" :src="logo" alt="" draggable="false" />
      <div class="glim-instance-main">
        <div class="glim-instance-name">
          <h3 class="glim-instance-title">{{ name }}</h3>
          <span v-if="$slots.badges" class="glim-instance-badges"><slot name="badges" /></span>
        </div>
        <span v-if="eyebrow" class="glim-eyebrow">{{ eyebrow }}</span>
        <p v-if="shown" class="glim-instance-facts glim-num">{{ shown }}</p>
        <dl v-if="figures?.length" class="glim-instance-figures">
          <div v-for="f in figures" :key="f.label">
            <dt>{{ f.label }}</dt>
            <dd class="glim-num">{{ f.value }}</dd>
          </div>
        </dl>
        <div v-if="$slots.actions && !$slots.default" class="glim-instance-acts"><slot name="actions" /></div>
      </div>
    </div>
    <div v-if="$slots.default" class="glim-instance-body"><slot /></div>
    <div v-if="$slots.actions && $slots.default" class="glim-instance-acts"><slot name="actions" /></div>
  </div>
</template>
