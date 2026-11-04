<script setup lang="ts">
import { ref } from "vue";
import { PasswordField } from "@glimstone/vue";

const secret = ref("correct horse");
</script>

<template>
  <div style="display: grid; gap: 8px; width: 320px">
    <input class="glim-input" aria-label="User name" value="anna" />
    <PasswordField v-model="secret" aria-label="Password" />
    <PasswordField model-value="read-only token" aria-label="Token" disabled readonly />
  </div>
</template>
