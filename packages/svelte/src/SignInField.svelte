<script lang="ts" module>
  import type { Snippet } from "svelte";

  export interface SignInFieldProps {
    label: string;
    htmlFor: string;
    hint?: string;
    hidden?: boolean;
    children: Snippet;
  }
</script>

<script lang="ts">
  import { labelInside } from "@glimstone/core";
  import InfoBubble from "./InfoBubble.svelte";

  // A field on the sign-in card. Its label stands inside the field until the
  // first key, and above it when the field brings a placeholder or a hint.
  let { label, htmlFor, hint, hidden, children }: SignInFieldProps = $props();

  let inside = $state(false);
  let was: string | undefined;
  $effect(() => {
    inside = labelInside(document.getElementById(htmlFor) as HTMLInputElement | null, label, hint, was);
    was = label;
  });
</script>

<div data-glim="SignInField" class="glim-signin-field" {hidden}>
  <label for={htmlFor} class={inside ? "glim-sr-only" : "glim-signin-label"}>{label}{#if hint}<InfoBubble tip={hint} />{/if}</label>
  {@render children()}
</div>
