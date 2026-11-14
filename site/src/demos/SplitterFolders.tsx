import { useState } from "react";
import { Splitter } from "@glimstone/react/Splitter";

const panels = [
  { id: "folders", minSize: 20, lines: ["Documents", "Photos", "Music"] },
  { id: "files", minSize: 30, lines: ["holiday.jpg", "harbour.jpg", "market.jpg"] },
];

export default function SplitterFolders() {
  const [size, setSize] = useState([35, 65]);
  return (
    <div style={{ display: "grid", gap: 12, width: "min(36rem, 100%)" }}>
      <div className="glim-well" style={{ height: 160, padding: 0 }}>
        <Splitter
          panels={panels}
          size={size}
          onSizeChange={setSize}
          panel={(p) => (
            <ul style={{ margin: 0, padding: 12, listStyle: "none" }}>
              {p.lines.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          )}
        />
      </div>
      <span className="glim-num">{`Folders ${Math.round(size[0]!)} %, files ${Math.round(size[1]!)} %`}</span>
    </div>
  );
}
