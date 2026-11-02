<script setup lang="ts">
import { ref } from "vue";
import { Button } from "@glimstone/vue";
import { Select } from "@glimstone/vue/Select";

const PLACES = [
  "/mnt/user/backups",
  "/mnt/user/backups/appdata/weekly/containers",
  "/mnt/disks/offsite-archive/vault/snapshots/2026",
].map((p) => ({ value: p, label: p }));

// A settings row whose name is a <label> of its own, outside the select.
const place = ref<string | null>(PLACES[1].value);
const focusTrigger = () => document.getElementById("backup-destination-vue")?.focus();
</script>

<template>
  <div style="display: grid; gap: 12px; width: 320px">
    <div style="display: flex; align-items: center; gap: 12px">
      <label for="backup-destination-vue" style="flex: none; width: 88px">Destination</label>
      <Select id="backup-destination-vue" v-model="place" label="Destination" hide-label wrap :options="PLACES" />
    </div>
    <Button label="Choose the destination" :label-key="null" @click="focusTrigger" />
  </div>
</template>
