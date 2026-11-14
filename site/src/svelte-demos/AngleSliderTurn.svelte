<script lang="ts">
  import { AngleSlider } from "@glimstone/svelte/AngleSlider";

  let angle = $state(90);
</script>

<AngleSlider label="Turn the picture" bind:value={angle} />
