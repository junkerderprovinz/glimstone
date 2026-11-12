<script setup lang="ts">
import { Fortress, InstanceCard } from "@glimstone/vue";
import { fortressTextEn as text } from "@glimstone/core";
import { APPS, HOME, household, instancesTab, PERMISSIONS } from "../fortressData";

// Another member removed Alpha, so the empty place says so until it joins again.
const answers = instancesTab(household(() => {}, () => PERMISSIONS, () => {}));
</script>

<template>
  <div class="fortress-demo">
    <Fortress :text="text" lang="en" :app="HOME" :joined="false" removed-here :apps="APPS" :permissions="PERMISSIONS" :hue-start="1" v-bind="answers">
      <InstanceCard :logo="HOME.logo" name="Atlas" :eyebrow="text.thisInstance" :facts="['v10.5.3']" :hue-index="0" />
    </Fortress>
  </div>
</template>
