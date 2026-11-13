<script setup lang="ts">
import { presenceTone, type FortressInstance, type FortressText } from "@glimstone/core";
import Badge from "./Badge.vue";

// The state of one instance: reached through the relay, and connected, checking or away.
const props = defineProps<{ instance: FortressInstance; text: FortressText }>();
const presence = () => ({ connected: props.text.connected, checking: props.text.checking, away: props.text.away })[props.instance.presence];
</script>

<template>
  <span data-glim="PresenceBadges" style="display: contents">
    <Badge v-if="instance.relay">{{ text.viaRelay }}</Badge>
    <Badge :tone="presenceTone(instance.presence)">{{ presence() }}</Badge>
  </span>
</template>
