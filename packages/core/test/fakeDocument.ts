// Just enough of a browser for the engines that write to <html>: the root's
// inline custom properties and attributes, localStorage, and matchMedia with a
// preference a test can flip.

export interface FakeRoot {
  style: Map<string, string>;
  attrs: Map<string, string>;
  storage: Map<string, string>;
  setSystemDark(dark: boolean): void;
}

export function fakeDocument(storage = new Map<string, string>()): FakeRoot {
  const style = new Map<string, string>();
  const attrs = new Map<string, string>();
  const attrWatchers = new Set<() => void>();
  const mediaWatchers = new Set<() => void>();
  let systemDark = true;

  const documentElement = {
    style: {
      setProperty: (k: string, v: string) => void style.set(k, v),
      removeProperty: (k: string) => void style.delete(k),
      getPropertyValue: (k: string) => style.get(k) ?? '',
    },
    setAttribute(k: string, v: string) {
      attrs.set(k, v);
      attrWatchers.forEach((fn) => fn());
    },
    removeAttribute(k: string) {
      attrs.delete(k);
      attrWatchers.forEach((fn) => fn());
    },
    getAttribute: (k: string) => attrs.get(k) ?? null,
    hasAttribute: (k: string) => attrs.has(k),
  };

  Object.assign(globalThis, {
    document: { documentElement },
    localStorage: {
      getItem: (k: string) => storage.get(k) ?? null,
      setItem: (k: string, v: string) => void storage.set(k, v),
      removeItem: (k: string) => void storage.delete(k),
    },
    matchMedia: (query: string) => ({
      get matches() {
        return query.includes('dark') ? systemDark : !systemDark;
      },
      addEventListener: (_: string, fn: () => void) => mediaWatchers.add(fn),
      removeEventListener: (_: string, fn: () => void) => mediaWatchers.delete(fn),
    }),
    MutationObserver: class {
      #fn: () => void;
      constructor(fn: () => void) {
        this.#fn = () => fn();
      }
      observe() {
        attrWatchers.add(this.#fn);
      }
      disconnect() {
        attrWatchers.delete(this.#fn);
      }
    },
  });

  return {
    style,
    attrs,
    storage,
    setSystemDark(dark: boolean) {
      systemDark = dark;
      mediaWatchers.forEach((fn) => fn());
    },
  };
}
