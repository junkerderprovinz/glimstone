<script lang="ts" module>
  export interface RowMarkProps {
    on?: boolean;
    class?: string;
  }
</script>

<script lang="ts">
  import { IconCheck } from "./glyphs.js";

  // The round mark on a row picked for an action on many (rule 39). It is a
  // picture: the row says it is picked, with aria-selected.
  let { on, class: className }: RowMarkProps = $props();
</script>

<span data-glim="RowMark" class={["glim-rowmark", on && "glim-rowmark--on", className].filter(Boolean).join(" ")} aria-hidden="true">{@render IconCheck()}</span>
