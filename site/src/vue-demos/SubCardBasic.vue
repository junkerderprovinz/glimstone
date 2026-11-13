<script setup lang="ts">
import { ref } from "vue";
import { Button, Card, NumberField, SubCard, TextField, Toggle } from "@glimstone/vue";

const days = ref<number | null>(14);
const prune = ref(true);
const row = { display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px" };
</script>

<template>
  <div style="width: 100%; max-width: 440px; padding-top: 12px">
    <Card title="Snapshots">
      <SubCard title="Retention" hint="Older snapshots are removed after each run.">
        <template #end><Toggle v-model="prune" label="Prune" /></template>
        <label :style="row">
          <span>Days to keep</span>
          <NumberField v-model="days" :min="1" :max="365" />
        </label>
      </SubCard>
      <SubCard>
        <TextField label="A note" placeholder="A group needs no title" />
      </SubCard>
      <SubCard title="Commands">
        <div :style="{ ...row, justifyContent: 'flex-end' }">
          <Button label="Copy command" label-key="copy" tone="subtle" />
        </div>
      </SubCard>
    </Card>
  </div>
</template>

