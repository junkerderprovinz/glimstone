<script setup lang="ts">
import { ref } from "vue";
import { FieldRow, FieldRowGroup, PasswordField, TextField, Toggle } from "@glimstone/vue";

const notify = ref(true);
</script>

<template>
  <div style="width: 100%; max-width: 480px">
    <FieldRowGroup>
      <FieldRow label="Find">
        <TextField width="grow" model-value="report" />
      </FieldRow>
      <FieldRow label="Replace with">
        <TextField width="grow" model-value="summary" />
      </FieldRow>
      <FieldRow label="Password">
        <PasswordField width="grow" />
      </FieldRow>
      <FieldRow label="Notify">
        <Toggle v-model="notify" />
      </FieldRow>
      <FieldRow label="Hours">
        <TextField label="From" width="short" model-value="08:00" />
        <TextField label="To" width="short" model-value="17:00" />
      </FieldRow>
      <FieldRow label="Last run" value="2 hours ago" />
    </FieldRowGroup>
  </div>
</template>
