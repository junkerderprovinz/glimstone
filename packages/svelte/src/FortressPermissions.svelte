<script lang="ts" module>
  import type { Snippet } from "svelte";
  import type { FortressAnswer, FortressApp, FortressPermission, FortressText, ToastSeverity } from "@glimstone/core";

  export type { FortressPermission } from "@glimstone/core";

  export interface FortressPermissionsProps {
    text: FortressText;
    /** The app showing the card, for the filter "With {app}". */
    app: { id: string; name: string };
    /** Every app of the fortress, this one included, for the marks. */
    apps: Pick<FortressApp, "id" | "name" | "logo">[];
    permissions: FortressPermission[];
    /** Saves one switch the moment it flips. A refusal leaves it as it was and shakes it. */
    onPermission: (id: string, on: boolean) => Promise<FortressAnswer>;
    /** Puts the small confirmation of a save, or the reason it failed, into the app's toasts. */
    notify?: (message: string, severity: ToastSeverity) => void;
    hueIndex?: number;
    /** Something of the app's own under one permission's words, such as the folder it writes to. */
    extra?: Snippet<[permission: FortressPermission]>;
  }
</script>

<script lang="ts">
  import { fill, MARKS, permissionsWith, shake } from "@glimstone/core";
  import Card from "./Card.svelte";
  import MarkSvg from "./MarkSvg.svelte";
  import Selector from "./Selector.svelte";
  import Toggle from "./Toggle.svelte";

  // What one app may do at another, a switch for each, all on unless switched off.
  let { text, app, apps, permissions, onPermission, notify, hueIndex, extra }: FortressPermissionsProps = $props();

  let filter = $state<"all" | "with">("all");
  const mine = $derived(permissionsWith(permissions, app.id));
  // The filter is offered only where it leaves some permissions out.
  const narrows = $derived(mine.length < permissions.length);
  const shown = $derived(filter === "all" || !narrows ? permissions : mine);

  async function flip(p: FortressPermission) {
    const answer = await onPermission(p.id, !p.on).catch((): FortressAnswer => ({}));
    if (answer.ok) {
      notify?.(fill(p.on ? text.permissionOff : text.permissionOn, { permission: p.title }), "success");
      return;
    }
    notify?.(answer.error ?? text.failed, "fail");
    const toggle = document.querySelector<HTMLElement>(`[data-permission="${CSS.escape(p.id)}"] .glim-toggle`);
    if (toggle) shake(toggle);
  }
</script>

{#snippet logo(id: string)}
  {@const a = apps.find((x) => x.id === id)}
  {#if a?.logo}<img src={a.logo} alt="" draggable="false" />{/if}
{/snippet}

<Card data-glim="FortressPermissions" title={text.permissions} hint={text.permissionsAbout} {hueIndex}>
  {#if permissions.length === 0}
    <p class="glim-fortress-sub">{text.noPermissions}</p>
  {:else}
    {#if narrows}
      <Selector
        label={text.permissions}
        inline
        activation="manual"
        value={filter}
        onChange={(next) => (filter = next)}
        items={[
          { id: "all" as const, label: `${text.all} ${permissions.length}` },
          { id: "with" as const, label: `${fill(text.withApp, { app: app.name })} ${mine.length}` },
        ]}
      />
    {/if}
    <ul class="glim-permissions">
      {#each shown as p (p.id)}
        <li class={`glim-permission${p.on ? " glim-permission--on" : ""}`} data-permission={p.id}>
          <span class="glim-permission-pair" aria-hidden="true">
            {@render logo(p.from)}
            <MarkSvg mark={MARKS.expand} class="glim-permission-arrow" />
            <span class="glim-permission-to">{#each p.to as id (id)}{@render logo(id)}{/each}</span>
          </span>
          <span class="glim-permission-text">
            <span class="glim-permission-title">{p.title}</span>
            {#if p.detail}<span class="glim-fortress-sub">{p.detail}</span>{/if}
            {@render extra?.(p)}
          </span>
          <!-- The switch shows what the app holds, so a refused flip stays where it was. -->
          <Toggle label={p.title} hideLabel bind:checked={() => p.on, () => flip(p)} />
        </li>
      {/each}
    </ul>
  {/if}
</Card>
