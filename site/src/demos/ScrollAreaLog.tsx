import { ScrollArea } from "@glimstone/react/ScrollArea";

const lines = Array.from({ length: 30 }, (_, i) => `04:${String(10 + i).padStart(2, "0")}  Copied folder ${i + 1} of 30`);

export default function ScrollAreaLog() {
  return (
    <div className="glim-well" style={{ width: "min(30rem, 100%)", padding: 0 }}>
      <ScrollArea label="Backup log" maxHeight="10rem">
        <div className="glim-num" style={{ padding: 12, display: "grid", gap: 4 }}>
          {lines.map((line) => (
            <span key={line}>{line}</span>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
