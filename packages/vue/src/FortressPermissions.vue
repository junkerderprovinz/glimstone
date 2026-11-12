<script setup lang="ts">
import { computed, ref } from "vue";
import { fill, MARKS, permissionsWith, shake, type FortressAnswer, type FortressApp, type FortressPermission, type FortressText, type ToastSeverity } from "@glimstone/core";
import Card from "./Card.vue";
import Selector from "./Selector.vue";
import Toggle from "./Toggle.vue";
import { MarkSvg } from "./glyphs";

// What one app may do at another, a switch for each, all on unless switched
// off. The scoped slot `extra` puts something of the app's own under one
// permission's words, such as the folder it writes to.
const props = defineProps<{
  text: FortressText;
  /** The app showing the card, for the filter "With {app}". */
  app: { id: string; name: string };
  /** Every app of the fortress, this one included, for the marks. */
  apps: Pick<FortressApp, "id" | "name" | "logo">[];
  permissions: FortressPermission[];
  /** Saves one switch the moment it flips. A refusal leaves it as it was and shakes it. */
  onPermission: (id: string, on: boolean) => Promise<FortressAnswer>;
  /** Puts the small confirmation of a save, or the reason it failed, into the app's toasts. */
  notify?: (message: string, severity: ToastSeverity) => void;
  hueIndex?: number;
}>();

const filter = ref<"all" | "with">("all");
const mine = computed(() => permissionsWith(props.permissions, props.app.id));
const shown = computed(() => (filter.value === "all" ? props.permissions : mine.value));
const items = computed(() => [
  { id: "all" as const, label: `${props.text.all} ${props.permissions.length}` },
  { id: "with" as const, label: `${fill(props.text.withApp, { app: props.app.name })} ${mine.value.length}` },
]);
const logo = (id: string) => props.apps.find((a) => a.id === id)?.logo;

async function flip(p: FortressPermission) {
  const answer = await props.onPermission(p.id, !p.on).catch((): FortressAnswer => ({}));
  if (answer.ok) {
    props.notify?.(fill(p.on ? props.text.permissionOff : props.text.permissionOn, { permission: p.title }), "success");
    return;
  }
  props.notify?.(answer.error ?? props.text.failed, "fail");
  const toggle = document.querySelector<HTMLElement>(`[data-permission="${CSS.escape(p.id)}"] .glim-toggle`);
  if (toggle) shake(toggle);
}
</script>

<template>
  <Card data-glim="FortressPermissions" :title="text.permissions" :hint="text.permissionsAbout" :hue-index="hueIndex">
    <p v-if="permissions.length === 0" class="glim-fortress-sub">{{ text.noPermissions }}</p>
    <template v-else>
      <Selector v-model="filter" :label="text.permissions" inline activation="manual" :items="items" />
      <ul class="glim-permissions">
        <li v-for="p in shown" :key="p.id" :class="['glim-permission', p.on && 'glim-permission--on']" :data-permission="p.id">
          <span class="glim-permission-pair" aria-hidden="true">
            <img v-if="logo(p.from)" :src="logo(p.from)" alt="" draggable="false" />
            <MarkSvg :mark="MARKS.expand" class="glim-permission-arrow" />
            <span class="glim-permission-to">
              <template v-for="to in p.to" :key="to"><img v-if="logo(to)" :src="logo(to)" alt="" draggable="false" /></template>
            </span>
          </span>
          <span class="glim-permission-text">
            <span class="glim-permission-title">{{ p.title }}</span>
            <span v-if="p.detail" class="glim-fortress-sub">{{ p.detail }}</span>
            <slot name="extra" :permission="p" />
          </span>
          <Toggle :model-value="p.on" :label="p.title" hide-label @update:model-value="flip(p)" />
        </li>
      </ul>
    </template>
  </Card>
</template>
