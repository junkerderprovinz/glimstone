const listener = (event: string) => `on${event.charAt(0).toUpperCase()}${event.slice(1)}`;

/**
 * relayDeprecated keeps the old names of renamed events working until they
 * go. `aliases` maps each new name to its old one, which the component takes
 * as a listener prop. A page that listens to an old name is told through
 * `warn`, the core's warnDeprecated, and the returned function hands every
 * new event to that listener as well.
 */
export function relayDeprecated(component: string, aliases: Record<string, string>, props: Record<string, unknown>, warn: (name: string) => void) {
  for (const old of Object.values(aliases)) {
    if (typeof props[listener(old)] === "function") warn(`${component} ${old}`);
  }
  return (event: string, ...args: unknown[]) => {
    const old = aliases[event];
    const call = old === undefined ? undefined : props[listener(old)];
    if (typeof call === "function") call(...args);
  };
}
