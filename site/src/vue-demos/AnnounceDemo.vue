<script setup lang="ts">
import { announce } from "@glimstone/core";
import { Button } from "@glimstone/vue";
</script>

<template>
  <Button label="Say it" :label-key="null" @click="announce('3 rows selected')" />
  <Button label="Say a failure" :label-key="null" tone="danger" @click="announce('The copy failed', 'assertive')" />
</template>
