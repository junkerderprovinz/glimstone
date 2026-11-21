<script setup lang="ts">
import { ref } from "vue";
import { SignInTile } from "@glimstone/vue";
import { demoKit, demoTime, IDENTITY_PROVIDERS, TILE_TEXT } from "../signInData";

// An app without a password: everyone who reaches it is an admin, and every
// lasting way in waits for the first password.
const api = demoKit("open");
const said = ref("Nothing yet");
</script>

<template>
  <div class="signin-tile-demo">
    <SignInTile :api="api" :text="TILE_TEXT" lang="en" :providers="IDENTITY_PROVIDERS" :time="demoTime" :notify="(m: string) => (said = m)" />
    <output data-hook="said">{{ said }}</output>
  </div>
</template>
