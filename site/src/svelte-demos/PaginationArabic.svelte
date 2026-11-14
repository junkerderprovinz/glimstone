<script lang="ts">
  import { componentText } from "@glimstone/core";
  import { Pagination } from "@glimstone/svelte/Pagination";
  import { Steps } from "@glimstone/svelte/Steps";
  import { TagsInput } from "@glimstone/svelte/TagsInput";

  const ar = componentText("ar");
  const steps = [{ title: "النوع" }, { title: "العنوان" }, { title: "الفحص" }];
  let tags = $state(["صور", "أسبوعي"]);
</script>

<div dir="rtl" lang="ar" style="display: grid; gap: 20px; width: min(34rem, 100%)">
  <Pagination count={195} text={ar.pagination} />
  <TagsInput label="الوسوم" bind:value={tags} text={ar.tagsInput} />
  <Steps items={steps} text={{ ...ar.steps, finish: "حفظ" }}>
    {#snippet content(s)}{s.title}{/snippet}
  </Steps>
</div>
