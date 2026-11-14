<script lang="ts">
  import type { Mark } from "@glimstone/core";
  import { markSvg } from "./glyphs.js";

  // A mark from the core, drawn in the current colour.
  let { mark, class: className }: { mark: Mark; class?: string } = $props();
</script>

{@html markSvg(mark, className)}
