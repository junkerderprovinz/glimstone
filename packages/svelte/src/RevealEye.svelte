<script lang="ts">
  import { MARKS } from "@glimstone/core";

  // The eye, with a stroke that draws itself through it once the secret shows.
  // The stroke cuts a gap into the eye behind it, so it reads on the filled glyph.
  let { struck }: { struck: boolean } = $props();
  const cut = $props.id();
</script>

<svg width="16" height="16" viewBox="0 0 14 14" fill="currentColor" aria-hidden="true" data-struck={struck ? "" : undefined} class="glim-mark">
  <mask id={cut} maskUnits="userSpaceOnUse" x="0" y="0" width="14" height="14">
    <rect width="14" height="14" fill="white" />
    <path d="M1.6 1.6 12.4 12.4" stroke="black" stroke-width="3.4" pathLength="1" stroke-dasharray="1" stroke-dashoffset={struck ? 0 : 1} stroke-linecap="round" fill="none" class="glim-secret-slash" />
  </mask>
  <g mask="url(#{cut})">{@html MARKS.eye.body}</g>
  <path d="M1.6 1.6 12.4 12.4" stroke="currentColor" stroke-width="1.5" pathLength="1" stroke-dasharray="1" stroke-dashoffset={struck ? 0 : 1} stroke-linecap="round" fill="none" class="glim-secret-slash" />
</svg>
