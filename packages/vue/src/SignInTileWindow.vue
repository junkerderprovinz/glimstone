<script setup lang="ts">
import { computed, type Component } from "vue";
import {
  fill,
  OWN_SIGN_IN_SERVICE,
  passwordGoes,
  qrCode,
  SIGN_IN_TOKEN_LIVES,
  signInRedirectAddress,
  signInScopeItems,
  signInServiceName,
  signInServicePicker,
  signInTestLabel,
  type Catalog,
  type SignInApi,
  type SignInTileField,
  type SignInTileFlow,
  type SignInTileLabelKeys,
  type SignInTileState,
  type SignInTileText,
} from "@glimstone/core";
import CopyField from "./CopyField.vue";
import FieldRow from "./FieldRow.vue";
import FieldRowGroup from "./FieldRowGroup.vue";
import { glyphFor, IconCancel, IconCheck, IconClose } from "./glyphs";
import PasswordField from "./PasswordField.vue";
import PickerWindow from "./PickerWindow.vue";
import Selector from "./Selector.vue";
import TextField from "./TextField.vue";
import Window from "./Window.vue";
import type { WindowAction } from "./windowParts";

// The window the sign-in tile has open, if any: the password's removal,
// two-factor's setup, codes and turning off, a passkey's name, a new token
// and the picker with the form of a sign-in service.
const props = defineProps<{
  state: SignInTileState;
  flow: SignInTileFlow;
  api: SignInApi;
  text: SignInTileText;
  lang: string;
  scopes: string[];
  providers: Catalog;
  keys: SignInTileLabelKeys;
}>();

const w = computed(() => props.state.window);
const words = computed(() => ({ cancel: props.text.cancel, close: props.text.close }));
const eye = computed(() => ({ show: props.text.show, hide: props.text.hide, confirm: props.text.confirmPassword, mismatch: props.text.mismatch }));
const err = (field: SignInTileField) => (props.state.invalid?.field === field ? props.state.invalid.message : undefined);
const cancel = computed<WindowAction>(() => ({ label: props.text.cancel, labelKey: "common.cancel", glyph: IconCancel, wayOut: true }));
function act(label: string, labelKey: string, hook: string, run: () => Promise<void> | void, more: Partial<WindowAction> = {}): WindowAction {
  return {
    label,
    labelKey,
    busy: props.state.busy === hook,
    attrs: { "data-signin-tile": hook },
    onClick: () => {
      void run();
      return false;
    },
    ...more,
  };
}
function onEnter(e: KeyboardEvent, run: () => Promise<void> | void) {
  if (e.key !== "Enter") return;
  e.preventDefault();
  void run();
}

const goes = computed(() => passwordGoes(props.text, props.lang, props.state));
const setup = computed(() => w.value?.kind === "twoFactorSetup");
const codeRun = () => (setup.value ? props.flow.confirmTwoFactor() : props.flow.turnTwoFactorOff());
const codeActions = computed(() => {
  const t = props.text.twoFactor;
  const empty = props.state.draft.code.trim() === "";
  return setup.value
    ? [act(t.confirm, props.keys.confirm, "two-factor-confirm", codeRun, { primary: true, disabled: empty })]
    : [cancel.value, act(t.offConfirm, props.keys.turnOff, "two-factor-off", codeRun, { disabled: empty })];
});
const qr = computed(() => {
  const v = w.value;
  return v?.kind === "twoFactorSetup" ? qrCode(v.uri) : null;
});
const secret = computed(() => {
  const v = w.value;
  return v?.kind === "twoFactorSetup" ? v.secret.replace(/(.{4})(?=.)/g, "$1 ") : "";
});
const codesActions = computed<WindowAction[]>(() => [
  act(props.text.twoFactor.copyCodes, props.keys.copy, "two-factor-copy", props.flow.copyCodes),
  { label: props.text.twoFactor.codesSaved, labelKey: props.keys.confirm, primary: true, wayOut: true, attrs: { "data-signin-tile": "two-factor-saved" } },
]);

const adding = computed(() => w.value?.kind === "addPasskey");
const nameRun = () => (adding.value ? props.flow.addPasskey() : props.flow.renamePasskey());
const nameActions = computed(() => [
  adding.value
    ? act(props.text.passkeys.continue, props.keys.passkey, "passkey-add", nameRun, { primary: true })
    : act(props.text.save, props.keys.save, "passkey-rename", nameRun, { primary: true }),
]);

const scopeItems = computed(() => signInScopeItems(props.scopes, props.text.tokens.scopes));
const lifeItems = computed(() => SIGN_IN_TOKEN_LIVES.map((id) => ({ id, label: props.text.tokens.lifetimes[id] })));

const picker = computed(() => signInServicePicker(props.providers, props.text, props.lang, props.state.services, () => glyphFor(props.keys.service) as Component));
const pickerText = computed(() => {
  const t = props.text.services;
  return { search: t.search, none: t.searchNone, clear: t.clear, close: props.text.close, cancel: props.text.cancel, back: props.text.back };
});
const form = computed(() => {
  const v = w.value;
  if (v?.kind !== "serviceForm") return null;
  const own = v.provider === OWN_SIGN_IN_SERVICE;
  const name = signInServiceName(props.text, v.provider, props.state.draft.label, props.providers.entries.find((e) => e.id === v.provider)?.name);
  const editing = props.state.services?.find((x) => x.id === v.edit);
  return { ...v, own, name, redirect: signInRedirectAddress(props.api, editing) };
});
const formActions = computed<WindowAction[]>(() => {
  const t = props.text.services;
  const test = props.state.formTest;
  return [
    act(signInTestLabel(props.text, test), "test", "service-test", props.flow.testDraft, {
      glyph: test?.tone === "ok" ? IconCheck : test?.tone === "danger" ? IconClose : undefined,
      tone: test?.busy ? undefined : test?.tone,
      busy: !!test?.busy,
      title: test?.title,
    }),
    form.value?.edit
      ? act(props.text.save, props.keys.save, "service-save", props.flow.saveService, { primary: true })
      : { label: t.turnOn, labelKey: props.keys.turnOn, primary: true, disabled: true, title: t.mustTest, attrs: { "data-signin-tile": "service-turn-on" } },
  ];
});
const ownFields = computed<[SignInTileField, string][]>(() => [
  ["scopes", props.text.services.scopes],
  ["nameClaim", props.text.services.nameClaim],
  ["groupsClaim", props.text.services.groupsClaim],
]);
</script>

<template>
  <Window
    v-if="w?.kind === 'removePassword'"
    :title="text.password.removeTitle"
    :text="words"
    :close-on-backdrop="false"
    :actions="[cancel, act(text.password.remove, keys.removePassword, 'remove-password', flow.removePassword)]"
    @close="flow.close()"
  >
    <div class="glim-signin-tile-body">
      <p class="glim-signin-tile-text">{{ text.password.removeText }}</p>
      <ul v-if="goes.length > 0" class="glim-signin-tile-goes">
        <li v-for="g in goes" :key="g">{{ g }}</li>
      </ul>
      <FieldRow :label="text.password.current">
        <PasswordField
          autocomplete="current-password"
          :model-value="state.draft.current"
          :text="eye"
          :error="err('current')"
          @update:model-value="flow.set('current', $event)"
          @keydown="onEnter($event, flow.removePassword)"
        />
      </FieldRow>
    </div>
  </Window>

  <Window
    v-else-if="w?.kind === 'twoFactorSetup' || w?.kind === 'twoFactorOff'"
    :title="setup ? text.twoFactor.setupTitle : text.twoFactor.offTitle"
    :text="words"
    :close-on-backdrop="false"
    :actions="codeActions"
    @close="flow.close()"
  >
    <div class="glim-signin-tile-body">
      <p class="glim-signin-tile-text">{{ setup ? text.twoFactor.scan : text.twoFactor.offText }}</p>
      <svg v-if="qr" class="glim-signin-tile-qr" :viewBox="`-2 -2 ${qr.size + 4} ${qr.size + 4}`" role="img" :aria-label="text.twoFactor.qr">
        <path :d="qr.path" />
      </svg>
      <FieldRow v-if="setup" :label="text.twoFactor.key">
        <CopyField :value="secret" :text="{ copy: text.copy, copied: text.copied }" />
      </FieldRow>
      <FieldRow :label="text.twoFactor.code">
        <TextField
          :inputmode="setup ? 'numeric' : 'text'"
          autocomplete="one-time-code"
          spellcheck="false"
          width="short"
          :model-value="state.draft.code"
          :error="err('code')"
          @update:model-value="flow.set('code', $event)"
          @keydown="onEnter($event, codeRun)"
        />
      </FieldRow>
    </div>
  </Window>

  <Window v-else-if="w?.kind === 'recoveryCodes'" :title="text.twoFactor.codesTitle" :text="words" :close-on-backdrop="false" :actions="codesActions" @close="flow.close()">
    <div class="glim-signin-tile-body">
      <p class="glim-signin-tile-text">{{ text.twoFactor.codesText }}</p>
      <ul class="glim-signin-tile-codes">
        <li v-for="c in w.codes" :key="c">{{ c }}</li>
      </ul>
    </div>
  </Window>

  <Window
    v-else-if="w?.kind === 'addPasskey' || w?.kind === 'renamePasskey'"
    :title="adding ? text.passkeys.addTitle : text.passkeys.renameTitle"
    :text="words"
    :close-on-backdrop="false"
    :actions="nameActions"
    @close="flow.close()"
  >
    <div class="glim-signin-tile-body">
      <FieldRow :label="text.passkeys.name" :hint="text.passkeys.nameHint">
        <TextField :model-value="state.draft.name" :error="err('name')" @update:model-value="flow.set('name', $event)" @keydown="onEnter($event, nameRun)" />
      </FieldRow>
      <p v-if="state.said" :class="state.said.ok ? 'glim-signin-tile-said' : 'glim-signin-tile-said glim-signin-tile-said--fail'" :role="state.said.ok ? 'status' : 'alert'">
        {{ state.said.message }}
      </p>
    </div>
  </Window>

  <Window
    v-else-if="w?.kind === 'newToken'"
    :title="text.tokens.newTitle"
    :text="words"
    :close-on-backdrop="false"
    :actions="[act(text.tokens.make, keys.createToken, 'token-make', flow.makeToken, { primary: true })]"
    @close="flow.close()"
  >
    <div class="glim-signin-tile-body">
      <FieldRowGroup>
        <FieldRow :label="text.tokens.name" :hint="text.tokens.nameHint">
          <TextField :model-value="state.draft.name" :error="err('name')" @update:model-value="flow.set('name', $event)" @keydown="onEnter($event, flow.makeToken)" />
        </FieldRow>
        <FieldRow :label="text.tokens.scope">
          <Selector inline activation="manual" :model-value="state.draft.scope" :items="scopeItems" @update:model-value="flow.set('scope', $event)" />
        </FieldRow>
        <FieldRow :label="text.tokens.lifetime">
          <Selector inline activation="manual" :model-value="state.draft.life" :items="lifeItems" @update:model-value="flow.set('life', $event)" />
        </FieldRow>
      </FieldRowGroup>
    </div>
  </Window>

  <Window
    v-else-if="w?.kind === 'tokenShown'"
    :title="text.tokens.shownTitle"
    :text="words"
    :close-on-backdrop="false"
    :actions="[{ label: text.tokens.shownDone, labelKey: keys.confirm, primary: true, wayOut: true }]"
    @close="flow.close()"
  >
    <div class="glim-signin-tile-body">
      <p class="glim-signin-tile-text">{{ text.tokens.shownText }}</p>
      <FieldRow :label="w.name">
        <CopyField :value="w.value" :text="{ copy: text.copy, copied: text.copied }" />
      </FieldRow>
    </div>
  </Window>

  <PickerWindow
    v-else-if="w?.kind === 'pickService'"
    :title="text.services.pick"
    :hint="text.services.pickHint"
    :items="picker.items"
    :groups="picker.groups"
    :text="pickerText"
    @pick="flow.chooseService"
    @close="flow.close()"
  />

  <PickerWindow
    v-else-if="form"
    :title="form.name"
    :items="picker.items"
    :groups="picker.groups"
    :text="pickerText"
    :selected="form.provider"
    :actions="formActions"
    @pick="flow.chooseService"
    @back="form.edit ? flow.close() : flow.pickService()"
    @close="flow.close()"
  >
    <div class="glim-signin-tile-form" :data-signin-form="form.provider">
      <p class="glim-signin-tile-text">{{ fill(text.services.formHint, { name: form.name }) }}</p>
      <FieldRowGroup>
        <FieldRow v-if="form.own" :label="text.services.label">
          <TextField :model-value="state.draft.label" :error="err('label')" data-signin-field="label" @update:model-value="flow.set('label', $event)" />
        </FieldRow>
        <FieldRow :label="text.services.issuer" :hint="text.services.issuerHint">
          <TextField mono :model-value="state.draft.issuer" :error="err('issuer')" data-signin-field="issuer" @update:model-value="flow.set('issuer', $event)" />
        </FieldRow>
        <FieldRow :label="text.services.clientId">
          <TextField mono :model-value="state.draft.clientId" :error="err('clientId')" data-signin-field="clientId" @update:model-value="flow.set('clientId', $event)" />
        </FieldRow>
        <FieldRow :label="text.services.secret" :hint="form.edit ? text.services.secretKept : undefined">
          <PasswordField autocomplete="off" :model-value="state.draft.secret" :text="eye" :error="err('secret')" data-signin-field="secret" @update:model-value="flow.set('secret', $event)" />
        </FieldRow>
        <FieldRow :label="text.services.redirect" :hint="text.services.redirectHint">
          <CopyField :value="form.redirect" :text="{ copy: text.copy, copied: text.copied }" />
        </FieldRow>
        <template v-if="form.own">
          <FieldRow v-for="[key, label] in ownFields" :key="key" :label="label">
            <TextField mono :model-value="state.draft[key]" :error="err(key)" :data-signin-field="key" @update:model-value="flow.set(key, $event)" />
          </FieldRow>
        </template>
      </FieldRowGroup>
      <p class="glim-signin-tile-quiet">{{ fill(text.services.whoGetsIn, { name: form.name }) }}</p>
      <p v-if="state.said" :class="state.said.ok ? 'glim-signin-tile-said' : 'glim-signin-tile-said glim-signin-tile-said--fail'" :role="state.said.ok ? 'status' : 'alert'">
        {{ state.said.message }}
      </p>
    </div>
  </PickerWindow>
</template>
