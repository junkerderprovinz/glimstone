<script setup lang="ts">
import { ref } from "vue";
import { FortressPairing } from "@glimstone/vue";
import { fortressTextEn as text } from "@glimstone/core";
import { HOME, household, PERMISSIONS } from "../fortressData";

// The pairing settings: the one place to change the phrase or leave.
const said = ref("Nothing yet");
const answers = household(
  (what) => (said.value = what),
  () => PERMISSIONS,
  () => {},
);
</script>

<template>
  <div class="fortress-demo">
    <FortressPairing
      :text="text"
      lang="en"
      :app="HOME"
      :paired-with="['Pocket']"
      :on-leave="answers.onLeave"
      :on-change-phrase="answers.onChangePhrase"
    />
    <output data-hook="said">{{ said }}</output>
  </div>
</template>
