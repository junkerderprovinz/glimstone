<script setup lang="ts">
import { ref } from "vue";
import { SignInCard } from "@glimstone/vue";
import { signInTextEn, type SignInAnswer } from "@glimstone/core";
import logo from "../../../.github/assets/logo.svg?url";

// "letmein" signs in, "two-step" asks for a code, which is 123456, and
// "too-many" is refused with a reason two lines long. Any code from the log
// works, and the new password needs 12 characters.
const said = ref("Nothing yet");

async function signIn({ password, code }: { password: string; code?: string }): Promise<SignInAnswer> {
  if (code !== undefined) {
    if (code !== "123456") return { needCode: true, error: "That code is not valid" };
    said.value = "Signed in with a code";
    return { ok: true };
  }
  if (password === "two-step") return { needCode: true };
  if (password === "too-many") return { error: "Too many tries in a row. Wait five minutes before you try again." };
  if (password !== "letmein") return { error: "That password is not right" };
  said.value = "Signed in";
  return { ok: true };
}

async function setPassword() {
  said.value = "Password set";
  return { ok: true };
}
</script>

<template>
  <div class="signin-demo">
    <SignInCard
      :logo="logo"
      app-name="GlimStone"
      :text="signInTextEn"
      passkey
      reset
      :min-password="12"
      :on-sign-in="signIn"
      :on-passkey="async () => ({ needCode: true })"
      :on-ask-code="async () => ({ ok: true })"
      :on-set-password="setPassword"
    />
    <output data-hook="said">{{ said }}</output>
  </div>
</template>
