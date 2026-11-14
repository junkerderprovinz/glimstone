import { useState } from "react";
import { Pagination } from "@glimstone/react/Pagination";

export default function PaginationList() {
  const [page, setPage] = useState(1);
  return (
    <div style={{ display: "grid", gap: 12, justifyItems: "start" }}>
      <Pagination count={195} page={page} onPageChange={setPage} />
      <span className="glim-num">{`Backups ${(page - 1) * 10 + 1} to ${Math.min(page * 10, 195)} of 195`}</span>
    </div>
  );
}
