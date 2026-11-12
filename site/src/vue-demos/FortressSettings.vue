<script setup lang="ts">
import { ref } from "vue";
import { Badge, Fortress, FortressPairing, InstanceCard } from "@glimstone/vue";
import { fortressTextEn as text } from "@glimstone/core";
import { APPS, HOME, household, PERMISSIONS } from "../fortressData";

// The fortress on a pairing page of its own: the card with the phrase, its
// change and Leave at the top, then the other apps drawn with the app's own
// card, and no second Show phrase in the corner. The code carries the
// address of an own relay after the words.
const said = ref("Nothing yet");
const permissions = ref(PERMISSIONS);
const answers = household(
  (what) => (said.value = what),
  () => permissions.value,
  (next) => (permissions.value = next),
);
const qr = (words: string[]) => `${words.join(" ")}\nhttps://relay.example`;
</script>

<template>
  <div class="fortress-demo">
    <FortressPairing
      :text="text"
      lang="en"
      :app="HOME"
      :paired-with="['Pocket']"
      phrase-password
      :phrase-qr="qr"
      :on-show-phrase="answers.onShowPhrase"
      :on-change-phrase="answers.onChangePhrase"
      :on-leave="answers.onLeave"
      :hue-index="0"
    />
    <Fortress
      :text="text"
      lang="en"
      :app="HOME"
      joined
      :apps="APPS"
      :permissions="permissions"
      :show-others="true"
      :hue-start="1"
      :on-join="answers.onJoin"
      :on-permission="answers.onPermission"
      :on-remove="answers.onRemove"
    >
      <template #app="{ app, hueIndex }">
        <InstanceCard :data-own-card="app.id" :logo="app.logo" :name="app.name" :facts="app.instances.map((i) => i.device)" :hue-index="hueIndex">
          <template #badges><Badge tone="ok">{{ text.connected }}</Badge></template>
        </InstanceCard>
      </template>
    </Fortress>
    <output data-hook="said">{{ said }}</output>
  </div>
</template>
