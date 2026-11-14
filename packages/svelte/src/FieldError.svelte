<script lang="ts" module>
  import type { Snippet } from "svelte";

  export interface FieldErrorProps {
    id: string;
    children: Snippet;
  }
</script>

<script lang="ts">
  import { TOAST_MARKS } from "@glimstone/core";
  import MarkSvg from "./MarkSvg.svelte";

  // The line under a field whose value it cannot take, with the fault mark.
  // The fields draw it from their `error`; an app's own field draws it with
  // the id its aria-describedby names.
  let { id, children }: FieldErrorProps = $props();
</script>

<span data-glim="FieldError" {id} class="glim-field-error"><MarkSvg mark={TOAST_MARKS.fail} />{@render children()}</span>
