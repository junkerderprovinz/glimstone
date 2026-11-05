<script setup lang="ts">
import { ref } from "vue";
import { Button, PasswordField } from "@glimstone/vue";

const secret = ref("correct horse");
const field = ref<InstanceType<typeof PasswordField> | null>(null);
</script>

<template>
  <div style="display: grid; gap: 8px; width: 320px">
    <input class="glim-input" aria-label="User name" value="anna" />
    <PasswordField ref="field" v-model="secret" aria-label="Password" :eye-attrs="{ 'data-hook': 'eye' }" />
    <PasswordField model-value="read-only token" aria-label="Token" disabled readonly />
    <div>
      <Button label="Focus the password" :label-key="null" @click="field?.input?.focus()" />
    </div>
  </div>
</template>
