<script lang="ts" module>
  import type { Snippet } from "svelte";
  import type { CarouselText } from "@glimstone/core";

  export type { CarouselText } from "@glimstone/core";

  export interface CarouselProps<T> {
    /** The carousel's accessible name. */
    label: string;
    items: readonly T[];
    /** The page in force, counted from 0, bound with `bind:page`. Left out, it keeps its own. */
    page?: number;
    onPageChange?: (page: number) => void;
    slidesPerPage?: number;
    /** Goes from the last page on to the first. */
    loop?: boolean;
    /** Draws a slide. */
    slide: Snippet<[T, number]>;
    text?: Partial<CarouselText>;
  }
</script>

<script lang="ts" generics="T">
  import * as carousel from "@zag-js/carousel";
  import { normalizeProps, useMachine } from "@zag-js/svelte";
  import { CAROUSEL_TEXT, pageDir, stillMotion } from "@glimstone/core";
  import Button from "./Button.svelte";
  import { IconBack, IconForward } from "./glyphs.js";

  // A row of slides seen one page at a time, such as the screenshots of a
  // release. It never moves by itself, since a settled page does not
  // idle-animate, and a move glides only where the motion level allows it.
  let { label, items, page = $bindable(), onPageChange, slidesPerPage = 1, loop = false, slide, text }: CarouselProps<T> = $props();

  const words = $derived({ ...CAROUSEL_TEXT, ...text });
  const id = $props.id();
  const service = useMachine(carousel.machine, () => ({
    id,
    dir: pageDir(),
    slideCount: items.length,
    slidesPerPage,
    loop,
    page: page ?? 0,
    spacing: "var(--space-6)",
    onPageChange: (d: { page: number }) => {
      page = d.page;
      onPageChange?.(d.page);
    },
    translations: {
      item: (index: number, count: number) => words.slide(index + 1, count),
      indicator: (index: number) => words.goTo(index + 1),
    },
  }));
  const api = $derived(carousel.connect(service, normalizeProps));
</script>

<section data-glim="Carousel" {...api.getRootProps()} aria-label={label} class="glim-carousel">
  <div {...api.getItemGroupProps()} class="glim-carousel-slides">
    {#each items as item, index (index)}
      <div {...api.getItemProps({ index })} class="glim-carousel-slide">{@render slide(item, index)}</div>
    {/each}
  </div>
  <div {...api.getControlProps()} class="glim-carousel-control">
    <Button label={words.previous} labelKey={null} glyph={IconBack} variant="icon" disabled={!api.canScrollPrev} onClick={() => api.scrollPrev(stillMotion())} />
    <div {...api.getIndicatorGroupProps()} class="glim-carousel-dots">
      {#each api.pageSnapPoints as _, index (index)}
        <button {...api.getIndicatorProps({ index })} onclick={() => api.scrollTo(index, stillMotion())} class="glim-carousel-dot"></button>
      {/each}
    </div>
    <Button label={words.next} labelKey={null} glyph={IconForward} variant="icon" disabled={!api.canScrollNext} onClick={() => api.scrollNext(stillMotion())} />
  </div>
</section>
