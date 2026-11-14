<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import { Button, Card, EmptyState, IconButton, ListRow, Pill, SkeletonRow, TextField } from "@glimstone/vue";
import { glyph, Glyph } from "../../vue/glyph";

interface Backup {
  name: string;
  size: string;
  failed?: boolean;
}

const backups = ref<Backup[]>([
  { name: "appdata", size: "2.4 GB" },
  { name: "photos", size: "212 GB" },
  { name: "documents", size: "880 MB", failed: true },
]);
const filter = ref("");
const added = ref(0);
const loading = ref(true);
const shown = computed(() => backups.value.filter((b) => b.name.includes(filter.value.trim().toLowerCase())));

let done: ReturnType<typeof setTimeout>;
onMounted(() => (done = setTimeout(() => (loading.value = false), 900)));
onUnmounted(() => clearTimeout(done));

function add() {
  added.value++;
  backups.value = [...backups.value, { name: `backup-${added.value}`, size: "0 B" }];
  filter.value = "";
}
const remove = (b: Backup) => (backups.value = backups.value.filter((x) => x !== b));
const trash = glyph("IconTrash");
</script>

<template>
  <div style="display: grid; gap: 28px; width: 100%; max-width: 640px">
    <div style="display: flex; flex-wrap: wrap; gap: 8px; align-items: center">
      <TextField v-model="filter" label="Filter" placeholder="Filter by name" width="grow" />
      <Button label="Add a backup" label-key="add" tone="accent" size="key" @click="add" />
    </div>
    <Card title="Backups">
      <div v-if="loading" role="group" aria-label="Backups" aria-busy="true">
        <SkeletonRow />
        <SkeletonRow />
        <SkeletonRow />
      </div>
      <div v-else-if="shown.length" style="display: grid; gap: 2px">
        <ListRow v-for="b in shown" :key="b.name" :name="b.name">
          <template #tile><Glyph name="IconArchive" /></template>
          <template #badges>
            <Pill class="glim-num">{{ b.size }}</Pill>
            <Pill v-if="b.failed" tone="fail">Failed</Pill>
          </template>
          <template #actions>
            <IconButton :tip="`Delete ${b.name}`" :glyph="trash" @click="remove(b)" />
          </template>
        </ListRow>
      </div>
      <EmptyState v-else-if="backups.length" nested :glyph="glyph('IconFilter')" title="No backups match the filter">
        <Button label="Clear the filter" :label-key="null" :glyph="glyph('IconClose')" @click="filter = ''" />
      </EmptyState>
      <EmptyState v-else nested :glyph="glyph('IconArchive')" title="No backups yet" hint="Add one, and the first run starts tonight." />
    </Card>
  </div>
</template>
