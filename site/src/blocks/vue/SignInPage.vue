<script setup lang="ts">
import { SignInCard } from "@glimstone/vue";
import { signInTextEn, type SignInAnswer } from "@glimstone/core";
import logo from "../../../../.github/assets/logo.svg?url";

// "letmein" signs in, and any other password is refused.
async function signIn({ password }: { password: string }): Promise<SignInAnswer> {
  if (password !== "letmein") return { error: "That password is not right" };
  return { ok: true };
}
</script>

<template>
  <SignInCard
    class="block-signin"
    :logo="logo"
    app-name="GlimStone"
    :text="signInTextEn"
    passkey
    reset
    :min-password="12"
    :on-sign-in="signIn"
    :on-passkey="async () => ({ error: 'No passkey is set up on this device' })"
    :on-ask-code="async () => ({ ok: true })"
    :on-set-password="async () => ({ ok: true })"
  />
</template>
