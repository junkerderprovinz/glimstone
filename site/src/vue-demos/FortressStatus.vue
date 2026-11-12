<script setup lang="ts">
import { ref } from "vue";
import { Button, FortressStatusWindow } from "@glimstone/vue";
import { fortressTextEn as text, openRefusalText } from "@glimstone/core";
import { OPEN_APPS, STATUS_LOG, STATUS_REPORT } from "../fortressData";

// The status window of a plugin while its report comes, once it is there,
// and when it does not come.
const delta = OPEN_APPS.find((a) => a.id === "delta")!;
const shown = ref<"report" | "loading" | "error" | null>(null);
</script>

<template>
  <div class="fortress-demo">
    <div class="demo-buttons">
      <Button label="With a report" :label-key="null" data-hook="report" @click="shown = 'report'" />
      <Button label="Loading" :label-key="null" data-hook="loading" @click="shown = 'loading'" />
      <Button label="Not reached" :label-key="null" data-hook="error" @click="shown = 'error'" />
    </div>
    <FortressStatusWindow
      v-if="shown"
      :app="delta"
      :instance="delta.instances[0]!"
      :report="shown === 'report' ? STATUS_REPORT : undefined"
      :log="shown === 'report' ? STATUS_LOG : undefined"
      :loading="shown === 'loading'"
      :error="shown === 'error' ? openRefusalText(text, 'unreachable') : undefined"
      :text="text"
      lang="en"
      @close="shown = null"
    />
  </div>
</template>
