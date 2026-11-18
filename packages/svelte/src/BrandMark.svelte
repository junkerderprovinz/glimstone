<script lang="ts" module>
  export interface BrandMarkProps {
    svg: string;
    /** The drawing a lit tile shows instead. */
    hover?: string;
  }
</script>

<script lang="ts">
  // A vendor mark kept as its own markup, from appMarks.ts.
  let { svg, hover }: BrandMarkProps = $props();
</script>

{#if hover}
  <span data-glim="BrandMark" class="glim-brand-svg" aria-hidden="true"
    ><span class="glim-mark-rest">{@html svg}</span><span class="glim-mark-hover">{@html hover}</span></span
  >
{:else}
  <span data-glim="BrandMark" class="glim-brand-svg" aria-hidden="true">{@html svg}</span>
{/if}
