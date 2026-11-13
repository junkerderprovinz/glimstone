<script setup lang="ts">
import { ref } from "vue";
import { WindowBar } from "@glimstone/vue";

const maximised = ref(false);
const last = ref("Nothing yet");

function toggle() {
  last.value = maximised.value ? "Restored" : "Maximised";
  maximised.value = !maximised.value;
}
</script>

<template>
  <div class="demo-window">
    <WindowBar
      app-name="Example"
      :maximised="maximised"
      :text="{ minimise: 'Minimise', maximise: 'Maximise', restore: 'Restore', close: 'Close' }"
      @minimise="last = 'Minimised'"
      @toggle-maximise="toggle"
      @close="last = 'Closed'"
      @drag-start="last = 'Moving the window'"
    />
    <p class="demo-window-log" role="status">{{ last }}</p>
  </div>
</template>
