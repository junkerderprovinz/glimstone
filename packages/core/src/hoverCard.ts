// What a HoverCard shows under its head.

/** One figure of a HoverCard, a name and its value. */
export interface HoverCardFact {
  label: string;
  value: string;
}

/** The figures a HoverCard shows: three at most, so the card stays a glance. */
export function hoverCardFacts(facts: readonly HoverCardFact[] | undefined): readonly HoverCardFact[] {
  return facts ? facts.slice(0, 3) : [];
}
