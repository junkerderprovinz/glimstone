<script lang="ts">
  import { Select } from "@glimstone/svelte/Select";

  const BACKENDS = [
    { value: "auto", label: "Automatic" },
    { value: "rd", label: "Real-Debrid" },
    { value: "ad", label: "AllDebrid" },
  ];

  // A pick goes to the server, which takes a moment and refuses AllDebrid.
  let shown = $state<string | null>(null);
  let busy = $state(false);
  let refused = $state(0);
  let eth = $state<string | null>("eth0");

  function pick(next: string) {
    const before = shown;
    shown = next;
    busy = true;
    setTimeout(() => {
      busy = false;
      if (next === "ad") {
        shown = before;
        refused++;
      }
    }, 900);
  }
</script>

<div style="display: grid; gap: 16px; width: 260px">
  <Select
    label="Backend"
    placeholder="Mixed"
    tip="Which service fetches the selected links"
    options={BACKENDS}
    value={shown}
    onChange={pick}
    {busy}
    shake={refused}
  />
  <Select label="Interface" options={[{ value: "eth0", label: "eth0" }]} bind:value={eth} disabled />
</div>
