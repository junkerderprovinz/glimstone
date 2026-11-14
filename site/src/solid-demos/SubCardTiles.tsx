import { createSignal } from "solid-js";
import { Card, Selector, SubCard } from "@glimstone/solid";

const PAGES = [
  { id: "all", label: "All pages" },
  { id: "current", label: "This page" },
  { id: "picked", label: "Picked pages" },
];

export default function SubCardTiles() {
  const [pages, setPages] = createSignal("all");
  return (
    <div style={{ width: "100%", "max-width": "440px", "padding-top": "12px" }}>
      <Card title="Export">
        <SubCard title="Pages">
          <Selector label="Pages" orientation="vertical" items={PAGES} value={pages()} onChange={setPages} />
        </SubCard>
      </Card>
    </div>
  );
}
