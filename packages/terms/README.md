# @glimstone/terms

The words an interface uses for the same thing in every language, and a check
that holds an app's translations to them. A relay stays a relay in German and
a backup is a Sicherung there, the same in every app that takes this package.

```sh
npm install --save-dev @glimstone/terms
```

## The glossary

[`terms.json`](terms.json) holds each term in all 42 languages: its singular
and plural, the gender where the language has one, the stems the check looks
for, and the variants it forbids. Each term opens with a definition.

| Term | English | German |
|---|---|---|
| `fortress` | fortress | Festung |
| `instance` | instance | Instanz |
| `member` | member | Mitglied |
| `permission` | permission | Freigabe |
| `relay` | relay | Relay, never Relais |
| `backup` | backup | Sicherung, never Backup |
| `pairing` | pairing | Kopplung |
| `phrase` | phrase | Phrase, never Festungs-Phrase |
| `job` | job | Auftrag |

A stem is the part every inflection shares: `kopi` finds the Polish "kopia
zapasowa" and "kopii zapasowej" alike. In languages that build compounds
(German, Dutch, the Nordic languages, Finnish, Estonian) a stem counts
anywhere inside a word, so "Einstellungssicherung" carries "Sicherung". In
Japanese, Chinese, Thai and Korean it counts anywhere too. Elsewhere it has to
start a word. Case and accents do not count, since inflection moves them.

A forbidden variant matches as a whole word. A star at its end lets it run on
(`relais*`), and a star at its start lets it close a compound (`*backup*`).

## The check

Two rules. When the English text of a key carries a term, its translation has
to carry that term's word. And no translation may use a forbidden variant.
Placeholders such as `{backup}`, paths such as `/relay/connect` and addresses
such as `wss://host` are not words and are left out. A translation that is
the English text unchanged is left to the app's own tests.

`permission` is held to its forbidden variants alone, because the English word
also names file and system permissions.

From the command line, in CI:

```sh
npx glimstone-terms web/src/lib/i18n.ts web/src/lib/locales
```

It reads every module, JSON and ARB file under the paths, takes the language
of each table from its constant's name (`export const de = {...}`) or from its
file name (`fr.ts`, `app_pt_BR.arb`), and prints each break with file, line,
language and key. It exits with 1 when it finds one and 2 when it cannot run,
for example without an English table.

`--terms=relay,backup` checks only those terms, so an app can take them on
one at a time. `--ignore=terms-ignore.json` names keys to leave out, as `"key"`
or `"de:key"`, where `*` stands for any run of characters:

```json
["de:dest.backupRepo", "pricing.membersOnly*"]
```

From a test, such as a Vitest file beside the app's other i18n tests:

```ts
import { checkLocales } from '@glimstone/terms';

test('the translations keep to the glossary', () => {
  expect(checkLocales(['src/lib/i18n.ts', 'src/lib/locales'], { ignore })).toEqual([]);
});
```

`glossary` hands out the terms themselves, and `checkTables`, `readLocales`
and `readLocaleText` are the steps `checkLocales` takes, for a build that
holds its texts somewhere else.

The package runs on Node 22 or later and depends on nothing.
