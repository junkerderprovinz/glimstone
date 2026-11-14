import { createMemo, createSignal, createUniqueId, Index, mergeProps, type JSX } from "solid-js";
import * as carousel from "@zag-js/carousel";
import { normalizeProps, useMachine } from "@zag-js/solid";
import { CAROUSEL_TEXT, pageDir, stillMotion, type CarouselText } from "@glimstone/core";
import { Button } from "./Button.tsx";
import { IconBack, IconForward } from "./glyphs.tsx";

export type { CarouselText } from "@glimstone/core";

// A row of slides seen one page at a time, such as the screenshots of a
// release. It never moves by itself, since a settled page does not
// idle-animate, and a move glides only where the motion level allows it.

export interface CarouselProps<T> {
  /** The carousel's accessible name. */
  label: string;
  items: readonly T[];
  /** The page in force, counted from 0. Left out, it keeps its own. */
  page?: number;
  onPageChange?: (page: number) => void;
  slidesPerPage?: number;
  /** Goes from the last page on to the first. */
  loop?: boolean;
  /** Draws a slide. */
  slide: (item: T, index: number) => JSX.Element;
  text?: Partial<CarouselText>;
}

export function Carousel<T>(raw: CarouselProps<T>) {
  const props = mergeProps({ slidesPerPage: 1, loop: false }, raw);
  const words = () => ({ ...CAROUSEL_TEXT, ...props.text });
  const id = createUniqueId();
  const [own, setOwn] = createSignal(0);
  const service = useMachine(carousel.machine, () => ({
    id,
    dir: pageDir(),
    slideCount: props.items.length,
    slidesPerPage: props.slidesPerPage,
    loop: props.loop,
    page: props.page ?? own(),
    spacing: "var(--space-6)",
    onPageChange: (d: { page: number }) => {
      setOwn(d.page);
      props.onPageChange?.(d.page);
    },
    translations: {
      item: (index: number, count: number) => words().slide(index + 1, count),
      indicator: (index: number) => words().goTo(index + 1),
    },
  }));
  const api = createMemo(() => carousel.connect(service, normalizeProps));
  return (
    <section data-glim="Carousel" {...api().getRootProps()} aria-label={props.label} class="glim-carousel">
      <div {...api().getItemGroupProps()} class="glim-carousel-slides">
        <Index each={props.items}>
          {(item, index) => (
            <div {...api().getItemProps({ index })} class="glim-carousel-slide">
              {props.slide(item(), index)}
            </div>
          )}
        </Index>
      </div>
      <div {...api().getControlProps()} class="glim-carousel-control">
        <Button label={words().previous} labelKey={null} glyph={<IconBack />} variant="icon" disabled={!api().canScrollPrev} onClick={() => api().scrollPrev(stillMotion())} />
        <div {...api().getIndicatorGroupProps()} class="glim-carousel-dots">
          <Index each={api().pageSnapPoints}>
            {(_, index) => <button {...api().getIndicatorProps({ index })} onClick={() => api().scrollTo(index, stillMotion())} class="glim-carousel-dot" />}
          </Index>
        </div>
        <Button label={words().next} labelKey={null} glyph={<IconForward />} variant="icon" disabled={!api().canScrollNext} onClick={() => api().scrollNext(stillMotion())} />
      </div>
    </section>
  );
}
