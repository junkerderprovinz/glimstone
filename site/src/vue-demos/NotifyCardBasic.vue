<script setup lang="ts">
import { ref } from "vue";
import { NotifyCard } from "@glimstone/vue";
import { demoNotify, NOTIFY_APP, NOTIFY_CHECKS, NOTIFY_ELSEWHERE, NOTIFY_EVENTS, NOTIFY_PROVIDERS, NOTIFY_TEXT } from "../notifyData";

// Four channels of a made-up app. Discord's test comes back refused, and a
// channel saved without its address is refused at that field.
const api = demoNotify();
const said = ref("Nothing yet");
</script>

<template>
  <div class="notify-card-demo">
    <NotifyCard
      :api="api"
      :text="NOTIFY_TEXT"
      :app="NOTIFY_APP"
      lang="en"
      :providers="NOTIFY_PROVIDERS"
      :events="NOTIFY_EVENTS"
      :checks="NOTIFY_CHECKS"
      :unavailable="NOTIFY_ELSEWHERE"
      :notify="(m: string) => (said = m)"
    />
    <output data-hook="said">{{ said }}</output>
  </div>
</template>
