<script setup lang="ts">
import type { InfoAboutCardProps } from "./info";
import Card from "./Card.vue";
import ReadmeButton from "./ReadmeButton.vue";

// The last card of the Info tile: who made the app, then the give row. The
// hosted payment routes come first and the wallet, which needs no account,
// last; one line per button, as on the README, so nothing moves up under the
// pointer. No reading-width cap: a reading width belongs to a whole page.
defineProps<InfoAboutCardProps>();
</script>

<template>
  <Card :title="text.title" :hue-index="hueIndex">
    <p class="glim-info-text">{{ text.body }}</p>
    <p class="glim-info-text">{{ text.coffee }}</p>
    <div class="glim-readme-btn-rows glim-about-give">
      <ReadmeButton brand="coffee" :parts="[{ name: text.coffeeButton, onClick: onCoffee }]">
        <template #art><component :is="coffeeArt" /></template>
      </ReadmeButton>
      <ReadmeButton v-if="onPaypal && text.paypalButton" brand="paypal" :parts="[{ name: text.paypalButton, onClick: onPaypal }]" mark-class="glim-paypal-mark">
        <template v-if="paypalGlyph" #mark><component :is="paypalGlyph" /></template>
      </ReadmeButton>
      <!-- The bare letterform without its disc: at button size a disc reads
           as an orange dot. -->
      <ReadmeButton v-if="onCrypto && text.cryptoButton" brand="bitcoin" :parts="[{ name: text.cryptoButton, onClick: onCrypto }]" mark-class="glim-bitcoin-mark">
        <template v-if="cryptoGlyph" #mark><component :is="cryptoGlyph" /></template>
      </ReadmeButton>
    </div>
  </Card>
</template>
