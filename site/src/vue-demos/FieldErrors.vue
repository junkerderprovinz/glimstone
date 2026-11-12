<script setup lang="ts">
import { computed, ref } from "vue";
import { FieldRow, NumberField, PasswordField, TextField } from "@glimstone/vue";

const port = ref("8080");
const job = ref("nightly");
const portError = computed(() => (/^\d{1,5}$/.test(port.value) && Number(port.value) <= 65535 ? undefined : "A port is a number up to 65535"));
</script>

<template>
  <div data-column style="display: grid; gap: 12px; width: 420px; justify-items: start">
    <TextField v-model="port" label="Port" width="short" :error="portError" />
    <div style="width: 100%">
      <FieldRow label="Job name">
        <TextField v-model="job" width="medium" :error="job.trim() ? undefined : 'A job needs a name'" />
      </FieldRow>
    </div>
    <PasswordField aria-label="Token" model-value="short" error="A token has 32 characters" />
    <NumberField aria-label="Keep" :model-value="0" :min="0" error="Keep at least one copy" />
  </div>
</template>
