<script setup lang="ts">
import { ref } from "vue";
import { DropdownListbox } from "@glimstone/vue";

const ZONES = ["Europe/Vienna", "Europe/Berlin", "America/New_York", "Asia/Tokyo", "UTC"];
const open = ref(false);
const zone = ref(ZONES[0]);
const trigger = ref<HTMLButtonElement | null>(null);

function pick(z: string) {
  zone.value = z;
  open.value = false;
}
</script>

<template>
  <button
    ref="trigger"
    type="button"
    class="field"
    style="min-width: 220px; text-align: start; cursor: pointer"
    aria-haspopup="listbox"
    :aria-expanded="open"
    @click="open = !open"
  >
    {{ zone }}
  </button>
  <DropdownListbox :open="open" :trigger-ref="trigger" label="Time zone" @close="open = false">
    <button
      v-for="z in ZONES"
      :key="z"
      type="button"
      role="option"
      :aria-selected="z === zone"
      class="block w-full px-3 py-2 text-start text-sm text-carbon-text hover:bg-carbon-hover aria-selected:font-semibold"
      @click="pick(z)"
    >
      {{ z }}
    </button>
  </DropdownListbox>
</template>
