import { createSignal } from "solid-js";
import { WindowBar } from "@glimstone/solid";

export default function WindowBarDemo() {
  const [maximised, setMaximised] = createSignal(false);
  const [last, setLast] = createSignal("Nothing yet");
  return (
    <div class="demo-window">
      <WindowBar
        appName="Example"
        maximised={maximised()}
        text={{ minimise: "Minimise", maximise: "Maximise", restore: "Restore", close: "Close" }}
        onMinimise={() => setLast("Minimised")}
        onToggleMaximise={() => {
          setLast(maximised() ? "Restored" : "Maximised");
          setMaximised(!maximised());
        }}
        onClose={() => setLast("Closed")}
        onDragStart={() => setLast("Moving the window")}
      />
      <p class="demo-window-log" role="status">
        {last()}
      </p>
    </div>
  );
}
