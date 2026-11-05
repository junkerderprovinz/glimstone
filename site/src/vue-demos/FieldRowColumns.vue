<script setup lang="ts">
import { FieldRow, FieldRowGroup, TextField } from "@glimstone/vue";
</script>

<template>
  <div style="width: 100%; max-width: 720px">
    <FieldRowGroup :columns="2">
      <FieldRow label="Name"><TextField width="grow" model-value="*.mkv" /></FieldRow>
      <FieldRow label="Changed"><TextField width="grow" model-value="this week" /></FieldRow>
      <FieldRow label="Size at least"><TextField width="grow" model-value="1 GB" /></FieldRow>
      <FieldRow label="Owner"><TextField width="grow" model-value="anna" /></FieldRow>
      <FieldRow label="Look in" wide><TextField width="grow" mono model-value="/mnt/user/media" /></FieldRow>
    </FieldRowGroup>
  </div>
</template>
