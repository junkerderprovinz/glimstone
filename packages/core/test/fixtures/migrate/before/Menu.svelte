<script lang="ts">
  let { open }: { open: boolean } = $props();
</script>

<div class:bg-carbon-surface2={open} class="text-carbon-textSub">Menu</div>

<style>
  div {
    outline-color: var(--carbon-text-muted);
  }
</style>
