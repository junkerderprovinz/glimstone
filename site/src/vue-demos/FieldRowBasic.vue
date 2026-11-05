<script setup lang="ts">
import { ref } from "vue";
import { CopyField, FieldRow, NumberField, PasswordField, Selector, TextField, Toggle } from "@glimstone/vue";
import { Select } from "@glimstone/vue/Select";

const LEVELS = [
  { id: "fast", label: "Fast" },
  { id: "even", label: "Even" },
  { id: "small", label: "Small" },
];
const KEEP = [
  { value: "week", label: "One week" },
  { value: "month", label: "One month" },
  { value: "year", label: "One year" },
];
const name = ref("backup-weekly");
const notify = ref(true);
const level = ref("even");
const keep = ref<string | null>("month");
const secret = ref("");
const copies = ref<number | null>(3);
const address = ref("smb://bottich/media");
</script>

<template>
  <div style="display: grid; gap: 8px; width: 100%; max-width: 560px">
    <FieldRow label="Name" hint="Shown in the list of jobs.">
      <TextField v-model="name" width="medium" />
    </FieldRow>
    <FieldRow label="Notify">
      <Toggle v-model="notify" />
    </FieldRow>
    <FieldRow label="Compression">
      <Selector v-model="level" :items="LEVELS" activation="manual" size="sm" button-height />
    </FieldRow>
    <FieldRow label="Keep">
      <Select v-model="keep" :options="KEEP" />
    </FieldRow>
    <FieldRow label="Password">
      <PasswordField v-model="secret" width="medium" />
    </FieldRow>
    <FieldRow label="Copies">
      <NumberField v-model="copies" min="1" max="9" />
    </FieldRow>
    <FieldRow label="Link">
      <CopyField value="smb://bottich/media" class="glim-field--wide" />
    </FieldRow>
    <FieldRow label="Token">
      <template #label>Token <small>optional</small></template>
      <TextField width="medium" />
    </FieldRow>
    <FieldRow label="Mirror">
      <TextField width="medium" label="Its own name" />
    </FieldRow>
    <FieldRow label="Address">
      <TextField v-model="address" width="wide" mono />
    </FieldRow>
    <FieldRow label="Last run" value="2 hours ago" />
    <FieldRow label="Failed" value="3" tone="fail" />
  </div>
</template>
