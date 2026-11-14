<script setup lang="ts">
import { Carousel } from "@glimstone/vue/Carousel";

const shots = [
  { title: "The new overview", body: "Every place a backup goes, at a glance." },
  { title: "Pairing a phone", body: "Twelve words, typed once." },
  { title: "Restoring one file", body: "Open the backup, pick the file, done." },
];
</script>

<template>
  <div style="width: min(30rem, 100%)">
    <Carousel label="What is new" :items="shots">
      <template #slide="{ item }">
        <div class="glim-well" style="height: 140px; display: grid; align-content: center; gap: 4px; padding: 20px">
          <strong>{{ item.title }}</strong>
          <span>{{ item.body }}</span>
        </div>
      </template>
    </Carousel>
  </div>
</template>
