<script setup lang="ts">
import { computed, shallowRef } from "vue";
import { appCardView, memberName, openInstance, presenceTone, type FortressApp, type FortressInstance, type FortressText } from "@glimstone/core";
import Badge from "./Badge.vue";
import Button from "./Button.vue";
import FortressDoubtWindow from "./FortressDoubtWindow.vue";
import InfoBubble from "./InfoBubble.vue";
import InstanceCard from "./InstanceCard.vue";
import PresenceBadges from "./PresenceBadges.vue";
import { deviceGlyph } from "./fortressParts";

// Another app of the fortress: its state, where it runs, and the way to open
// it. Open and Remove stay quiet at the end of a row, and after the card's own
// Open on a card with one instance. Attributes go to the card, since the
// question beside it is a second root.
defineOptions({ inheritAttrs: false });
const props = withDefaults(defineProps<{
  app: FortressApp;
  text: FortressText;
  /** The interface language, for the counts. */
  lang: string;
  hueIndex?: number;
  /** Opens an instance, through the fortress where it runs elsewhere. Without it the instance's `open.href` opens in a new tab. */
  onOpen?: (app: FortressApp, instance: FortressInstance) => void;
  /** Asks before an instance is removed, with its name. Without it nothing here removes. */
  onRemove?: (id: string, name: string) => void;
  /** The label key behind Remove, which picks its glyph. */
  removeKey?: string;
}>(), { removeKey: "delete" });

const view = computed(() => appCardView(props.app, props.text, props.lang));
const single = computed(() => view.value.rows.length === 0);
const presence = (i: FortressInstance) => ({ connected: props.text.connected, checking: props.text.checking, away: props.text.away })[i.presence];
const device = (i: FortressInstance) => deviceGlyph(i.deviceKind);

const name = (i: FortressInstance) => memberName(props.text, props.app, i);
const removes = (i: FortressInstance) => !!props.onRemove && !i.self;
const acts = computed(() => !!view.value.open || (single.value && removes(view.value.main)));

const asking = shallowRef<FortressInstance | null>(null);
function open(instance: FortressInstance) {
  if (instance.doubt) asking.value = instance;
  else openInstance(props.app, instance, props.onOpen);
}
</script>

<template>
  <InstanceCard v-bind="$attrs" data-glim="FortressAppCard" :data-fortress-app="app.id" :logo="app.logo" :name="app.name" :eyebrow="view.eyebrow" :facts="view.facts" :hue-index="hueIndex">
    <template #badges>
      <Badge v-if="view.doubt" tone="warn">{{ view.doubt.label }}<InfoBubble :tip="view.doubt.tip" on-accent /></Badge>
      <Badge v-if="view.needs" tone="warn">{{ view.needs }}</Badge>
      <PresenceBadges :instance="view.main" :text="text" />
    </template>
    <template v-if="!single" #default>
      <ul class="glim-instance-rows">
        <li v-for="{ instance, sub, open: opens } in view.rows" :key="instance.id" class="glim-instance-row" :data-instance="instance.id">
          <span class="glim-instance-device" aria-hidden="true"><component :is="device(instance)" v-if="device(instance)" /></span>
          <span class="glim-instance-row-text">
            <span class="glim-instance-row-name">{{ instance.device }}</span>
            <span class="glim-instance-row-sub glim-num">{{ sub }}</span>
          </span>
          <span class="glim-instance-row-end">
            <Badge :tone="presenceTone(instance.presence)">{{ presence(instance) }}</Badge>
            <Button
              v-if="opens"
              :label="text.open"
              label-key="open"
              tone="subtle"
              variant="icon"
              compact
              :title="name(instance)"
              data-fortress="open"
              @click="open(instance)"
            />
            <Button
              v-if="removes(instance)"
              :label="text.remove"
              :label-key="removeKey"
              tone="subtle"
              variant="icon"
              compact
              :title="name(instance)"
              data-fortress="open-remove"
              @click="onRemove!(instance.id, name(instance))"
            />
          </span>
        </li>
      </ul>
    </template>
    <template v-if="acts" #actions>
      <Button v-if="view.open" :label="view.open.label" label-key="open" data-fortress="open" @click="open(view.main)" />
      <Button
        v-if="single && removes(view.main)"
        :label="text.remove"
        :label-key="removeKey"
        tone="subtle"
        :title="name(view.main)"
        data-fortress="open-remove"
        @click="onRemove!(view.main.id, name(view.main))"
      />
    </template>
  </InstanceCard>
  <FortressDoubtWindow
    v-if="asking"
    :app="app"
    :instance="asking"
    :text="text"
    :on-open="() => openInstance(app, asking!, onOpen)"
    :on-close="() => (asking = null)"
  />
</template>
