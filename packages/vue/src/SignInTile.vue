<script setup lang="ts">
import { computed, onBeforeUnmount, shallowRef, watch, type Component } from "vue";
import {
  accountFacts,
  createSignInTileFlow,
  fill,
  passkeyFacts,
  plural,
  removalQuestion,
  sessionFacts,
  showTileRefusal,
  SIGN_IN_TILE_CARDS,
  SIGN_IN_TILE_KEYS,
  signInDevice,
  signInServiceActions,
  signInServiceBadge,
  signInServiceLabel,
  signInServiceStatus,
  signInTileCards,
  signInWhen,
  signInCardNotice,
  signInPasswordAsks,
  signInPasswordElsewhere,
  signInShortHint,
  tokenFacts,
  type Catalog,
  type SignInApi,
  type SignInTileCard,
  type SignInTileField,
  type SignInTileLabelKeys,
  type SignInTileRemoval,
  type SignInTileText,
  type ToastSeverity,
} from "@glimstone/core";
import Badge from "./Badge.vue";
import Button from "./Button.vue";
import Card from "./Card.vue";
import { useConfirm } from "./confirm";
import EmptyState from "./EmptyState.vue";
import FieldRow from "./FieldRow.vue";
import FieldRowGroup from "./FieldRowGroup.vue";
import ConnectionRow from "./ConnectionRow.vue";
import { glyphFor, IconCancel } from "./glyphs";
import PasswordField from "./PasswordField.vue";
import SignInTileWindow from "./SignInTileWindow.vue";
import Toggle from "./Toggle.vue";
import UnavailableNotice from "./UnavailableNotice.vue";

// The settings tile "Sign-in" ("The sign-in tile" in the design language):
// the password, the question before sensitive changes, two-factor, passkeys,
// sessions, API tokens, sign-in services and accounts, each a card of its own.
// The flow lives in the core and talks to the kit through the client, so the
// tile reads what it shows itself; the app hands in the client and its words.
const props = withDefaults(
  defineProps<{
    api: SignInApi;
    text: SignInTileText;
    /** The interface language, for counts, lists and dates. */
    lang: string;
    /** The identity catalog, `IDENTITY_PROVIDERS`, or the part of it the app offers. */
    providers: Catalog;
    /** The cards to draw, in the tile's own order. A card the account may not see stays out. */
    cards?: readonly SignInTileCard[];
    /** The scopes a new token can take, the narrowest first, as the app's kit knows them. */
    scopes?: string[];
    /** Puts what a change did, or why it failed, into the app's toasts. */
    notify?: (message: string, severity: ToastSeverity) => void;
    /** The path a test sign-in comes back to, where the tile stands. */
    returnTo?: string;
    /** The code a sign-in service sent back, from `takeSignInCode()`. */
    arrived?: string | null;
    /** Leaves the page for a test sign-in. Without it the browser goes there. */
    onLeave?: (url: string) => void;
    /** Formats a date the way the app writes them. */
    time?: (iso: string) => string;
    /** The rainbow position the first card takes. */
    hueStart?: number;
    labelKeys?: Partial<SignInTileLabelKeys>;
  }>(),
  { cards: () => SIGN_IN_TILE_CARDS, scopes: () => ["read", "all"], hueStart: 0 },
);

const flow = createSignInTileFlow(() => props);
const s = shallowRef(flow.state());
const unsubscribe = flow.subscribe(() => (s.value = flow.state()));
const stop = flow.start();
onBeforeUnmount(() => {
  unsubscribe();
  stop();
});
watch(
  () => props.arrived,
  (code) => {
    if (code) flow.arrive(code);
  },
  { immediate: true },
);
watch(
  () => s.value.refusal?.count,
  (_, __, onCleanup) => onCleanup(showTileRefusal(s.value.refusal)),
  { flush: "post" },
);

const keys = computed<SignInTileLabelKeys>(() => ({ ...SIGN_IN_TILE_KEYS, ...props.labelKeys }));
const when = computed(() => props.time ?? signInWhen(props.lang));
const eye = computed(() => ({ show: props.text.show, hide: props.text.hide, confirm: props.text.confirmPassword, mismatch: props.text.mismatch }));
const err = (field: SignInTileField) => (s.value.invalid?.field === field ? s.value.invalid.message : undefined);
const shown = computed(() => signInTileCards(s.value, props.cards));
const notice = (card: "askPassword" | "twoFactor" | "passkeys" | "tokens" | "services" | "sessions" | "accounts") => signInCardNotice(props.text, s.value, card);
const elsewhere = computed(() => signInPasswordElsewhere(props.text, s.value));
const had = computed(() => !!s.value.me?.password);
const asks = computed(() => signInPasswordAsks(s.value, props.cards) && !s.value.editing);
const glyph = (key: string) => glyphFor(key) as Component;
// The words of a row's own buttons: a service's test, edit and remove, and a passkey's rename in place of edit.
const rowText = (edit = props.text.services.edit) => ({ test: props.text.services.test, edit, remove: props.text.remove });

const { confirm, ConfirmHost } = useConfirm({ title: props.text.confirm, cancel: props.text.cancel, confirm: props.text.confirm });
function ask(what: SignInTileRemoval, id: string, name: string) {
  const q = removalQuestion(props.text, what, name);
  void confirm(q.message, { confirmLabel: q.confirm, confirmLabelKey: keys.value.remove }).then((yes) => {
    if (yes) void flow.remove(what, id);
  });
}
</script>

<template>
  <div data-glim="SignInTile" class="glim-signin-tile">
    <template v-for="(c, i) in shown" :key="c">
      <Card
        v-if="c === 'password'"
        :title="text.password.title"
        :hint="s.me?.via === 'open' ? text.password.openHint : fill(text.password.hint, { min: s.offer?.minPassword ?? 12 })"
        :hue-index="hueStart + i"
        data-signin-card="password"
      >
        <div v-if="elsewhere" class="glim-signin-tile-body">
          <p class="glim-signin-tile-text">{{ elsewhere }}</p>
          <FieldRow v-if="asks" :label="text.askPassword.label" :hint="text.askPassword.when">
            <Toggle :model-value="!!s.settings?.askPassword" data-signin-tile="ask-password" @update:model-value="flow.setAskPassword($event)" />
          </FieldRow>
        </div>
        <div v-else class="glim-signin-tile-body">
          <FieldRowGroup v-if="had">
            <FieldRow :label="text.password.state" :value="text.password.set" />
            <FieldRow v-if="asks" :label="text.askPassword.label" :hint="text.askPassword.when">
              <Toggle :model-value="!!s.settings?.askPassword" data-signin-tile="ask-password" @update:model-value="flow.setAskPassword($event)" />
            </FieldRow>
          </FieldRowGroup>
          <EmptyState v-else-if="!s.editing" nested :glyph="glyph(keys.setPassword)" :title="text.password.none" :hint="text.password.noneHint" />
          <FieldRowGroup v-if="s.editing">
            <FieldRow v-if="had" :label="text.password.current">
              <PasswordField autocomplete="current-password" :model-value="s.draft.current" :text="eye" :error="err('current')" @update:model-value="flow.set('current', $event)" />
            </FieldRow>
            <FieldRow :label="text.password.next">
              <PasswordField
                confirm
                :model-value="s.draft.next"
                :text="eye"
                :error="err('next')"
                :note="signInShortHint(text.password.shortHint, s.draft.next, s.offer?.minPassword ?? 12)"
                @update:model-value="flow.set('next', $event)"
                @confirmed-change="flow.setConfirmed"
              />
            </FieldRow>
          </FieldRowGroup>
          <div class="glim-signin-tile-foot">
            <template v-if="s.editing">
              <Button :label="text.cancel" label-key="common.cancel" :glyph="IconCancel" @click="flow.cancelPassword()" />
              <Button
                :label="text.password.save"
                :label-key="keys.savePassword"
                tone="accent"
                :busy="s.busy === 'save-password'"
                :disabled="!s.confirmed || (had && s.draft.current === '')"
                data-signin-tile="save-password"
                @click="flow.savePassword()"
              />
            </template>
            <template v-else>
              <Button v-if="had" :label="text.password.remove" :label-key="keys.removePassword" data-signin-tile="ask-remove-password" @click="flow.askRemovePassword()" />
              <Button :label="had ? text.password.change : text.password.add" :label-key="had ? keys.change : keys.setPassword" data-signin-tile="edit-password" @click="flow.editPassword()" />
            </template>
          </div>
        </div>
      </Card>

      <Card v-else-if="c === 'askPassword'" :title="text.askPassword.title" :hint="text.askPassword.hint" :hue-index="hueStart + i" data-signin-card="askPassword">
        <UnavailableNotice v-if="notice('askPassword')" :title="notice('askPassword')!.title">{{ notice('askPassword')!.reason }}</UnavailableNotice>
        <FieldRow v-else :label="text.askPassword.label" :hint="text.askPassword.when">
          <Toggle :model-value="!!s.settings?.askPassword" data-signin-tile="ask-password" @update:model-value="flow.setAskPassword($event)" />
        </FieldRow>
      </Card>

      <Card v-else-if="c === 'twoFactor'" :title="text.twoFactor.title" :hint="text.twoFactor.hint" :hue-index="hueStart + i" data-signin-card="twoFactor">
        <UnavailableNotice v-if="notice('twoFactor')" :title="notice('twoFactor')!.title">{{ notice('twoFactor')!.reason }}</UnavailableNotice>
        <div v-else class="glim-signin-tile-body">
          <FieldRowGroup v-if="s.me?.twoFactor">
            <FieldRow :label="text.twoFactor.state" :value="text.twoFactor.on" tone="ok" />
            <FieldRow :label="text.twoFactor.codesLeft" :value="plural(lang, text.twoFactor.codesLeftValue, s.me?.recoveryLeft ?? 0)" />
          </FieldRowGroup>
          <EmptyState v-else nested :glyph="glyph(keys.setUp)" :title="text.twoFactor.none" :hint="text.twoFactor.noneHint" />
          <div class="glim-signin-tile-foot">
            <template v-if="s.me?.twoFactor">
              <Button :label="text.twoFactor.newCodes" :label-key="keys.newCodes" :busy="s.busy === 'two-factor-codes'" data-signin-tile="two-factor-codes" @click="flow.newCodes()" />
              <Button :label="text.twoFactor.turnOff" :label-key="keys.turnOff" data-signin-tile="ask-two-factor-off" @click="flow.askTwoFactorOff()" />
            </template>
            <Button v-else :label="text.twoFactor.setUp" :label-key="keys.setUp" :busy="s.busy === 'two-factor-set-up'" data-signin-tile="two-factor-set-up" @click="flow.setUpTwoFactor()" />
          </div>
        </div>
      </Card>

      <Card v-else-if="c === 'passkeys'" :title="text.passkeys.title" :hint="text.passkeys.hint" :hue-index="hueStart + i" data-signin-card="passkeys">
        <UnavailableNotice v-if="notice('passkeys')" :title="notice('passkeys')!.title">{{ notice('passkeys')!.reason }}</UnavailableNotice>
        <div v-else class="glim-signin-tile-body">
          <UnavailableNotice v-if="!s.passkeysHere" :title="text.passkeys.unavailableTitle">{{ text.passkeys.unavailable }}</UnavailableNotice>
          <div v-if="s.passkeys.length > 0" class="glim-signin-tile-rows">
            <ConnectionRow
              v-for="p in s.passkeys"
              :key="p.id"
              :name="p.name"
              :mark="glyph(keys.passkey)"
              :status="passkeyFacts(text, p, when).added"
              :text="rowText(text.passkeys.rename)"
              :label-keys="{ edit: keys.rename, remove: keys.remove }"
              :on-edit="() => flow.askRenamePasskey(p.id)"
              :on-remove="() => ask('passkey', p.id, p.name)"
            >
              <p class="glim-connection-status">{{ passkeyFacts(text, p, when).more }}</p>
            </ConnectionRow>
          </div>
          <EmptyState v-else-if="s.passkeysHere" nested :glyph="glyph(keys.passkey)" :title="text.passkeys.none" :hint="text.passkeys.noneHint" />
          <div v-if="s.passkeysHere" class="glim-signin-tile-foot">
            <Button :label="text.passkeys.add" :label-key="keys.add" data-signin-tile="passkey-ask-add" @click="flow.askAddPasskey()" />
          </div>
        </div>
      </Card>

      <Card v-else-if="c === 'sessions'" :title="text.sessions.title" :hint="text.sessions.hint" :hue-index="hueStart + i" data-signin-card="sessions">
        <UnavailableNotice v-if="notice('sessions')" :title="notice('sessions')!.title">{{ notice('sessions')!.reason }}</UnavailableNotice>
        <div v-else class="glim-signin-tile-body">
          <div class="glim-signin-tile-rows">
            <ConnectionRow
              v-for="x in s.sessions"
              :key="x.id"
              :name="signInDevice(x.agent, text.sessions).name"
              :mark="glyph(signInDevice(x.agent, text.sessions).phone ? keys.phone : keys.laptop)"
              :status="sessionFacts(text, x, s.serviceLabels, when).join(' · ')"
              :text="rowText()"
              :actions="x.current ? [] : [{ id: 'end', label: text.sessions.end, labelKey: keys.end, busy: s.busy === `session-end-${x.id}`, onClick: () => void flow.endSession(x.id) }]"
            >
              <template v-if="x.current" #badges>
                <Badge size="small" tone="active">{{ text.sessions.current }}</Badge>
              </template>
            </ConnectionRow>
          </div>
          <div v-if="s.sessions.some((x) => !x.current)" class="glim-signin-tile-foot">
            <Button
              :label="text.sessions.endOthers"
              :label-key="keys.endOthers"
              :busy="s.busy === 'sessions-end-others'"
              data-signin-tile="sessions-end-others"
              @click="flow.endOtherSessions()"
            />
          </div>
        </div>
      </Card>

      <Card v-else-if="c === 'tokens'" :title="text.tokens.title" :hint="text.tokens.hint" :hue-index="hueStart + i" data-signin-card="tokens">
        <UnavailableNotice v-if="notice('tokens')" :title="notice('tokens')!.title">{{ notice('tokens')!.reason }}</UnavailableNotice>
        <div v-else class="glim-signin-tile-body">
          <div v-if="s.tokens.length > 0" class="glim-signin-tile-rows">
            <ConnectionRow
              v-for="k in s.tokens"
              :key="k.id"
              :name="k.name"
              :mark="glyph(keys.token)"
              :status="tokenFacts(text, k, when).join(' · ')"
              :text="rowText()"
              :actions="[{ id: 'revoke', label: text.tokens.revoke, labelKey: keys.revoke, onClick: () => ask('token', k.id, k.name) }]"
            >
              <template v-if="k.scopes.length > 0" #badges>
                <Badge v-for="scope in k.scopes" :key="scope" size="small">{{ text.tokens.scopes[scope] ?? scope }}</Badge>
              </template>
            </ConnectionRow>
          </div>
          <EmptyState v-else nested :glyph="glyph(keys.token)" :title="text.tokens.none" :hint="text.tokens.noneHint" />
          <div class="glim-signin-tile-foot">
            <Button :label="text.tokens.create" :label-key="keys.createToken" data-signin-tile="token-ask" @click="flow.askToken()" />
          </div>
        </div>
      </Card>

      <Card v-else-if="c === 'services'" :title="text.services.title" :hint="text.services.hint" :hue-index="hueStart + i" data-signin-card="services">
        <UnavailableNotice v-if="notice('services')" :title="notice('services')!.title">{{ notice('services')!.reason }}</UnavailableNotice>
        <div v-else class="glim-signin-tile-body">
          <div v-if="(s.services?.length ?? 0) > 0" class="glim-signin-tile-rows">
            <ConnectionRow
              v-for="x in s.services ?? []"
              :key="x.id"
              :name="signInServiceLabel(x, providers, text).name"
              :mark="signInServiceLabel(x, providers, text).mark ?? glyph(keys.service)"
              :status="signInServiceStatus(text, x, when)"
              :data-signin-service="x.provider"
              :text="rowText()"
              :label-keys="{ test: keys.test, edit: keys.edit, remove: keys.remove }"
              :actions="signInServiceActions(text, x, s, keys.turnOn, (id) => void flow.confirmService(id))"
              :test="s.rowTests[x.id]"
              :on-test="x.fromConfig ? undefined : () => void flow.testService(x.id)"
              :on-edit="x.fromConfig ? undefined : () => flow.editService(x.id)"
              :on-remove="x.fromConfig ? undefined : () => ask('service', x.id, signInServiceLabel(x, providers, text).name)"
            >
              <template v-if="signInServiceBadge(text, x)" #badges>
                <Badge size="small" :tone="signInServiceBadge(text, x)!.tone">{{ signInServiceBadge(text, x)!.label }}</Badge>
              </template>
              <template v-if="!x.fromConfig" #control>
                <Toggle
                  :model-value="x.on"
                  :label="text.services.show"
                  hide-label
                  :refused="!x.tested || x.paused ? text.services.mustTest : undefined"
                  :data-signin-tile="`service-on-${x.id}`"
                  @update:model-value="flow.setServiceOn(x.id, $event)"
                />
              </template>
            </ConnectionRow>
          </div>
          <div class="glim-signin-tile-foot">
            <Button :label="text.services.add" :label-key="keys.addService" data-signin-tile="service-pick" @click="flow.pickService()" />
          </div>
        </div>
      </Card>

      <Card v-else :title="text.accounts.title" :hint="text.accounts.hint" :hue-index="hueStart + i" data-signin-card="accounts">
        <UnavailableNotice v-if="notice('accounts')" :title="notice('accounts')!.title">{{ notice('accounts')!.reason }}</UnavailableNotice>
        <div v-else class="glim-signin-tile-rows">
          <ConnectionRow
            v-for="a in s.accounts ?? []"
            :key="a.id"
            :name="a.name"
            :mark="glyph(keys.account)"
            :status="accountFacts(text, a, s.serviceLabels, when).join(' · ')"
            :text="rowText()"
            :label-keys="{ remove: keys.remove }"
            :actions="
              a.owner || a.id === s.me?.account
                ? []
                : [
                    {
                      id: 'block',
                      label: a.blocked ? text.accounts.unblock : text.accounts.block,
                      labelKey: a.blocked ? keys.unblock : keys.block,
                      busy: s.busy === `account-block-${a.id}`,
                      onClick: () => void flow.block(a.id, !a.blocked),
                    },
                  ]
            "
            :on-remove="a.owner || a.id === s.me?.account ? undefined : () => ask('account', a.id, a.name)"
          >
            <template v-if="a.owner || a.blocked" #badges>
              <Badge v-if="a.owner" size="small">{{ text.accounts.owner }}</Badge>
              <Badge v-if="a.blocked" size="small" tone="warn">{{ text.accounts.blocked }}</Badge>
            </template>
          </ConnectionRow>
        </div>
      </Card>
    </template>
    <SignInTileWindow :state="s" :flow="flow" :api="api" :text="text" :lang="lang" :scopes="scopes" :providers="providers" :keys="keys" />
    <ConfirmHost />
  </div>
</template>
