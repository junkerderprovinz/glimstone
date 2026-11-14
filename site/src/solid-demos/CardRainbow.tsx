import { For } from "solid-js";
import { Button, Card } from "@glimstone/solid";

const SECTIONS = ["Sources", "Targets", "Retention"];

export default function CardRainbow() {
  return (
    <div style={{ display: "grid", gap: "28px", width: "100%", "max-width": "420px", "padding-top": "12px" }}>
      <For each={SECTIONS}>
        {(title, i) => (
          <Card title={title} hueIndex={i()}>
            <Button label="Add" labelKey="add" tone="accent" />
          </Card>
        )}
      </For>
    </div>
  );
}
