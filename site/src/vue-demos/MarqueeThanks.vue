<script setup lang="ts">
import { Marquee } from "@glimstone/vue/Marquee";

const people = ["Ines", "Tomasz", "Aiko", "Rafael", "Maren", "Kofi", "Lucía", "Henrik"];
</script>

<template>
  <div style="width: min(32rem, 100%)">
    <Marquee label="Thanks to" :items="people">
      <template #item="{ item }">{{ item }}</template>
    </Marquee>
  </div>
</template>
