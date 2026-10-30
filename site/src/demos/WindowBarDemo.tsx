import { useState } from "react";
import { WindowBar } from "@gs/react/WindowBar";

export default function WindowBarDemo() {
  const [maximised, setMaximised] = useState(false);
  const [last, setLast] = useState("Nothing yet");
  return (
    <div className="demo-window">
      <WindowBar
        appName="Example"
        maximised={maximised}
        text={{ minimise: "Minimise", maximise: "Maximise", restore: "Restore", close: "Close" }}
        onMinimise={() => setLast("Minimised")}
        onToggleMaximise={() => {
          setMaximised(!maximised);
          setLast(maximised ? "Restored" : "Maximised");
        }}
        onClose={() => setLast("Closed")}
        onDragStart={() => setLast("Moving the window")}
      />
      <p className="demo-window-log" role="status">
        {last}
      </p>
    </div>
  );
}
