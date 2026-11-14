<script lang="ts" module>
  import type { Snippet } from "svelte";
  import type { CryptoCoin, CryptoNetwork } from "@glimstone/core";

  export type { CryptoCoin, CryptoNetwork } from "@glimstone/core";

  export interface CryptoDonateDialogProps {
    /** The coins on offer. See the rule at the top of this component. */
    coins: CryptoCoin[];
    /** What is shown right now. The app owns this, so it can remember it. */
    coin: CryptoCoin;
    network: CryptoNetwork;
    /** Picking a coin lands on that coin's first network rather than keeping the
     *  previous chain, which the donor never checked against the new coin. */
    onPick: (coin: CryptoCoin, network: CryptoNetwork) => void;
    text: {
      title: string;
      /** The app's appeal, the same in every giving window. */
      appeal: string;
      /** One sentence saying what to do: pick a currency and a network, then scan
       *  or copy. */
      intro: string;
      /** The label over the chain row ("Networks"). */
      networks: string;
      copyLabel: string;
      closeLabel: string;
    };
    /** The address as a scannable square. */
    renderQr?: Snippet<[string]>;
    /** A coin's own mark. */
    renderMark?: Snippet<[CryptoCoin]>;
    /** Copy the address and say so in a toast, in the app's own words. */
    onCopy: (coin: CryptoCoin, network: CryptoNetwork) => void;
    onClose: () => void;
    /** The window's own card, bound with `bind:ref`, for the app's Escape handling and focus trap. */
    ref?: HTMLDivElement | null;
  }
</script>

<script lang="ts">
  import { hueVars } from "@glimstone/core";
  import { useLabelMode } from "./engines.svelte.js";
  import { css } from "./style.js";
  import Badge from "./Badge.svelte";
  import Button from "./Button.svelte";

  // The window for giving from a crypto wallet.
  //
  // Every network a donor can pick carries its own address, so a chain the
  // recipient cannot receive on cannot be offered: one 0x address listed under
  // "Tether" beside Tron would lose the money of anyone who picked Tron. The donor
  // picks the coin first and the chain second, each in its own row. The address
  // sits above the picker, since it is what the window is opened for.
  //
  // The component holds no state and touches no `document`; the app owns the
  // selection, Escape, the portal and the toast. `renderQr` and `renderMark` are
  // props because a QR code needs a library and a coin's mark is someone else's
  // brand; without them the window shows the address, a copy button and tickers.
  let { coins, coin, network, onPick, text, renderQr, renderMark, onCopy, onClose, ref = $bindable(null) }: CryptoDonateDialogProps = $props();

  // `reactive` shows both mark and ticker here: somebody searching a grid of
  // coins should not have to hover every tile to find USDT.
  const mode = useLabelMode("buttons");
  const showMark = $derived(mode.current !== "text");
  const showTicker = $derived(mode.current !== "glyph");
</script>

<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
<div
  class="glim-modal-backdrop"
  onclick={(e) => {
    if (e.target === e.currentTarget) onClose();
  }}
>
  <div
    data-glim="CryptoDonateDialog"
    data-glim-title={text.title}
    bind:this={ref}
    tabindex={-1}
    role="dialog"
    aria-modal="true"
    aria-labelledby="cryptodonate-title"
    class="glim-modal-card glim-modal-card--wide"
  >
    <!-- Rule 15: the title is a badge straddling the top edge. No corner X,
         since the footer already closes the window. -->
    <div class="glim-modal-head">
      <h2 id="cryptodonate-title" class="glim-modal-title">
        <Badge tone="heading" size="heading" wrap>{text.title}</Badge>
      </h2>
    </div>

    <div class="glim-give-body glim-give-body--scroll">
      <p class="glim-give-appeal">{text.appeal}</p>
      <p class="glim-give-intro">{text.intro}</p>

      <div class="glim-give-well">
        {@render renderQr?.(network.address)}
        <!-- Never shortened, since an address is checked by eye before sending.
             `dir="ltr"` keeps it left-to-right in a right-to-left interface. -->
        <p dir="ltr" class="glim-give-address">{network.address}</p>
        <!-- The chain row sits directly under the address it changes, and shows
             even for a coin with one chain because it also says which network
             the address belongs to. Chain names stay words in every label mode;
             each chain owns a rainbow position. -->
        <div class="glim-give-networks" role="listbox" aria-label={text.networks}>
          {#each coin.networks as n, i (n.id)}
            <button
              type="button"
              role="option"
              aria-selected={n.id === network.id}
              onclick={() => onPick(coin, n)}
              style={css(hueVars(i))}
              class={`glim-give-network glim-hue${n.id === network.id ? " glim-active" : ""}`}
            >
              {n.name}
            </button>
          {/each}
        </div>
        {#if network.note}<p class="glim-give-note">{network.note}</p>{/if}
        <!-- Takes the coin's rainbow position, so in rainbow mode it matches the
             tile the address came from. -->
        <Button
          label={text.copyLabel}
          labelKey="common.copy"
          tone="accent"
          hueIndex={coins.findIndex((c) => c.id === coin.id)}
          onClick={() => onCopy(coin, network)}
        />
      </div>

      <!-- `.glim-hue-icon` tints the mark while the ticker is shown and is
           dropped in glyph mode, where only the fill of an icon-only tile
           carries colour. -->
      <div class="glim-give-coins" role="listbox" aria-label={text.title}>
        {#each coins as c, i (c.id)}
          {@const picked = c.id === coin.id}
          {@const lit = !picked && c.tile}
          <button
            type="button"
            role="option"
            aria-selected={picked}
            aria-label={`${c.name} (${c.symbol})`}
            title={c.name}
            onclick={() => onPick(c, c.networks[0]!)}
            style={css({ ...hueVars(i), ...(lit && { "--tile": c.tile!.color, "--tile-ink": c.tile!.ink }) })}
            class={`glim-give-coin ${showTicker ? "glim-hue glim-hue-icon" : "glim-hue"} ${
              picked ? "glim-active" : lit ? "glim-brand-tile" : "glim-give-coin--plain"
            }`}
          >
            {#if showMark}{@render renderMark?.(c)}{/if}
            {#if showTicker}<span class="glim-give-ticker">{c.symbol}</span>{/if}
          </button>
        {/each}
      </div>
    </div>

    <div class="glim-give-foot">
      <Button label={text.closeLabel} labelKey="common.close" tone="neutral" onClick={onClose} />
    </div>
  </div>
</div>
