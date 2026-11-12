import glossary from './terms.json' with { type: 'json' };
import { checkTables } from './check.mjs';
import { readLocales } from './read.mjs';

export { glossary };
export { checkTables, fold, matchesForbidden, matchesStems } from './check.mjs';
export { languageOf, readLocales } from './read.mjs';
export { readLocaleText } from './locales.mjs';

/**
 * checkLocales reads the locale sources under paths and returns every place
 * they break the glossary, so a test can expect an empty list.
 */
export function checkLocales(paths, { ignore = [], terms } = {}) {
  return checkTables(readLocales(paths, glossary.languages), { glossary, ignore, terms });
}
