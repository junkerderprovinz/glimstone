<script setup lang="ts">
import { ref } from "vue";
import { Badge, Button, Fortress, InstanceCard } from "@glimstone/vue";
import { fortressTextEn as text } from "@glimstone/core";
import { APPS, HOME, household, PERMISSIONS } from "../fortressData";

// Inside a fortress: the phrase shows after "letmein", Echo's permission
// refuses to switch, and changing the phrase leaves Wanderer behind.
const said = ref("Nothing yet");
const permissions = ref(PERMISSIONS);
const answers = household(
  (what) => (said.value = what),
  () => permissions.value,
  (next) => (permissions.value = next),
);
</script>

<template>
  <div class="fortress-demo">
    <Fortress
      :text="text"
      lang="en"
      :app="HOME"
      joined
      :apps="APPS"
      :permissions="permissions"
      phrase-password
      :paired-with="['Pocket']"
      :hue-start="2"
      v-bind="answers"
    >
      <template #default="{ remove }">
        <InstanceCard
          :logo="HOME.logo"
          name="Atlas"
          :eyebrow="text.thisInstance"
          :facts="['192.168.1.61:3443', 'v10.5.3']"
          :figures="[
            { value: '14 / 15', label: 'Protected' },
            { value: '3 min ago', label: 'Last backup' },
          ]"
          :hue-index="0"
        >
          <template #actions><Button label="Open" label-key="open" /></template>
        </InstanceCard>
        <InstanceCard data-instance="pocket" :logo="HOME.logo" name="Pocket" :eyebrow="text.forms.android" :facts="['v10.5.3']" :hue-index="1">
          <template #badges>
            <Badge>{{ text.viaRelay }}</Badge>
            <Badge tone="ok">{{ text.connected }}</Badge>
          </template>
          <template #actions><Button :label="text.remove" label-key="delete" @click="remove('pocket', 'Pocket')" /></template>
        </InstanceCard>
      </template>
    </Fortress>
    <output data-hook="said">{{ said }}</output>
  </div>
</template>
