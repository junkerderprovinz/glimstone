<script lang="ts" module>
  export interface BrandMarkProps {
    svg: string;
  }
</script>

<script lang="ts">
  // A vendor mark kept as its own markup, from appMarks.ts.
  let { svg }: BrandMarkProps = $props();
</script>

<span data-glim="BrandMark" class="glim-brand-svg" aria-hidden="true">{@html svg}</span>
