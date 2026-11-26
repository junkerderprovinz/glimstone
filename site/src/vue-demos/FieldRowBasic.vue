<script setup lang="ts">
import { ref } from "vue";
import { CopyField, FieldRow, NumberField, PasswordField, Selector, TextField, TimePicker, Toggle } from "@glimstone/vue";
import { Combobox } from "@glimstone/vue/Combobox";
import { Select } from "@glimstone/vue/Select";
import { Slider } from "@glimstone/vue/Slider";

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
const ZONES = [
  { value: "vienna", label: "Vienna" },
  { value: "berlin", label: "Berlin" },
];
const volume = ref(40);
const zone = ref("vienna");
const name = ref("backup-weekly");
const notify = ref(true);
const level = ref("even");
const keep = ref<string | null>("month");
const secret = ref("");
const copies = ref<number | null>(3);
const address = ref("smb://bottich/media");
const from = ref<string | null>("08:00");
const to = ref<string | null>("17:00");
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
      <CopyField value="smb://bottich/media" width="wide" />
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
    <FieldRow label="Share link">
      <TextField model-value="https://bottich/s/3f9a" width="grow" mono />
    </FieldRow>
    <FieldRow label="Hours">
      <TimePicker v-model="from" label="From" :minute-step="15" />
      <TimePicker v-model="to" label="To" :minute-step="15" />
    </FieldRow>
    <FieldRow label="Volume">
      <Slider v-model="volume" :min="0" :max="100" :format="(v: number) => `${v}%`" />
    </FieldRow>
    <FieldRow label="Zone">
      <Combobox v-model="zone" :options="ZONES" empty="No match" toggle-label="Show all zones" />
    </FieldRow>
    <FieldRow label="Last run" value="2 hours ago" />
    <FieldRow label="Failed" value="3" tone="fail" />
  </div>
</template>
