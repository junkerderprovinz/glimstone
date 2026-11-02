import type { ReactNode } from "react";

/**
 * What a list, table or panel shows when it holds nothing: a muted, oversized
 * glyph, a title, an optional hint and an optional action. "Nothing here yet"
 * and "nothing matches the filter" take the same shape with different words,
 * so somebody is not sent looking for a filter that was never set.
 */
export function EmptyState({
  glyph,
  title,
  hint,
  action,
  nested = false,
}: {
  /** The page's own glyph, so the empty state echoes the place it is on. */
  glyph?: ReactNode;
  /** What is missing, such as "No backups yet" or "No backups match the filter". */
  title: string;
  /** One line on how to get there; anything longer goes into a bubble or a window. */
  hint?: string;
  /** A Button that gets out of the empty state, such as "Add a backup" or "Clear the filter". */
  action?: ReactNode;
  /** It stands inside a card, which already provides the surface. */
  nested?: boolean;
}) {
  return (
    <div className={nested ? "glim-empty" : "glim-card glim-empty"}>
      {glyph && (
        <span className="glim-empty-glyph" aria-hidden="true">
          {glyph}
        </span>
      )}
      <p className="glim-empty-title">{title}</p>
      {hint && <p className="glim-empty-hint">{hint}</p>}
      {action}
    </div>
  );
}
