// The captcha picker demos: the whole captcha catalog, as an app that hands a
// captcha to every solver would offer it. Each framework's demo draws the
// glyphs its own way.
import { catalogPicker, type PickerText } from "@glimstone/core";
import { CAPTCHA_PROVIDERS } from "@glimstone/core/captchaProviders";

const TITLES = {
  solver: { title: "Captcha solvers", hint: "Tried in your order before anyone is asked to solve one." },
};

export const CAPTCHA_TEXT: PickerText = {
  search: "Search solvers",
  none: "Nothing matches “{query}”.",
  clear: "Clear the search",
  close: "Close",
  cancel: "Cancel",
  back: "Back",
};

/** The picker's tiles and groups, with the framework's own glyph for a solver without a mark. */
export function captchaPicker<M>(glyph: (name: string) => M) {
  return catalogPicker(CAPTCHA_PROVIDERS, {
    ids: CAPTCHA_PROVIDERS.entries.map((e) => e.id),
    titles: TITLES,
    glyph: (entry) => glyph(entry.glyph ?? "IconCaptcha"),
    lang: "en",
  });
}

const NAMES = new Map(CAPTCHA_PROVIDERS.entries.map((e) => [e.id as string, e.name]));

/** The solver picked last, for the line beside the demo's button. */
export const captchaLine = (picked: string | null) => (picked ? `Picked: ${NAMES.get(picked) ?? picked}` : "No solver yet");
