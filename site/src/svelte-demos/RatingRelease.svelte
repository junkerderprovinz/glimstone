<script lang="ts">
  import { Rating } from "@glimstone/svelte/Rating";

  let stars = $state(3);
</script>

<div style="display: grid; gap: 12px; justify-items: start">
  <Rating label="How well did the update go?" bind:value={stars} />
  <Rating label="Average of all answers" value={3.5} allowHalf readOnly />
  <span class="glim-num">{`${stars} of 5`}</span>
</div>
