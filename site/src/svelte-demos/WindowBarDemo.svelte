<script lang="ts">
  import { WindowBar } from "@glimstone/svelte";

  let maximised = $state(false);
  let last = $state("Nothing yet");
</script>

<div class="demo-window">
  <WindowBar
    appName="Example"
    {maximised}
    text={{ minimise: "Minimise", maximise: "Maximise", restore: "Restore", close: "Close" }}
    onMinimise={() => (last = "Minimised")}
    onToggleMaximise={() => {
      last = maximised ? "Restored" : "Maximised";
      maximised = !maximised;
    }}
    onClose={() => (last = "Closed")}
    onDragStart={() => (last = "Moving the window")}
  />
  <p class="demo-window-log" role="status">{last}</p>
</div>
