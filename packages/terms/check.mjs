// Checks translation tables against the glossary. Two rules: a translation
// whose English carries a term must carry that term's word for its language,
// and no translation may use a variant the glossary forbids.

// Accents are dropped for matching, since inflection moves them (Greek stress,
// Arabic vowel marks), but the marks of Indic and Thai vowels are letters.
const ACCENTS = /[̀-ًͯ-ٰٟ֑-ׇ]/g;
const INVISIBLE = /[­​-‍ـ]/g;
const LETTER = '[\\p{L}\\p{M}\\p{N}]';
// Run twice, so {{name}} goes along with {name}.
const PLACEHOLDER = /\{[^{}]*\}/g;

export function fold(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(ACCENTS, '')
    .replace(INVISIBLE, '')
    .replace(/ي/g, 'ی')
    .replace(/ك/g, 'ک')
    .replace(/[’ʼ]/g, "'")
    .normalize('NFC');
}

const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const patterns = new Map();

// Paths and addresses such as /relay/connect or wss://host are names, not words.
const ADDRESS = /(?:[a-z][a-z0-9+.-]*:\/\/|(?<![\p{L}\p{N}])\/)\S*/giu;

function pattern(stem, startsWord, endsWord) {
  const id = `${startsWord}${endsWord}\u0000${stem}`;
  let re = patterns.get(id);
  if (!re) {
    const body = fold(stem).trim().split(/\s+/).map(escape).join('[\\s\\u00a0]+');
    re = new RegExp((startsWord ? `(?<!${LETTER})` : '') + body + (endsWord ? `(?!${LETTER})` : ''), 'u');
    patterns.set(id, re);
  }
  return re;
}

const words = (text) => fold(text.replace(PLACEHOLDER, ' ').replace(PLACEHOLDER, ' ').replace(ADDRESS, ' '));

/**
 * matchesStems tells whether text holds one of the stems. A stem matches at
 * the start of a word ("start"), anywhere in a word for languages that build
 * compounds ("inside"), or only as a whole word ("whole").
 */
export function matchesStems(text, stems, mode = 'start') {
  const folded = words(text);
  return stems.some((stem) => pattern(stem, mode !== 'inside', mode === 'whole').test(folded));
}

/**
 * matchesForbidden tells whether text uses a forbidden word. The word is
 * matched whole, a star at its end lets it run on ("relais*") and a star at
 * its start lets it close a compound ("*backup*").
 */
export function matchesForbidden(text, word) {
  const open = word.startsWith('*');
  const runs = word.endsWith('*');
  return pattern(word.replace(/^\*|\*$/g, ''), !open, !runs).test(words(text));
}

function ignoreRules(ignore, languages) {
  return ignore.map((rule) => {
    const at = rule.indexOf(':');
    const lang = at > 0 && rule.slice(0, at) in languages ? rule.slice(0, at) : null;
    const key = lang ? rule.slice(at + 1) : rule;
    const re = new RegExp('^' + key.split('*').map(escape).join('.*') + '$');
    return (l, k) => (lang === null || lang === l) && re.test(k);
  });
}

/**
 * checkTables returns every place a translation breaks the glossary. tables
 * maps a language code to its entries, each key to { value, file, line }, and
 * must hold the English table under "en".
 */
export function checkTables(tables, { glossary, ignore = [], terms } = {}) {
  const english = tables.en;
  if (!english) throw new Error('the English table is missing');
  const { languages } = glossary;
  const rules = ignoreRules(ignore, languages);
  const chosen = Object.entries(glossary.terms).filter(([id]) => !terms || terms.includes(id));
  const found = [];
  for (const [lang, table] of Object.entries(tables)) {
    if (!(lang in languages)) continue;
    const mode = languages[lang].stems ?? 'start';
    for (const [key, { value, file, line }] of Object.entries(table)) {
      if (rules.some((skip) => skip(lang, key))) continue;
      const source = english[key]?.value;
      for (const [id, term] of chosen) {
        const entry = term[lang];
        if (!entry) continue;
        const at = entry.stemsAt ?? mode;
        const where = { lang, key, term: id, file, line };
        const used = (entry.forbidden ?? []).filter((word) => matchesForbidden(value, word));
        for (const word of used) found.push({ ...where, kind: 'forbidden', word, text: value });
        if (used.length || lang === 'en' || term.enforce === false || !entry.stems) continue;
        if (source === undefined || source.trim() === value.trim()) continue;
        if (matchesStems(source, term.en.stems, languages.en.stems ?? 'whole') && !matchesStems(value, entry.stems, at)) {
          found.push({ ...where, kind: 'missing', text: value });
        }
      }
    }
  }
  return found;
}
