<script setup lang="ts">
import { ref } from "vue";
import { Button, FieldRow, SignInCard, SignInField, TextField, Toggle } from "@glimstone/vue";
import { signInTextEn } from "@glimstone/core";
import logo from "../../../.github/assets/logo.svg?url";

// A name and a switch above the password, a second way in under Sign in, and a
// step of the app's own once the new password is set.
const name = ref("");
const stay = ref(true);
const done = ref(false);

async function setPassword() {
  done.value = true;
  return { ok: true };
}
</script>

<template>
  <div class="signin-demo">
    <SignInCard
      :logo="logo"
      app-name="GlimStone"
      :text="signInTextEn"
      reset
      :auto-focus="false"
      id-prefix="vue-slots"
      :on-sign-in="async () => ({ error: 'That password is not right' })"
      :on-ask-code="async () => ({ ok: true })"
      :on-set-password="setPassword"
    >
      <template #fields>
        <SignInField label="Name" for="vue-slots-name">
          <TextField id="vue-slots-name" v-model="name" autocomplete="username" />
        </SignInField>
        <FieldRow label="Stay signed in"><Toggle v-model="stay" /></FieldRow>
      </template>
      <template #actions>
        <Button label="Sign in with Authentik" :label-key="null" />
      </template>
      <template v-if="done" #step>
        <div class="glim-signin-form" role="status">
          <p>Your new password is set.</p>
          <Button label="Done" :label-key="null" tone="accent" @click="done = false" />
        </div>
      </template>
    </SignInCard>
  </div>
</template>
