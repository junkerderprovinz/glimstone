<script lang="ts" module>
  import type { InfoAboutCardProps } from "./InfoAboutCard.svelte";
  import type { InfoHelpCardProps } from "./InfoHelpCard.svelte";
  import type { InfoVersionCardProps } from "./InfoVersionCard.svelte";

  export interface InfoTileProps {
    version: Omit<InfoVersionCardProps, "hueIndex">;
    help: Omit<InfoHelpCardProps, "hueIndex">;
    about: Omit<InfoAboutCardProps, "hueIndex">;
    /** The Version card's rainbow position; the cards after it take the next ones. */
    hueIndex?: number;
    /** Data attributes for the tile, so a component built on it can name itself. */
    [data: `data-${string}`]: string | undefined;
  }
</script>

<script lang="ts">
  import InfoAboutCard from "./InfoAboutCard.svelte";
  import InfoHelpCard from "./InfoHelpCard.svelte";
  import InfoVersionCard from "./InfoVersionCard.svelte";

  // The Info tile's cards in their fixed order, for the page that stacks them.
  let { version, help, about, hueIndex, ...data }: InfoTileProps = $props();
  const at = (offset: number) => (hueIndex === undefined ? undefined : hueIndex + offset);
</script>

<div data-glim="InfoTile" {...data} style="display: contents">
  <InfoVersionCard {...version} hueIndex={at(0)} />
  <InfoHelpCard {...help} hueIndex={at(1)} />
  <InfoAboutCard {...about} hueIndex={at(2)} />
</div>
