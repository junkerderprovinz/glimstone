// The words of the components on the Zag machines, as one table a language.
// GlimStone carries them in every language the glossary (@glimstone/terms)
// holds, in componentLocales/, one module a language, so an app can load just
// its own. A sentence that names a value carries it as a placeholder, and one
// that counts carries the plural forms of its language.

import type { Plural } from "./fortressText.ts";
import type { DateView } from "./datePicker.ts";
import type { FileRefusal } from "./fileUpload.ts";

export interface ComponentWords {
  pagination: {
    label: string;
    previous: string;
    next: string;
    /** "{page}" and "{pages}". */
    page: string;
  };
  pinInput: {
    /** "{index}" and "{length}". */
    cell: string;
  };
  tagsInput: {
    /** Each with "{tag}". */
    remove: string;
    added: string;
    selected: string;
    removed: string;
  };
  steps: { back: string; next: string; finish: string };
  splitter: { resize: string };
  fileUpload: {
    drop: string;
    /** "{name}". */
    remove: string;
    /** Each with "{name}". */
    refused: Record<FileRefusal, string>;
  };
  datePicker: {
    placeholder: string;
    calendar: string;
    previous: Record<DateView, string>;
    next: Record<DateView, string>;
    zoomOut: string;
  };
  rating: {
    /** By the number of stars, with "{value}" and "{count}". */
    star: Plural;
  };
  timer: {
    start: string;
    pause: string;
    resume: string;
    reset: string;
    hours: Plural;
    minutes: Plural;
    seconds: Plural;
  };
  carousel: {
    previous: string;
    next: string;
    /** "{index}" and "{count}". */
    slide: string;
    /** "{index}". */
    goTo: string;
  };
  marquee: { pause: string; resume: string };
  tour: {
    back: string;
    next: string;
    close: string;
    /** "{step}" and "{steps}". */
    progress: string;
  };
  floatingPanel: { minimize: string; maximize: string; restore: string; close: string };
  signaturePad: { area: string; clear: string };
}
