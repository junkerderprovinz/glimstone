import { useId, type ReactNode } from "react";
import { InfoBubble } from "./InfoBubble.tsx";

/**
 * A flat, filled group inside a card under a small uppercase title. It groups
 * what belongs together without a second raised surface, and it takes the
 * place of a fold-out: what used to hide behind a click stays in view. Fields
 * and quiet buttons inside it step up one surface, so they do not vanish into
 * its fill.
 */
export function SubCard({
  title,
  hint,
  children,
}: {
  /** The group's name, set small and uppercase above it. */
  title?: string;
  /** One line on what the group does, drawn as an "(i)" beside the title. */
  hint?: string;
  children: ReactNode;
}) {
  const titleId = useId();
  return (
    <section className="glim-subcard" aria-labelledby={title ? titleId : undefined}>
      {/* The id is on the words alone, or the bubble's text would join the
          group's name. */}
      {title && (
        <h3 className="glim-subcard-title">
          <span id={titleId}>{title}</span>
          {hint && <InfoBubble tip={hint} />}
        </h3>
      )}
      {children}
    </section>
  );
}
