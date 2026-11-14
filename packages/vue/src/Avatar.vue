<script setup lang="ts">
import { computed, useId } from "vue";
import * as avatar from "@zag-js/avatar";
import { normalizeProps, useMachine } from "@zag-js/vue";
import { avatarView, initials, pageDir, type AvatarSize } from "@glimstone/core";

// A person's picture, and their initials while it loads, when it fails or when
// there is none. The name is what a screen reader hears either way.
const props = withDefaults(
  defineProps<{
    /** The person's name: the accessible name, and where the initials come from. */
    name: string;
    src?: string;
    size?: AvatarSize;
    /** A palette position, for a list of people whose circles each take a hue under rainbow. */
    hueIndex?: number;
  }>(),
  { size: "md" },
);

const id = useId();
const service = useMachine(avatar.machine, { id, dir: pageDir() });
const api = computed(() => avatar.connect(service, normalizeProps));
const view = computed(() => avatarView({ size: props.size, hueIndex: props.hueIndex }));
</script>

<template>
  <span data-glim="Avatar" v-bind="api.getRootProps()" role="img" :aria-label="name" :class="view.className" :style="view.style">
    <img v-if="src" v-bind="api.getImageProps()" :src="src" alt="" class="glim-avatar-image" />
    <span v-bind="api.getFallbackProps()" aria-hidden="true" class="glim-avatar-fallback">{{ initials(name) }}</span>
  </span>
</template>
