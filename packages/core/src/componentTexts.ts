// The words of every component on a Zag machine in one language, for an app
// that picks its language at run time. An app with one language imports its
// own table from componentLocales/ and builds what it needs from it.

import type { ComponentWords } from "./componentWords.ts";
import { paginationText } from "./pagination.ts";
import { pinInputText } from "./pinInput.ts";
import { tagsInputText } from "./tagsInput.ts";
import { fileUploadText } from "./fileUpload.ts";
import { ratingText } from "./rating.ts";
import { timerText } from "./timer.ts";
import { carouselText } from "./carousel.ts";
import { tourText } from "./tour.ts";
import type { PaginationText } from "./pagination.ts";
import type { PinInputText } from "./pinInput.ts";
import type { TagsInputText } from "./tagsInput.ts";
import type { StepsText } from "./steps.ts";
import type { SplitterText } from "./splitter.ts";
import type { FileUploadText } from "./fileUpload.ts";
import type { DatePickerText } from "./datePicker.ts";
import type { RatingText } from "./rating.ts";
import type { TimerText } from "./timer.ts";
import type { CarouselText } from "./carousel.ts";
import type { MarqueeText } from "./marquee.ts";
import type { TourText } from "./tour.ts";
import type { FloatingPanelText } from "./floatingPanel.ts";
import type { SignaturePadText } from "./signaturePad.ts";
import { en } from "./componentLocales/en.ts";
import { de } from "./componentLocales/de.ts";
import { ar } from "./componentLocales/ar.ts";
import { bg } from "./componentLocales/bg.ts";
import { ca } from "./componentLocales/ca.ts";
import { cs } from "./componentLocales/cs.ts";
import { da } from "./componentLocales/da.ts";
import { el } from "./componentLocales/el.ts";
import { es } from "./componentLocales/es.ts";
import { et } from "./componentLocales/et.ts";
import { eu } from "./componentLocales/eu.ts";
import { fa } from "./componentLocales/fa.ts";
import { fi } from "./componentLocales/fi.ts";
import { fr } from "./componentLocales/fr.ts";
import { gl } from "./componentLocales/gl.ts";
import { he } from "./componentLocales/he.ts";
import { hi } from "./componentLocales/hi.ts";
import { hr } from "./componentLocales/hr.ts";
import { hu } from "./componentLocales/hu.ts";
import { id } from "./componentLocales/id.ts";
import { is } from "./componentLocales/is.ts";
import { it } from "./componentLocales/it.ts";
import { ja } from "./componentLocales/ja.ts";
import { ko } from "./componentLocales/ko.ts";
import { lt } from "./componentLocales/lt.ts";
import { lv } from "./componentLocales/lv.ts";
import { ms } from "./componentLocales/ms.ts";
import { nl } from "./componentLocales/nl.ts";
import { no } from "./componentLocales/no.ts";
import { pl } from "./componentLocales/pl.ts";
import { pt } from "./componentLocales/pt.ts";
import { ro } from "./componentLocales/ro.ts";
import { ru } from "./componentLocales/ru.ts";
import { sk } from "./componentLocales/sk.ts";
import { sl } from "./componentLocales/sl.ts";
import { sr } from "./componentLocales/sr.ts";
import { sv } from "./componentLocales/sv.ts";
import { th } from "./componentLocales/th.ts";
import { tr } from "./componentLocales/tr.ts";
import { uk } from "./componentLocales/uk.ts";
import { vi } from "./componentLocales/vi.ts";
import { zh } from "./componentLocales/zh.ts";

const WORDS: Record<string, ComponentWords> = { en, de, ar, bg, ca, cs, da, el, es, et, eu, fa, fi, fr, gl, he, hi, hr, hu, id, is, it, ja, ko, lt, lv, ms, nl, no, pl, pt, ro, ru, sk, sl, sr, sv, th, tr, uk, vi, zh };

/** The languages GlimStone carries the components' words in, the same as the glossary's. */
export const COMPONENT_LANGUAGES = Object.keys(WORDS);

/** Each component's `text`, ready to pass as it is or to merge an app's own words into. */
export interface ComponentText {
  pagination: PaginationText;
  pinInput: PinInputText;
  tagsInput: TagsInputText;
  steps: StepsText;
  splitter: SplitterText;
  fileUpload: FileUploadText;
  datePicker: DatePickerText;
  rating: RatingText;
  timer: TimerText;
  carousel: CarouselText;
  marquee: MarqueeText;
  tour: TourText;
  floatingPanel: FloatingPanelText;
  signaturePad: SignaturePadText;
}

/** The words for a language tag such as `pt-BR`: its own, its base language's, or English. */
export function componentText(lang: string): ComponentText {
  const tag = lang.toLowerCase();
  const base = tag.split(/[-_]/)[0]!;
  const code = WORDS[tag] ? tag : WORDS[base] ? base : "en";
  const w = WORDS[code]!;
  return {
    pagination: paginationText(w.pagination, code),
    pinInput: pinInputText(w.pinInput, code),
    tagsInput: tagsInputText(w.tagsInput, code),
    steps: w.steps,
    splitter: w.splitter,
    fileUpload: fileUploadText(w.fileUpload, code),
    datePicker: w.datePicker,
    rating: ratingText(w.rating, code),
    timer: timerText(w.timer, code),
    carousel: carouselText(w.carousel, code),
    marquee: w.marquee,
    tour: tourText(w.tour, code),
    floatingPanel: w.floatingPanel,
    signaturePad: w.signaturePad,
  };
}
