<script setup lang="ts" generic="T">
import { computed, useId } from "vue";
import * as carousel from "@zag-js/carousel";
import { normalizeProps, useMachine } from "@zag-js/vue";
import { CAROUSEL_TEXT, pageDir, stillMotion, type CarouselText } from "@glimstone/core";
import Button from "./Button.vue";
import { IconBack, IconForward } from "./glyphs";

// A row of slides seen one page at a time, bound with v-model:page, such as
// the screenshots of a release. It never moves by itself, since a settled page
// does not idle-animate, and a move glides only where the motion level allows
// it. The `slide` slot draws a slide.
const props = withDefaults(
  defineProps<{
    /** The carousel's accessible name. */
    label: string;
    items: readonly T[];
    slidesPerPage?: number;
    /** Goes from the last page on to the first. */
    loop?: boolean;
    text?: Partial<CarouselText>;
  }>(),
  { slidesPerPage: 1, loop: false },
);
const page = defineModel<number>("page");
defineSlots<{ slide(props: { item: T; index: number }): unknown }>();

const words = computed(() => ({ ...CAROUSEL_TEXT, ...props.text }));
const id = useId();
const service = useMachine(
  carousel.machine,
  computed(() => ({
    id,
    dir: pageDir(),
    slideCount: props.items.length,
    slidesPerPage: props.slidesPerPage,
    loop: props.loop,
    page: page.value ?? 0,
    spacing: "var(--space-6)",
    onPageChange: (d: { page: number }) => (page.value = d.page),
    translations: {
      item: (index: number, count: number) => words.value.slide(index + 1, count),
      indicator: (index: number) => words.value.goTo(index + 1),
    },
  })),
);
const api = computed(() => carousel.connect(service, normalizeProps));
const dot = (index: number) => ({ ...api.value.getIndicatorProps({ index }), onClick: () => api.value.scrollTo(index, stillMotion()) });
</script>

<template>
  <section data-glim="Carousel" v-bind="api.getRootProps()" :aria-label="label" class="glim-carousel">
    <div v-bind="api.getItemGroupProps()" class="glim-carousel-slides">
      <div v-for="(item, index) in items" :key="index" v-bind="api.getItemProps({ index })" class="glim-carousel-slide">
        <slot name="slide" :item="item" :index="index" />
      </div>
    </div>
    <div v-bind="api.getControlProps()" class="glim-carousel-control">
      <Button :label="words.previous" :label-key="null" :glyph="IconBack" variant="icon" :disabled="!api.canScrollPrev" @click="api.scrollPrev(stillMotion())" />
      <div v-bind="api.getIndicatorGroupProps()" class="glim-carousel-dots">
        <button v-for="(_, index) in api.pageSnapPoints" :key="index" v-bind="dot(index)" class="glim-carousel-dot" />
      </div>
      <Button :label="words.next" :label-key="null" :glyph="IconForward" variant="icon" :disabled="!api.canScrollNext" @click="api.scrollNext(stillMotion())" />
    </div>
  </section>
</template>
