<script setup lang="ts">
import { ref, shallowRef } from "vue";
import { FortressAppCard, FortressStatusWindow } from "@glimstone/vue";
import { fortressTextEn as text, memberName, openRefusalText, type FortressApp, type FortressInstance } from "@glimstone/core";
import { OPEN_APPS, STATUS_LOG, STATUS_REPORT } from "../fortressData";

// Open goes through the app's onOpen: Delta is a plugin and shows its status,
// Echo refuses until it has a password, which the app's toast says, and the
// two Bravos on Atlas ask first.
const said = ref("Nothing yet");
const status = shallowRef<{ app: FortressApp; instance: FortressInstance } | null>(null);

function onOpen(app: FortressApp, instance: FortressInstance) {
  if (instance.form === "plugin") status.value = { app, instance };
  else if (app.id === "echo") said.value = `Toast: ${openRefusalText(text, "ui_no_login")}`;
  else said.value = `Opened ${memberName(text, app, instance)} (${instance.id})`;
}
</script>

<template>
  <div class="fortress-demo">
    <div class="glim-fortress-grid">
      <FortressAppCard v-for="(a, i) in OPEN_APPS" :key="a.id" :app="a" :text="text" lang="en" :hue-index="i" :on-open="onOpen" />
    </div>
    <FortressStatusWindow
      v-if="status"
      :app="status.app"
      :instance="status.instance"
      :report="STATUS_REPORT"
      :log="STATUS_LOG"
      :text="text"
      lang="en"
      @close="status = null"
    />
    <output data-hook="said">{{ said }}</output>
  </div>
</template>
