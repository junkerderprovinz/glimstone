// Every table at once, for an app that picks its language at run time, from
// @glimstone/core/notifyCardTexts. An app with one language imports its own
// module from notifyLocales/ instead, and English comes with the core.

import type { NotifyCardText } from "./notifyCard.ts";
import { en } from "./notifyLocales/en.ts";
import { de } from "./notifyLocales/de.ts";
import { ar } from "./notifyLocales/ar.ts";
import { bg } from "./notifyLocales/bg.ts";
import { ca } from "./notifyLocales/ca.ts";
import { cs } from "./notifyLocales/cs.ts";
import { da } from "./notifyLocales/da.ts";
import { el } from "./notifyLocales/el.ts";
import { es } from "./notifyLocales/es.ts";
import { et } from "./notifyLocales/et.ts";
import { eu } from "./notifyLocales/eu.ts";
import { fa } from "./notifyLocales/fa.ts";
import { fi } from "./notifyLocales/fi.ts";
import { fr } from "./notifyLocales/fr.ts";
import { gl } from "./notifyLocales/gl.ts";
import { he } from "./notifyLocales/he.ts";
import { hi } from "./notifyLocales/hi.ts";
import { hr } from "./notifyLocales/hr.ts";
import { hu } from "./notifyLocales/hu.ts";
import { id } from "./notifyLocales/id.ts";
import { is } from "./notifyLocales/is.ts";
import { it } from "./notifyLocales/it.ts";
import { ja } from "./notifyLocales/ja.ts";
import { ko } from "./notifyLocales/ko.ts";
import { lt } from "./notifyLocales/lt.ts";
import { lv } from "./notifyLocales/lv.ts";
import { ms } from "./notifyLocales/ms.ts";
import { nl } from "./notifyLocales/nl.ts";
import { no } from "./notifyLocales/no.ts";
import { pl } from "./notifyLocales/pl.ts";
import { pt } from "./notifyLocales/pt.ts";
import { ro } from "./notifyLocales/ro.ts";
import { ru } from "./notifyLocales/ru.ts";
import { sk } from "./notifyLocales/sk.ts";
import { sl } from "./notifyLocales/sl.ts";
import { sr } from "./notifyLocales/sr.ts";
import { sv } from "./notifyLocales/sv.ts";
import { th } from "./notifyLocales/th.ts";
import { tr } from "./notifyLocales/tr.ts";
import { uk } from "./notifyLocales/uk.ts";
import { vi } from "./notifyLocales/vi.ts";
import { zh } from "./notifyLocales/zh.ts";

const TEXTS: Record<string, NotifyCardText> = { en, de, ar, bg, ca, cs, da, el, es, et, eu, fa, fi, fr, gl, he, hi, hr, hu, id, is, it, ja, ko, lt, lv, ms, nl, no, pl, pt, ro, ru, sk, sl, sr, sv, th, tr, uk, vi, zh };

/** The languages GlimStone carries the notification card in, the same as the glossary's. */
export const NOTIFY_CARD_LANGUAGES = Object.keys(TEXTS);

export { en as notifyCardTextEn } from "./notifyLocales/en.ts";

/** The card's words for a language tag such as `pt-BR`: its own, its base language's, or English. */
export function notifyCardText(lang: string): NotifyCardText {
  const tag = lang.toLowerCase();
  return TEXTS[tag] ?? TEXTS[tag.split(/[-_]/)[0]!] ?? en;
}
