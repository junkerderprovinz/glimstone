<script lang="ts" module>
  import type { Snippet } from "svelte";

  export interface KbdProps {
    children: Snippet;
    class?: string;
  }
</script>

<script lang="ts">
  // A key or a key combination as it is written on the keys, such as "Ctrl+K".
  // The words are the app's, so a German app writes "Strg".
  let { children, class: className }: KbdProps = $props();
</script>

<kbd data-glim="Kbd" class={className ? `glim-kbd ${className}` : "glim-kbd"}>{@render children()}</kbd>
