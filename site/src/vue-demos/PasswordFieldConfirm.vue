<script setup lang="ts">
import { ref } from "vue";
import { Button, FieldRow, PasswordField } from "@glimstone/vue";

const password = ref("");
const confirmed = ref(false);
const said = ref("");
function save() {
  password.value = "";
  said.value = "Password set";
}
</script>

<template>
  <div style="display: grid; gap: 8px; width: 100%; max-width: 480px">
    <FieldRow label="New password">
      <PasswordField v-model="password" width="medium" confirm @confirmed-change="confirmed = $event" />
    </FieldRow>
    <div>
      <Button label="Set password" :label-key="null" tone="accent" :disabled="!confirmed" @click="save" />
    </div>
    <output>{{ said }}</output>
  </div>
</template>
