import { children, mergeProps, Show, type JSX } from "solid-js";

/**
 * What a list, table or panel shows when it holds nothing: a muted, oversized
 * glyph, a title, an optional hint and an optional action. "Nothing here yet"
 * and "nothing matches the filter" take the same shape with different words,
 * so somebody is not sent looking for a filter that was never set.
 */
export function EmptyState(props: {
  /** The page's own glyph, so the empty state echoes the place it is on. */
  glyph?: JSX.Element;
  /** What is missing, such as "No backups yet" or "No backups match the filter". */
  title: string;
  /** One line on how to get there; anything longer goes into a bubble or a window. */
  hint?: string;
  /** A Button that gets out of the empty state, such as "Add a backup" or "Clear the filter". */
  action?: JSX.Element;
  /** It stands inside a card, which already provides the surface. */
  nested?: boolean;
}) {
  const merged = mergeProps({ nested: false }, props);
  const glyph = children(() => merged.glyph);
  return (
    <div data-glim="EmptyState" data-glim-title={merged.title} class={merged.nested ? "glim-empty" : "glim-card glim-empty"}>
      <Show when={glyph()}>
        <span class="glim-empty-glyph" aria-hidden="true">
          {glyph()}
        </span>
      </Show>
      <p class="glim-empty-title">{merged.title}</p>
      <Show when={merged.hint}>
        <p class="glim-empty-hint">{merged.hint}</p>
      </Show>
      {merged.action}
    </div>
  );
}
