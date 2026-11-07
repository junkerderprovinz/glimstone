import { afterEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { browserAccent, browserAccentWorks, cssColourToHex, watchBrowserAccent } from '../src/browserAccent.ts';

const FIREFOX = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:146.0) Gecko/20100101 Firefox/146.0';
const SAFARI = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Safari/605.1.15';
const CHROME = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36';
const EDGE = `${CHROME} Edg/141.0.0.0`;
const HEADLESS = CHROME.replace('Chrome/', 'HeadlessChrome/');

const listeners = new Map<string, Set<() => void>>();
let resolved = 'rgb(0, 120, 212)';

function browser(userAgent: string, supports = true) {
  listeners.clear();
  const on = (type: string, fn: () => void) => {
    if (!listeners.has(type)) listeners.set(type, new Set());
    listeners.get(type)!.add(fn);
  };
  const off = (type: string, fn: () => void) => listeners.get(type)?.delete(fn);
  Object.defineProperty(globalThis, 'navigator', { value: { userAgent }, configurable: true });
  Object.assign(globalThis, {
    CSS: { supports: () => supports },
    document: {
      createElement: () => ({ style: {}, remove() {} }),
      documentElement: { append() {} },
      addEventListener: on,
      removeEventListener: off,
      visibilityState: 'visible',
    },
    getComputedStyle: () => ({ color: resolved }),
    addEventListener: on,
    removeEventListener: off,
  });
}

const fire = (type: string) => listeners.get(type)?.forEach((fn) => fn());

afterEach(() => {
  resolved = 'rgb(0, 120, 212)';
});

test('Firefox and Safari hand out the system colour', () => {
  browser(FIREFOX);
  assert.equal(browserAccentWorks(), true);
  browser(SAFARI);
  assert.equal(browserAccentWorks(), true);
});

test('Chromium browsers answer with a fixed colour, so they count as no source', () => {
  browser(CHROME);
  assert.equal(browserAccentWorks(), false);
  browser(EDGE);
  assert.equal(browserAccentWorks(), false);
  browser(HEADLESS);
  assert.equal(browserAccentWorks(), false);
  assert.equal(browserAccent(), undefined);
});

test('a browser that does not know AccentColor is no source', () => {
  browser(FIREFOX, false);
  assert.equal(browserAccentWorks(), false);
});

test('the colour comes back as a hex', () => {
  browser(FIREFOX);
  assert.equal(browserAccent(), '#0078D4');
});

test('computed colours in both spellings become a hex', () => {
  assert.equal(cssColourToHex('rgb(0, 120, 212)'), '#0078D4');
  assert.equal(cssColourToHex('rgba(255, 0, 128, 1)'), '#FF0080');
  assert.equal(cssColourToHex('rgb(0 120 212)'), '#0078D4');
  assert.equal(cssColourToHex('transparent'), undefined);
});

test('the watcher reports at once and again when the window comes back with a new colour', () => {
  browser(FIREFOX);
  const seen: (string | undefined)[] = [];
  const stop = watchBrowserAccent((hex) => seen.push(hex));
  fire('focus');
  resolved = 'rgb(232, 17, 35)';
  fire('visibilitychange');
  stop();
  resolved = 'rgb(16, 124, 16)';
  fire('focus');
  assert.deepEqual(seen, ['#0078D4', '#E81123']);
});
