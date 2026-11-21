<script setup lang="ts">
import { nextTick, ref } from "vue";
import { SignInReauthWindow, SignInTile } from "@glimstone/vue";
import { signInReauthTextEn } from "@glimstone/core";
import { demoKit, demoTime, IDENTITY_PROVIDERS, TILE_TEXT } from "../signInData";

// The owner signed in a while ago, so a new token, two-factor or a passkey asks
// for the password first, which is "letmein". The code for two-factor is
// 123456, and a test sign-in comes back as if it had worked.
const api = demoKit();
const said = ref("Nothing yet");
const arrived = ref<string | null>(null);

function leave(url: string) {
  api.leave(url);
  arrived.value = null;
  void nextTick(() => (arrived.value = "testOk"));
}
</script>

<template>
  <div class="signin-tile-demo">
    <SignInTile
      :api="api"
      :text="TILE_TEXT"
      lang="en"
      :providers="IDENTITY_PROVIDERS"
      :time="demoTime"
      return-to="/components/sign-in-tile"
      :arrived="arrived"
      :notify="(m: string) => (said = m)"
      :on-leave="leave"
    />
    <SignInReauthWindow :api="api" :text="signInReauthTextEn" />
    <output data-hook="said">{{ said }}</output>
  </div>
</template>
