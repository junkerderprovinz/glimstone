import { useId, useState, type ReactNode } from "react";
import * as carousel from "@zag-js/carousel";
import { normalizeProps, useMachine } from "@zag-js/react";
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
  slide: (item: T, index: number) => ReactNode;
  text?: Partial<CarouselText>;
}

export function Carousel<T>({ label, items, page, onPageChange, slidesPerPage = 1, loop = false, slide, text }: CarouselProps<T>) {
  const words = { ...CAROUSEL_TEXT, ...text };
  const [own, setOwn] = useState(0);
  const service = useMachine(carousel.machine, {
    id: useId(),
    dir: pageDir(),
    slideCount: items.length,
    slidesPerPage,
    loop,
    page: page ?? own,
    spacing: "var(--space-6)",
    onPageChange: (d) => {
      setOwn(d.page);
      onPageChange?.(d.page);
    },
    translations: { item: (index, count) => words.slide(index + 1, count), indicator: (index) => words.goTo(index + 1) },
  });
  const api = carousel.connect(service, normalizeProps);
  return (
    <section data-glim="Carousel" {...api.getRootProps()} aria-label={label} className="glim-carousel">
      <div {...api.getItemGroupProps()} className="glim-carousel-slides">
        {items.map((item, index) => (
          <div key={index} {...api.getItemProps({ index })} className="glim-carousel-slide">
            {slide(item, index)}
          </div>
        ))}
      </div>
      <div {...api.getControlProps()} className="glim-carousel-control">
        <Button label={words.previous} labelKey={null} glyph={<IconBack />} variant="icon" disabled={!api.canScrollPrev} onClick={() => api.scrollPrev(stillMotion())} />
        <div {...api.getIndicatorGroupProps()} className="glim-carousel-dots">
          {api.pageSnapPoints.map((_, index) => (
            <button key={index} {...api.getIndicatorProps({ index })} onClick={() => api.scrollTo(index, stillMotion())} className="glim-carousel-dot" />
          ))}
        </div>
        <Button label={words.next} labelKey={null} glyph={<IconForward />} variant="icon" disabled={!api.canScrollNext} onClick={() => api.scrollNext(stillMotion())} />
      </div>
    </section>
  );
}
