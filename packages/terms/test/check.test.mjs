import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkTables, matchesStems } from '../check.mjs';

const glossary = {
  languages: {
    en: { name: 'English', stems: 'whole' },
    de: { name: 'Deutsch', stems: 'inside' },
    fr: { name: 'Français' },
    pl: { name: 'Polski' },
    el: { name: 'Ελληνικά' },
    vi: { name: 'Tiếng Việt' },
    es: { name: 'Español' },
  },
  terms: {
    backup: {
      en: { singular: 'backup', plural: 'backups', stems: ['backup', 'backups'] },
      de: { singular: 'Sicherung', plural: 'Sicherungen', stems: ['sicherung'], forbidden: ['*backup*'] },
      fr: { singular: 'sauvegarde', plural: 'sauvegardes', stems: ['sauvegard'] },
      pl: { singular: 'kopia zapasowa', plural: 'kopie zapasowe', stems: ['kopi'] },
      el: { singular: 'αντίγραφο ασφαλείας', plural: 'αντίγραφα ασφαλείας', stems: ['αντίγραφ'] },
      vi: { singular: 'bản sao lưu', plural: 'bản sao lưu', stems: ['sao lưu'] },
    },
    relay: {
      en: { singular: 'relay', plural: 'relays', stems: ['relay', 'relays'] },
      de: { singular: 'Relay', plural: 'Relays', stems: ['relay'], forbidden: ['relais*'] },
      fr: { singular: 'relais', plural: 'relais', stems: ['relais'] },
      es: { singular: 'relay', plural: 'relays', stems: ['relay'], forbidden: ['relé', 'relés'] },
    },
    permission: {
      enforce: false,
      en: { singular: 'permission', plural: 'permissions', stems: ['permission', 'permissions'] },
      de: { singular: 'Freigabe', plural: 'Freigaben', stems: ['freigab'], forbidden: ['erlaubnis'] },
    },
  },
};

const at = (lang, entries) => Object.fromEntries(Object.entries(entries).map(([key, value], i) => [key, { value, file: `${lang}.ts`, line: i + 1 }]));
const run = (tables, options) => checkTables(tables, { glossary, ...options });
const brief = (found) => found.map((v) => `${v.lang} ${v.key} ${v.term} ${v.kind}${v.word ? ' ' + v.word : ''}`);

test('flags a translation that leaves out the term its English carries', () => {
  const found = run({
    en: at('en', { a: 'Run a backup now', b: 'Open the settings' }),
    fr: at('fr', { a: 'Lancer une copie maintenant', b: 'Ouvrir les réglages' }),
  });
  assert.deepEqual(brief(found), ['fr a backup missing']);
  assert.equal(found[0].file, 'fr.ts');
  assert.equal(found[0].line, 1);
});

test('accepts any inflection that starts with a stem', () => {
  const found = run({
    en: at('en', { a: 'The backup failed', b: 'No backups yet' }),
    pl: at('pl', { a: 'Tworzenie kopii zapasowej nie powiodło się', b: 'Brak kopii zapasowych' }),
  });
  assert.deepEqual(found, []);
});

test('finds a stem inside a compound where the language compounds', () => {
  const found = run({
    en: at('en', { a: 'Settings backup' }),
    de: at('de', { a: 'Einstellungssicherung' }),
  });
  assert.deepEqual(found, []);
});

test('needs the stem at the start of a word elsewhere', () => {
  const found = run({
    en: at('en', { a: 'Settings backup' }),
    fr: at('fr', { a: 'Réglages ressauvegardés' }),
  });
  assert.deepEqual(brief(found), ['fr a backup missing']);
});

test('reads the English for whole words only', () => {
  const found = run({
    en: at('en', { a: 'Messages are relayed', b: 'Two relays' }),
    fr: at('fr', { a: 'Les messages passent', b: 'Deux serveurs' }),
  });
  assert.deepEqual(brief(found), ['fr b relay missing']);
});

test('flags a forbidden variant even where the English has no such term', () => {
  const found = run({
    en: at('en', { a: 'Status of the connection', b: 'Run a backup' }),
    de: at('de', { a: 'Status des Relais', b: 'Backup und Sicherung starten' }),
  });
  assert.deepEqual(brief(found), ['de a relay forbidden relais*', 'de b backup forbidden *backup*']);
});

test('reports a forbidden variant once, not also as a missing term', () => {
  const found = run({
    en: at('en', { a: 'Relay status' }),
    de: at('de', { a: 'Status des Relais' }),
  });
  assert.deepEqual(brief(found), ['de a relay forbidden relais*']);
});

test('reads past placeholders', () => {
  const found = run({
    en: at('en', { a: 'Image is now {now}, was {backup}', b: 'Copied to {{relay}}' }),
    de: at('de', { a: 'Image ist jetzt {now}, war {backup}', b: 'Kopiert nach {{relay}}' }),
  });
  assert.deepEqual(found, []);
});

test('matches a forbidden word whole unless a star widens it', () => {
  const found = run({
    en: at('en', { a: 'Read back {n} files', b: 'On this relay', c: 'Self-backup', d: 'Relay address' }),
    es: at('es', { a: 'Se releyeron {n} archivos', b: 'En este relé', c: 'Copia propia', d: 'Dirección del relay' }),
    de: at('de', { a: '{n} Dateien zurückgelesen', b: 'Auf diesem Relay', c: 'Selbstbackup', d: 'Relaisadresse' }),
  });
  assert.deepEqual(brief(found), ['es b relay forbidden relé', 'de c backup forbidden *backup*', 'de d relay forbidden relais*']);
});

test('reads past paths and addresses', () => {
  const found = run({
    en: at('en', { a: 'It answers at /relay/connect', b: 'Only wss://relay.example.org works' }),
    fr: at('fr', { a: 'Elle répond sur /relay/connect', b: 'Seul wss://relay.example.org marche' }),
  });
  assert.deepEqual(found, []);
});

test('ignores case and accents', () => {
  const found = run({
    en: at('en', { a: 'Backups', b: 'Backup' }),
    el: at('el', { a: 'Λίστα αντιγράφων ασφαλείας', b: 'ΑΝΤΙΓΡΑΦΟ ΑΣΦΑΛΕΙΑΣ' }),
  });
  assert.deepEqual(found, []);
});

test('matches a stem of several words', () => {
  assert.equal(matchesStems('Đã tạo bản sao lưu', ['sao lưu'], 'start'), true);
  assert.equal(matchesStems('Đã tạo bản sao chép', ['sao lưu'], 'start'), false);
});

test('leaves out what the ignore list names', () => {
  const tables = {
    en: at('en', { 'health.relay': 'Relay', 'dest.backup': 'Backup path', other: 'Backup' }),
    de: at('de', { 'health.relay': 'Relais', 'dest.backup': 'Backup-Pfad', other: 'Backup' }),
    fr: at('fr', { 'health.relay': 'Serveur', 'dest.backup': 'Chemin', other: 'Copie' }),
  };
  const found = run(tables, { ignore: ['de:health.relay', 'dest.*'] });
  assert.deepEqual(brief(found), ['de other backup forbidden *backup*', 'fr health.relay relay missing', 'fr other backup missing']);
});

test('does not ask an untranslated text for the term', () => {
  const found = run({
    en: at('en', { a: 'Backup' }),
    fr: at('fr', { a: 'Backup' }),
  });
  assert.deepEqual(found, []);
});

test('checks a term that is not enforced for its forbidden variants alone', () => {
  const found = run({
    en: at('en', { a: 'File permissions', b: 'Allowed' }),
    de: at('de', { a: 'Dateirechte', b: 'Mit Erlaubnis' }),
  });
  assert.deepEqual(brief(found), ['de b permission forbidden erlaubnis']);
});

test('limits the run to the terms it is given', () => {
  const found = run({
    en: at('en', { a: 'Relay and backup' }),
    fr: at('fr', { a: 'Serveur et copie' }),
  }, { terms: ['relay'] });
  assert.deepEqual(brief(found), ['fr a relay missing']);
});
