<script lang="ts">
  import { Steps } from "@glimstone/svelte/Steps";

  const steps = [
    { title: "Kind", body: "Pick where the backups go: a folder, a server or a cloud." },
    { title: "Address", body: "Name the place, such as the share and the folder on it." },
    { title: "Check", body: "A first test writes a file there and reads it back." },
  ];
  let finished = $state(false);
</script>

<div style="width: min(34rem, 100%); display: grid; gap: 12px">
  <Steps items={steps} onFinish={() => (finished = true)}>
    {#snippet content(s)}{s.body}{/snippet}
  </Steps>
  <span class="glim-num">{finished ? "Storage location added" : "Not added yet"}</span>
</div>
