<script setup lang="ts">
import { computed, onBeforeUnmount, shallowRef, watch } from "vue";
import { shake, signInReauthError, type SignInApi, type SignInReauthText } from "@glimstone/core";
import FieldRow from "./FieldRow.vue";
import PasswordField from "./PasswordField.vue";
import Window from "./Window.vue";
import type { WindowAction } from "./windowParts";

// The password question before a change the kit wants fresh ("The sign-in
// tile" in the design language). Mounted once beside the tiles, it opens when
// a change answers signInAgain with askPassword, and the change runs again
// once the password is confirmed. While it is mounted the client asks.
const props = defineProps<{
  api: SignInApi;
  text: SignInReauthText;
}>();

const r = props.api.reauth;
const s = shallowRef(r.state());
const stop = r.subscribe(() => (s.value = r.state()));
onBeforeUnmount(stop);

watch(
  () => s.value.refused,
  (_, __, onCleanup) => {
    const button = document.querySelector<HTMLElement>('[data-signin-reauth="confirm"]');
    if (button) onCleanup(shake(button));
  },
  { flush: "post" },
);

const actions = computed<WindowAction[]>(() => [
  {
    label: props.text.confirm,
    labelKey: "confirm",
    primary: true,
    busy: s.value.busy,
    disabled: s.value.password === "",
    attrs: { "data-signin-reauth": "confirm" },
    onClick: () => {
      void r.submit();
      return false;
    },
  },
]);

function onEnter(e: KeyboardEvent) {
  if (e.key !== "Enter") return;
  e.preventDefault();
  void r.submit();
}
</script>

<template>
  <Window
    v-if="s.asking"
    data-glim="SignInReauthWindow"
    :title="text.title"
    :text="{ cancel: text.cancel, close: text.close }"
    :close-on-backdrop="false"
    :actions="actions"
    @close="r.cancel()"
  >
    <div class="glim-signin-tile-body">
      <p class="glim-signin-tile-text">{{ text.text }}</p>
      <FieldRow :label="text.password">
        <PasswordField
          autocomplete="current-password"
          :model-value="s.password"
          :text="{ show: text.show, hide: text.hide }"
          :error="signInReauthError(text, s.error)"
          @update:model-value="r.set($event)"
          @keydown="onEnter"
        />
      </FieldRow>
    </div>
  </Window>
</template>
