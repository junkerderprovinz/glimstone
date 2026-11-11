<script setup lang="ts">
import { ref } from "vue";
import { Fortress, InstanceCard } from "@glimstone/vue";
import { fortressTextEn as text } from "@glimstone/core";
import { APPS, HOME, household, instancesTab, PERMISSIONS } from "../fortressData";

// Not in a fortress yet. The words in TWELVE join it, others are refused.
const said = ref("Nothing yet");
const answers = instancesTab(household(
  (what) => (said.value = what),
  () => PERMISSIONS,
  () => {},
));
</script>

<template>
  <div class="fortress-demo">
    <Fortress
      :text="text"
      lang="en"
      :app="HOME"
      :joined="false"
      :apps="APPS"
      :permissions="PERMISSIONS"
      :paired-with="['Pocket', 'Studio']"
      :found="{ app: 'Bravo', device: 'Atlas', logo: APPS[0].logo }"
      :hue-start="1"
      v-bind="answers"
    >
      <InstanceCard :logo="HOME.logo" name="Atlas" :eyebrow="text.thisInstance" :facts="['192.168.1.61:3443', 'v10.5.3']" :hue-index="0" />
    </Fortress>
    <output data-hook="said">{{ said }}</output>
  </div>
</template>
