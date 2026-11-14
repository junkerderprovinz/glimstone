import { createSignal } from "solid-js";
import { Pagination } from "@glimstone/solid/Pagination";

export default function PaginationList() {
  const [page, setPage] = createSignal(1);
  return (
    <div style={{ display: "grid", gap: "12px", "justify-items": "start" }}>
      <Pagination count={195} page={page()} onPageChange={setPage} />
      <span class="glim-num">{`Backups ${(page() - 1) * 10 + 1} to ${Math.min(page() * 10, 195)} of 195`}</span>
    </div>
  );
}
