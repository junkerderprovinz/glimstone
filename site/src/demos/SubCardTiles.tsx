import { useState } from "react";
import { Card, Selector, SubCard } from "@glimstone/react";

const PAGES = [
  { id: "all", label: "All pages" },
  { id: "current", label: "This page" },
  { id: "picked", label: "Picked pages" },
];

export default function SubCardTiles() {
  const [pages, setPages] = useState("all");
  return (
    <div style={{ width: "100%", maxWidth: 440, paddingTop: 12 }}>
      <Card title="Export">
        <SubCard title="Pages">
          <Selector label="Pages" orientation="vertical" items={PAGES} value={pages} onChange={setPages} />
        </SubCard>
      </Card>
    </div>
  );
}
