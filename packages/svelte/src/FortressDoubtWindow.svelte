<script lang="ts" module>
  import type { FortressApp, FortressInstance, FortressText } from "@glimstone/core";

  export interface FortressDoubtWindowProps {
    app: FortressApp;
    instance: FortressInstance;
    text: FortressText;
    /** Runs on Open anyway. The window closes either way. */
    onOpen: () => void;
    onClose: () => void;
  }
</script>

<script lang="ts">
  import { doubtView } from "@glimstone/core";
  import Window from "./Window.svelte";

  // The question before an instance with `doubt` opens: two members claim the
  // same app on the same device, so the person opens one only by the end of its
  // id. An app that draws the other apps in cards of its own shows it before
  // `onOpen`.
  let { app, instance, text, onOpen, onClose }: FortressDoubtWindowProps = $props();

  const view = $derived(doubtView(text, app, instance));
</script>

<Window
  data-glim="FortressDoubtWindow"
  title={view.title}
  text={{ cancel: text.cancel, close: text.close }}
  {onClose}
  actions={[{ label: view.open, labelKey: "open", primary: true, attrs: { "data-fortress": "open-anyway" }, onClick: onOpen }]}
>
  <div class="glim-fortress-text">
    <p>{view.body}</p>
  </div>
</Window>
