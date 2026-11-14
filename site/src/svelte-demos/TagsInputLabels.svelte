<script lang="ts">
  import { TagsInput } from "@glimstone/svelte/TagsInput";

  let labels = $state(["photos", "weekly"]);
</script>

<div style="width: min(26rem, 100%); display: grid; gap: 12px">
  <TagsInput label="Labels" bind:value={labels} placeholder="Add a label" />
  <span class="glim-num">{labels.length === 1 ? "1 label" : `${labels.length} labels`}</span>
</div>
