<script lang="ts">
  import { TOAST_MARKS, whenFieldErrorClosed } from "@glimstone/core";
  import MarkSvg from "./MarkSvg.svelte";

  // The error line the fields draw under themselves. Once the value is fixed
  // it stays a moment with data-closing, so the stylesheet can close it as
  // softly as it opened instead of the form jumping.
  let { id, error }: { id: string | undefined; error: string | undefined } = $props();

  const current = $derived(id && error ? { id, error } : null);
  // The last error, kept while its line closes.
  let kept = $state<{ id: string; error: string } | null>(null);
  $effect(() => {
    if (current) kept = current;
  });
  const shown = $derived(current ?? kept);
  const closing = $derived(!current && kept !== null);
  let line = $state<HTMLSpanElement | null>(null);
  $effect(() => {
    if (closing && line) return whenFieldErrorClosed(line, () => (kept = null));
  });
</script>

{#if shown}<span bind:this={line} data-glim="FieldError" id={closing ? undefined : shown.id} data-closing={closing ? "" : undefined} class="glim-field-error"><MarkSvg mark={TOAST_MARKS.fail} />{shown.error}</span>{/if}
