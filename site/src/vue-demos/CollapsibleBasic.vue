<script setup lang="ts">
import { Collapsible } from "@glimstone/vue/Collapsible";
</script>

<template>
  <div style="width: min(32rem, 100%)">
    <Collapsible label="What a relay sees">
      Only the encrypted parcels and the address they go to. It cannot open a backup and keeps nothing once a parcel is
      delivered.
    </Collapsible>
  </div>
</template>
