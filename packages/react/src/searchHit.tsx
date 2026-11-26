// A row's label in a list that filters as somebody types, with the part that
// matches the search set apart.

import { searchParts } from "@glimstone/core";

export function SearchHit({ label, query }: { label: string; query: string }) {
  const parts = searchParts(label, query);
  if (!parts) return <>{label}</>;
  return (
    <>
      {parts.before}
      <span className="glim-combobox-hit">{parts.hit}</span>
      {parts.after}
    </>
  );
}
