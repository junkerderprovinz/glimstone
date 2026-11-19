export const en = {
  'nav.relay': 'Relay',
  'backup.run': 'Run a backup',
  'jobs.title': 'Jobs',
  'auth.failed': 'Sign-in failed',
};
export type Key = keyof typeof en;
export const de: Record<Key, string> = {
  'nav.relay': 'Relais',
  'backup.run': 'Sicherung starten',
  'jobs.title': 'Aufträge',
  'auth.failed': 'Login fehlgeschlagen',
};
const STATE_KEY_MAP = { running: 'jobs.title' };
