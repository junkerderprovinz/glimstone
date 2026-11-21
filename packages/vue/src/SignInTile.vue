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
  signInServiceMark,
  signInServiceStatus,
  signInTileCards,
  signInWhen,
  signInCardNotice,
  signInPasswordElsewhere,
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
import ConnectionRow from "./ConnectionRow.vue";
import EmptyState from "./EmptyState.vue";
import FieldRow from "./FieldRow.vue";
import FieldRowGroup from "./FieldRowGroup.vue";
import GlyphTile from "./GlyphTile.vue";
import { glyphFor, IconCancel } from "./glyphs";
import ListRow from "./ListRow.vue";
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
const notice = (card: "twoFactor" | "passkeys" | "tokens" | "services") => signInCardNotice(props.text, s.value, card);
const elsewhere = computed(() => signInPasswordElsewhere(props.text, s.value));
const had = computed(() => !!s.value.me?.password);
const glyph = (key: string) => glyphFor(key) as Component;

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
        <p v-if="elsewhere" class="glim-signin-tile-text">{{ elsewhere }}</p>
        <div v-else class="glim-signin-tile-body">
          <FieldRow :label="text.password.state" :value="had ? text.password.set : text.password.none" :tone="had ? undefined : 'warn'" />
          <FieldRowGroup v-if="s.editing">
            <FieldRow v-if="had" :label="text.password.current">
              <PasswordField autocomplete="current-password" :model-value="s.draft.current" :text="eye" :error="err('current')" @update:model-value="flow.set('current', $event)" />
            </FieldRow>
            <FieldRow :label="text.password.next">
              <PasswordField confirm :model-value="s.draft.next" :text="eye" :error="err('next')" @update:model-value="flow.set('next', $event)" @confirmed-change="flow.setConfirmed" />
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
        <FieldRow :label="text.askPassword.label">
          <Toggle :model-value="!!s.settings?.askPassword" data-signin-tile="ask-password" @update:model-value="flow.setAskPassword($event)" />
        </FieldRow>
      </Card>

      <Card v-else-if="c === 'twoFactor'" :title="text.twoFactor.title" :hint="text.twoFactor.hint" :hue-index="hueStart + i" data-signin-card="twoFactor">
        <UnavailableNotice v-if="notice('twoFactor')" :title="notice('twoFactor')!.title">{{ notice('twoFactor')!.reason }}</UnavailableNotice>
        <div v-else class="glim-signin-tile-body">
          <FieldRowGroup>
            <FieldRow :label="text.twoFactor.state" :value="s.me?.twoFactor ? text.twoFactor.on : text.twoFactor.off" :tone="s.me?.twoFactor ? 'ok' : undefined" />
            <FieldRow v-if="s.me?.twoFactor" :label="text.twoFactor.codesLeft" :value="plural(lang, text.twoFactor.codesLeftValue, s.me?.recoveryLeft ?? 0)" />
          </FieldRowGroup>
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
          <div v-if="s.passkeys.length > 0" class="glim-list glim-signin-tile-rows">
            <ListRow v-for="p in s.passkeys" :key="p.id" :name="p.name">
              <template #tile><GlyphTile :glyph="glyph(keys.passkey)" /></template>
              <template #badges><span class="glim-signin-tile-facts">{{ passkeyFacts(text, p, when).join(" · ") }}</span></template>
              <template #actions>
                <Button :label="text.passkeys.rename" :label-key="keys.rename" @click="flow.askRenamePasskey(p.id)" />
                <Button :label="text.remove" :label-key="keys.remove" :data-signin-tile="`remove-passkey-${p.id}`" @click="ask('passkey', p.id, p.name)" />
              </template>
            </ListRow>
          </div>
          <EmptyState v-else-if="s.passkeysHere" nested :glyph="glyph(keys.passkey)" :title="text.passkeys.none" :hint="text.passkeys.noneHint" />
          <div v-if="s.passkeysHere" class="glim-signin-tile-foot">
            <Button :label="text.passkeys.add" :label-key="keys.add" data-signin-tile="passkey-ask-add" @click="flow.askAddPasskey()" />
          </div>
        </div>
      </Card>

      <Card v-else-if="c === 'sessions'" :title="text.sessions.title" :hint="text.sessions.hint" :hue-index="hueStart + i" data-signin-card="sessions">
        <div class="glim-signin-tile-body">
          <div class="glim-list glim-signin-tile-rows">
            <ListRow v-for="x in s.sessions" :key="x.id" :name="signInDevice(x.agent, text.sessions).name">
              <template #tile><GlyphTile :glyph="glyph(signInDevice(x.agent, text.sessions).phone ? keys.phone : keys.laptop)" /></template>
              <template #badges>
                <span class="glim-signin-tile-facts">{{ sessionFacts(text, x, s.services, when).join(" · ") }}</span>
                <Badge v-if="x.current" tone="active">{{ text.sessions.current }}</Badge>
              </template>
              <template v-if="!x.current" #actions>
                <Button
                  :label="text.sessions.end"
                  :label-key="keys.end"
                  :busy="s.busy === `session-end-${x.id}`"
                  :data-signin-tile="`session-end-${x.id}`"
                  @click="flow.endSession(x.id)"
                />
              </template>
            </ListRow>
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
          <div v-if="s.tokens.length > 0" class="glim-list glim-signin-tile-rows">
            <ListRow v-for="k in s.tokens" :key="k.id" :name="k.name">
              <template #tile><GlyphTile :glyph="glyph(keys.token)" /></template>
              <template #badges>
                <span class="glim-signin-tile-facts">{{ tokenFacts(text, k, when).join(" · ") }}</span>
                <Badge v-for="scope in k.scopes" :key="scope">{{ text.tokens.scopes[scope] ?? scope }}</Badge>
              </template>
              <template #actions>
                <Button :label="text.tokens.revoke" :label-key="keys.revoke" :data-signin-tile="`remove-token-${k.id}`" @click="ask('token', k.id, k.name)" />
              </template>
            </ListRow>
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
          <ConnectionRow
            v-for="x in s.services ?? []"
            :key="x.id"
            :name="x.name"
            :mark="signInServiceMark(providers, x.provider) ?? glyph(keys.service)"
            :status="signInServiceStatus(text, x, when)"
            :test="s.rowTests[x.id]"
            :actions="signInServiceActions(text, x, s, keys.turnOn, (id) => void flow.confirmService(id))"
            :text="{ test: text.services.test, edit: text.services.edit, remove: text.remove }"
            :data-signin-service="x.provider"
            :on-test="x.fromConfig ? undefined : () => flow.testService(x.id)"
            :on-edit="x.fromConfig ? undefined : () => flow.editService(x.id)"
            :on-remove="x.fromConfig ? undefined : () => ask('service', x.id, x.name)"
          >
            <template #badges>
              <Badge :tone="signInServiceBadge(text, x).tone">{{ signInServiceBadge(text, x).label }}</Badge>
            </template>
            <Toggle
              v-if="!x.fromConfig"
              :model-value="x.on"
              :label="text.services.show"
              :refused="!x.tested || x.paused ? text.services.mustTest : undefined"
              :data-signin-tile="`service-on-${x.id}`"
              @update:model-value="flow.setServiceOn(x.id, $event)"
            />
          </ConnectionRow>
          <div class="glim-signin-tile-foot">
            <Button :label="text.services.add" :label-key="keys.addService" data-signin-tile="service-pick" @click="flow.pickService()" />
          </div>
        </div>
      </Card>

      <Card v-else :title="text.accounts.title" :hint="text.accounts.hint" :hue-index="hueStart + i" data-signin-card="accounts">
        <div class="glim-list glim-signin-tile-rows">
          <ListRow v-for="a in s.accounts ?? []" :key="a.id" :name="a.name">
            <template #tile><GlyphTile :glyph="glyph(keys.account)" /></template>
            <template #badges>
              <span class="glim-signin-tile-facts">{{ accountFacts(text, a, s.services, when).join(" · ") }}</span>
              <Badge v-if="a.owner">{{ text.accounts.owner }}</Badge>
              <Badge v-if="a.blocked" tone="warn">{{ text.accounts.blocked }}</Badge>
            </template>
            <template v-if="!a.owner && a.id !== s.me?.account" #actions>
              <Button
                :label="a.blocked ? text.accounts.unblock : text.accounts.block"
                :label-key="a.blocked ? keys.unblock : keys.block"
                :busy="s.busy === `account-block-${a.id}`"
                :data-signin-tile="`account-block-${a.id}`"
                @click="flow.block(a.id, !a.blocked)"
              />
              <Button :label="text.remove" :label-key="keys.remove" :data-signin-tile="`remove-account-${a.id}`" @click="ask('account', a.id, a.name)" />
            </template>
          </ListRow>
        </div>
      </Card>
    </template>
    <SignInTileWindow :state="s" :flow="flow" :api="api" :text="text" :lang="lang" :scopes="scopes" :providers="providers" :keys="keys" />
    <ConfirmHost />
  </div>
</template>
