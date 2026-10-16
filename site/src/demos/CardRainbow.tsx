import { Card } from "@gs/react/Card";
import { Button } from "@gs/react/Button";

const SECTIONS = ["Sources", "Targets", "Retention"];

export default function CardRainbow() {
  return (
    <div style={{ display: "grid", gap: 28, width: "100%", maxWidth: 420, paddingTop: 12 }}>
      {SECTIONS.map((title, i) => (
        <Card key={title} title={title} hueIndex={i}>
          <Button label="Add" labelKey="add" tone="accent" />
        </Card>
      ))}
    </div>
  );
}
