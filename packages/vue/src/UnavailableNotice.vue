<script setup lang="ts">
// What a card shows in place of a control when the environment forbids what
// the control would do, such as a passkey on a bare IP address. The reason
// goes in the default slot, so a hostname or a path in it can be marked up,
// and the `action` slot holds what somebody can do from here, never the
// control that was refused.
defineProps<{ title: string }>();
</script>

<template>
  <div class="glim-notice">
    <p class="glim-notice-title">{{ title }}</p>
    <p class="glim-notice-reason"><slot /></p>
    <div v-if="$slots.action" class="glim-notice-action"><slot name="action" /></div>
  </div>
</template>
