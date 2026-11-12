<script setup lang="ts">
import { computed, onBeforeUnmount, ref, shallowRef } from "vue";
import {
  createFortressFlow,
  fill,
  hueVars,
  listOf,
  othersSummary,
  plural,
  storedShowOthers,
  storeShowOthers,
  type ChangeAnswer,
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
import { glyphFor } from "./glyphs";
import InfoBubble from "./InfoBubble.vue";
import Toggle from "./Toggle.vue";

// The fortress in the Instances tab ("The fortress" in the design language):
// the app's own instances first, in the default slot, which gets `remove` to
// ask before an instance goes; then the switch for the other apps and, once it
// is on, their cards and the permissions, with Show phrase or Enter phrase in
// the corner. Changing the phrase and leaving live in the pairing settings
// (FortressPairing). The callbacks are props, since an emitted event cannot
// answer. The scoped slot `permission-extra` puts something of the app's own
// under a permission's words, and the scoped slot `app` draws another app with
// the app's own card, such as the one its Instances tab draws.
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
    /** Removes an instance, of this app or another. Without it no other app offers Remove. */
    onRemove?: (id: string) => Promise<FortressAnswer>;
    /** `password` is set where `phrasePassword` asks for it first. Without it there is no Show phrase. */
    onShowPhrase?: (password?: string) => Promise<PhraseAnswer>;
    /** Offered right after a removal and beside `removed`, since the old phrase still lets a removed instance back in. */
    onChangePhrase?: () => Promise<ChangeAnswer>;
    /** The instances removed since the phrase last changed, by name ("Bravo on Atlas"). While there are any, a line says the way back is still open. */
    removed?: string[];
    /** Another member removed this app, so the empty place says so until it joins again. */
    removedHere?: boolean;
    /** Whether the other apps show. Without it the switch keeps its state on this device. */
    showOthers?: boolean;
    /** The devices this app is paired with today, whose pairing moves into the fortress on joining. */
    pairedWith?: string[];
    /** A member of a fortress this app saw on the network while it is in none. */
    found?: { app: string; device: string; logo?: string };
    /** Asks for the app's password before the phrase shows. */
    phrasePassword?: boolean;
    onOpen?: (app: FortressApp, instance: FortressInstance) => void;
    /** What the QR code beside the words carries, the words alone without it. */
    phraseQr?: (words: string[]) => string;
    labelKeys?: Partial<Record<"join" | "leave" | "showPhrase" | "changePhrase" | "remove" | "later" | "unlock" | "copy", string>>;
    /** The rainbow position the fortress's first card takes, after the app's own cards. */
    hueStart?: number;
  }>(),
  { showOthers: undefined, phrasePassword: false, removed: () => [], removedHere: false, hueStart: 0 },
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
  later: "fortressLater",
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
const removedNote = computed(() => fill(props.text.removedNote, { devices: listOf(props.lang, props.removed) }));
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
        <h3 class="glim-instance-title">{{ removedHere ? text.removedHereTitle : text.outTitle }}</h3>
        <p class="glim-instance-hint">{{ fill(removedHere ? text.removedHereHint : text.outHint, { app: app.name }) }}</p>
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

    <div v-if="joined && removed.length" class="glim-fortress-removed" data-fortress="removed" role="status">
      <component :is="glyphFor('info')" v-if="glyphFor('info')" />
      <span>{{ removedNote }}</span>
      <Button
        v-if="onChangePhrase"
        :label="text.changePhrase"
        :label-key="keys.changePhrase"
        tone="subtle"
        data-fortress="open-change"
        @click="flow.openChange()"
      />
    </div>

    <template v-if="joined && others">
      <div class="glim-fortress-grid">
        <template v-for="(a, i) in apps" :key="a.id">
          <slot v-if="$slots.app" name="app" :app="a" :hue-index="hueStart + 1 + i" :remove="onRemove && flow.openRemove" />
          <FortressAppCard
            v-else
            :app="a"
            :text="text"
            :lang="lang"
            :hue-index="hueStart + 1 + i"
            :on-open="onOpen"
            :on-remove="onRemove && flow.openRemove"
            :remove-key="keys.remove"
          />
        </template>
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

    <div v-if="!joined || onShowPhrase" class="glim-fortress-actions">
      <Button
        v-if="joined"
        :label="text.showPhrase"
        :label-key="keys.showPhrase"
        tone="accent"
        size="key"
        :busy="s.busy === 'show'"
        data-fortress="show"
        @click="flow.openPhrase()"
      />
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
      :phrase-qr="phraseQr"
      :keys="keys"
    />
  </div>
</template>
