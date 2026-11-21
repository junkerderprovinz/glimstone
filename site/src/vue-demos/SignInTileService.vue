<script setup lang="ts">
import { ref } from "vue";
import { SignInTile } from "@glimstone/vue";
import { demoKit, demoTime, IDENTITY_PROVIDERS, TILE_TEXT } from "../signInData";

// An account that signs in through Pocket ID and has no password here: the
// password, two-factor and passkeys live at Pocket ID, and tokens still work.
const api = demoKit("service");
const said = ref("Nothing yet");
</script>

<template>
  <div class="signin-tile-demo">
    <SignInTile
      :api="api"
      :text="TILE_TEXT"
      lang="en"
      :providers="IDENTITY_PROVIDERS"
      :cards="['password', 'twoFactor', 'passkeys', 'tokens']"
      :time="demoTime"
      :notify="(m: string) => (said = m)"
    />
    <output data-hook="said">{{ said }}</output>
  </div>
</template>
