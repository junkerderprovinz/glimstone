<script setup lang="ts">
import { computed, onBeforeUnmount, ref, shallowRef } from "vue";
import {
  createFortressFlow,
  fill,
  hueVars,
  othersSummary,
  plural,
  storedShowOthers,
  storeShowOthers,
  type FortressAnswer,
  type FortressApp,
  type FortressInstance,
  type FortressPermission,
  type FortressText,
  type PhraseAnswer,
  type ToastSeverity,
} from "@glimstone/core";
import Button from "./Button.vue";
import FortressAppCard from "./FortressAppCard.vue";
import FortressPermissions from "./FortressPermissions.vue";
import FortressWindow from "./FortressWindow.vue";
import InfoBubble from "./InfoBubble.vue";
import Toggle from "./Toggle.vue";

// The fortress in the Instances tab ("The fortress" in the design language):
// the app's own instances first, in the default slot, which gets `remove` to
// ask before an instance goes; then the switch for the other apps and, once it
// is on, their cards and the permissions, with Show phrase or Enter phrase in
// the corner. Changing the phrase and leaving live in the pairing settings
// (FortressPairing). The callbacks are props, since an emitted event cannot
// answer. The scoped slot `permission-extra` puts something of the app's own
// under a permission's words.
const props = withDefaults(
  defineProps<{
    text: FortressText;
    /** The interface language, for counts and lists. */
    lang: string;
    /** The app showing the page. */
    app: { id: string; name: string; logo?: string };
    joined: boolean;
    /** The other apps of the fortress, each with its instances. */
    apps: FortressApp[];
    permissions: FortressPermission[];
    onPermission: (id: string, on: boolean) => Promise<FortressAnswer>;
    /** Puts the small confirmation of a saved permission, or the reason it failed, into the app's toasts. */
    notify?: (message: string, severity: ToastSeverity) => void;
    onJoin: (words: string[]) => Promise<FortressAnswer>;
    onRemove: (id: string) => Promise<FortressAnswer>;
    /** `password` is set where `phrasePassword` asks for it first. Without it there is no Show phrase. */
    onShowPhrase?: (password?: string) => Promise<PhraseAnswer>;
    /** Whether the other apps show. Without it the switch keeps its state on this device. */
    showOthers?: boolean;
    /** The devices this app is paired with today, whose pairing moves into the fortress on joining. */
    pairedWith?: string[];
    /** A member of a fortress this app saw on the network while it is in none. */
    found?: { app: string; device: string; logo?: string };
    /** Asks for the app's password before the phrase shows. */
    phrasePassword?: boolean;
    onOpen?: (app: FortressApp, instance: FortressInstance) => void;
    labelKeys?: Partial<Record<"join" | "leave" | "showPhrase" | "changePhrase" | "remove" | "unlock" | "copy", string>>;
    /** The rainbow position the fortress's first card takes, after the app's own cards. */
    hueStart?: number;
  }>(),
  { showOthers: undefined, phrasePassword: false, hueStart: 0 },
);
const emit = defineEmits<{ "update:showOthers": [on: boolean] }>();

const flow = createFortressFlow(() => ({ ...props, failed: props.text.failed }));
const s = shallowRef(flow.state());
const stop = flow.subscribe(() => (s.value = flow.state()));
onBeforeUnmount(stop);

const keys = computed(() => ({
  join: "fortressJoin",
  leave: "fortressLeave",
  showPhrase: "fortressShowPhrase",
  changePhrase: "fortressChangePhrase",
  remove: "delete",
  unlock: "unlock",
  copy: "copy",
  ...props.labelKeys,
}));

const ownShow = ref(storedShowOthers());
const others = computed(() => props.showOthers ?? ownShow.value);
function setOthers(on: boolean) {
  emit("update:showOthers", on);
  if (props.showOthers === undefined) {
    storeShowOthers(on);
    ownShow.value = on;
  }
}
const othersLine = computed(() => {
  const n = othersSummary(props.apps);
  return fill(props.text.othersLine, {
    apps: plural(props.lang, props.text.othersApps, n.apps),
    devices: plural(props.lang, props.text.othersDevices, n.devices),
  });
});
</script>

<template>
  <div data-glim="Fortress" class="glim-fortress">
    <div class="glim-fortress-grid">
      <slot :remove="flow.openRemove" />
      <div v-if="!joined" class="glim-card glim-instance glim-instance--out" data-fortress="out">
        <h3 class="glim-instance-title">{{ text.outTitle }}</h3>
        <p class="glim-instance-hint">{{ fill(text.outHint, { app: app.name }) }}</p>
        <p v-if="found" class="glim-instance-found">
          <img v-if="found.logo" :src="found.logo" alt="" />
          <span>{{ fill(text.found, { app: found.app, device: found.device }) }}</span>
        </p>
      </div>
    </div>

    <div v-if="joined" class="glim-card glim-fortress-switch glim-hue" :style="hueVars(hueStart)">
      <span class="glim-fortress-switch-text">
        <span class="glim-fortress-switch-name">{{ text.showOthers }}<InfoBubble :tip="text.about" /></span>
        <span class="glim-fortress-sub">{{ othersLine }}</span>
      </span>
      <Toggle :model-value="others" :label="text.showOthers" hide-label data-fortress="others" @update:model-value="setOthers" />
    </div>

    <template v-if="joined && others">
      <div class="glim-fortress-grid">
        <FortressAppCard v-for="(a, i) in apps" :key="a.id" :app="a" :text="text" :lang="lang" :hue-index="hueStart + 1 + i" :on-open="onOpen" />
      </div>
      <FortressPermissions
        :text="text"
        :app="app"
        :apps="[app, ...apps]"
        :permissions="permissions"
        :on-permission="onPermission"
        :notify="notify"
        :hue-index="hueStart + 1 + apps.length"
      >
        <template #extra="{ permission }"><slot name="permission-extra" :permission="permission" /></template>
      </FortressPermissions>
    </template>

    <div class="glim-fortress-actions">
      <template v-if="joined">
        <Button
          v-if="onShowPhrase"
          :label="text.showPhrase"
          :label-key="keys.showPhrase"
          tone="accent"
          size="key"
          :busy="s.busy === 'show'"
          data-fortress="show"
          @click="flow.openPhrase()"
        />
      </template>
      <Button v-else :label="text.enterPhrase" :label-key="keys.join" tone="accent" size="key" data-fortress="open-join" @click="flow.openJoin()" />
    </div>

    <FortressWindow
      v-if="s.window"
      :flow="flow"
      :state="s"
      :text="text"
      :lang="lang"
      :app="app"
      :paired-with="pairedWith"
      :keys="keys"
    />
  </div>
</template>
