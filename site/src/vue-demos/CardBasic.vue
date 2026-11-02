<script setup lang="ts">
import { ref } from "vue";
import { Button, Card, Toggle } from "@glimstone/vue";

const nightly = ref(true);
</script>

<template>
  <div style="width: 100%; max-width: 420px; padding-top: 12px">
    <Card title="Schedule" hint="When the backup runs on its own.">
      <div style="display: grid; gap: 16px">
        <Toggle v-model="nightly" label="Run every night" />
        <div style="display: flex; justify-content: flex-end">
          <Button label="Save" label-key="save" tone="accent" />
        </div>
      </div>
    </Card>
  </div>
</template>
