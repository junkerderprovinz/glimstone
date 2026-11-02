<script setup lang="ts">
import { ref } from "vue";
import { Button, Card, NumberField, SubCard } from "@glimstone/vue";

const days = ref<number | null>(14);
</script>

<template>
  <div style="width: 100%; max-width: 440px; padding-top: 12px">
    <Card title="Snapshots">
      <SubCard title="Retention" hint="Older snapshots are removed after each run.">
        <label class="row">
          <span>Days to keep</span>
          <NumberField v-model="days" :min="1" :max="365" />
        </label>
      </SubCard>
      <SubCard title="Commands">
        <div class="row" style="justify-content: flex-end">
          <Button label="Copy command" label-key="copy" tone="subtle" />
        </div>
      </SubCard>
    </Card>
  </div>
</template>

<style scoped>
.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}
</style>
