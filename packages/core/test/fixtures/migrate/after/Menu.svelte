<script lang="ts">
  let { open }: { open: boolean } = $props();
</script>

<div class:bg-stone-surface2={open} class="text-stone-textSub">Menu</div>

<style>
  div {
    outline-color: var(--stone-text-muted);
  }
</style>
