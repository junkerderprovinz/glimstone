<script setup lang="ts">
import { computed, shallowRef, type StyleValue } from "vue";
import { hueVars, type CryptoCoin, type CryptoNetwork } from "@glimstone/core";
import Badge from "./Badge.vue";
import Button from "./Button.vue";
import { useLabelMode } from "./engines";

// The window for giving from a crypto wallet.
//
// Every network a donor can pick carries its own address, so a chain the
// recipient cannot receive on cannot be offered: one 0x address listed under
// "Tether" beside Tron would lose the money of anyone who picked Tron. The donor
// picks the coin first and the chain second, each in its own row. The address
// sits above the picker, since it is what the window is opened for.
//
// The component holds no state and touches no `document`; the app owns the
// selection, Escape, the portal and the toast. The `qr` and `mark` slots are
// the app's because a QR code needs a library and a coin's mark is someone
// else's brand; without them the window shows the address, a copy button and
// tickers. `card` is exposed for the Escape handling and focus trap.
const props = defineProps<{
  /** The coins on offer. See the rule at the top of this file. */
  coins: CryptoCoin[];
  /** What is shown right now. The app owns this, so it can remember it. */
  coin: CryptoCoin;
  network: CryptoNetwork;
  text: {
    title: string;
    /** The app's appeal, the same in every giving window. */
    appeal: string;
    /** One sentence saying what to do: pick a currency and a network, then scan or copy. */
    intro: string;
    /** The label over the chain row ("Networks"). */
    networks: string;
    copyLabel: string;
    closeLabel: string;
  };
}>();
const emit = defineEmits<{
  /** Picking a coin lands on that coin's first network rather than keeping the
   *  previous chain, which the donor never checked against the new coin. */
  pick: [coin: CryptoCoin, network: CryptoNetwork];
  /** Copy the address and say so in a toast, in the app's own words. */
  copy: [coin: CryptoCoin, network: CryptoNetwork];
  close: [];
}>();
defineSlots<{
  /** The address as a scannable square. */
  qr?(props: { value: string }): unknown;
  /** A coin's own mark. */
  mark?(props: { coin: CryptoCoin }): unknown;
}>();

// `reactive` shows both mark and ticker here: somebody searching a grid of
// coins should not have to hover every tile to find USDT.
const mode = useLabelMode("buttons");
const showMark = computed(() => mode.value !== "text");
const showTicker = computed(() => mode.value !== "glyph");
const card = shallowRef<HTMLDivElement | null>(null);
defineExpose({ card });

function coinStyle(c: CryptoCoin, i: number): StyleValue {
  const lit = c.id !== props.coin.id && c.tile;
  return { ...hueVars(i), ...(lit ? { "--tile": c.tile!.color, "--tile-ink": c.tile!.ink } : {}) };
}
function coinClass(c: CryptoCoin) {
  const picked = c.id === props.coin.id;
  const state = picked ? "glim-active" : c.tile ? "glim-brand-tile" : "glim-give-coin--plain";
  return `glim-give-coin ${showTicker.value ? "glim-hue glim-hue-icon" : "glim-hue"} ${state}`;
}
</script>

<template>
  <div class="glim-modal-backdrop" @click.self="emit('close')">
    <div
      ref="card"
      data-glim="CryptoDonateDialog"
      :data-glim-title="text.title"
      tabindex="-1"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cryptodonate-title"
      class="glim-modal-card glim-modal-card--wide"
    >
      <!-- Rule 15: the title is a badge straddling the top edge. No corner X,
           since the footer already closes the window. -->
      <div class="glim-modal-head">
        <h2 id="cryptodonate-title" class="glim-modal-title">
          <Badge tone="heading" size="heading" wrap>{{ text.title }}</Badge>
        </h2>
      </div>

      <div class="glim-give-body glim-give-body--scroll">
        <p class="glim-give-appeal">{{ text.appeal }}</p>
        <p class="glim-give-intro">{{ text.intro }}</p>

        <div class="glim-give-well">
          <slot name="qr" :value="network.address" />
          <!-- Never shortened, since an address is checked by eye before
               sending. `dir="ltr"` keeps it left-to-right in a right-to-left
               interface. -->
          <p dir="ltr" class="glim-give-address">{{ network.address }}</p>
          <!-- The chain row sits directly under the address it changes, and
               shows even for a coin with one chain because it also says which
               network the address belongs to. Chain names stay words in every
               label mode; each chain owns a rainbow position. -->
          <div class="glim-give-networks" role="listbox" :aria-label="text.networks">
            <button
              v-for="(n, i) in coin.networks"
              :key="n.id"
              type="button"
              role="option"
              :aria-selected="n.id === network.id"
              :style="hueVars(i)"
              :class="n.id === network.id ? 'glim-give-network glim-hue glim-active' : 'glim-give-network glim-hue'"
              @click="emit('pick', coin, n)"
            >
              {{ n.name }}
            </button>
          </div>
          <p v-if="network.note" class="glim-give-note">{{ network.note }}</p>
          <!-- Takes the coin's rainbow position, so in rainbow mode it matches
               the tile the address came from. -->
          <Button
            :label="text.copyLabel"
            label-key="common.copy"
            tone="accent"
            :hue-index="coins.findIndex((c) => c.id === coin.id)"
            @click="emit('copy', coin, network)"
          />
        </div>

        <!-- `.glim-hue-icon` tints the mark while the ticker is shown and is
             dropped in glyph mode, where only the fill of an icon-only tile
             carries colour. -->
        <div class="glim-give-coins" role="listbox" :aria-label="text.title">
          <button
            v-for="(c, i) in coins"
            :key="c.id"
            type="button"
            role="option"
            :aria-selected="c.id === coin.id"
            :aria-label="`${c.name} (${c.symbol})`"
            :title="c.name"
            :style="coinStyle(c, i)"
            :class="coinClass(c)"
            @click="emit('pick', c, c.networks[0]!)"
          >
            <slot v-if="showMark" name="mark" :coin="c" />
            <span v-if="showTicker" class="glim-give-ticker">{{ c.symbol }}</span>
          </button>
        </div>
      </div>

      <div class="glim-give-foot">
        <Button :label="text.closeLabel" label-key="common.close" tone="neutral" @click="emit('close')" />
      </div>
    </div>
  </div>
</template>
