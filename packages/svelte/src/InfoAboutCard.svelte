<script lang="ts" module>
  import type { Snippet } from "svelte";

  export interface InfoAboutCardProps {
    text: {
      title: string;
      body: string;
      coffee: string;
      /** The coffee button's accessible name; its artwork carries the words. */
      coffeeButton: string;
      /** The second give button. Only drawn together with `onPaypal`. */
      paypalButton?: string;
      /** The third. Only drawn together with `onCrypto`. */
      cryptoButton?: string;
    };
    /** Opens the coffee window (CoffeeDialog), which stays inside the app. */
    onCoffee: () => void;
    /** Buy Me a Coffee's own button artwork, `COFFEE_BUTTON_SVG` from appMarks.ts. */
    coffeeArt: Snippet;
    /** Opens the PayPal window (PaypalDialog). Omit it where the maker takes no
     *  PayPal donations. */
    onPaypal?: () => void;
    /**
     * The marks on the other give buttons. They are passed rather than resolved
     * by label key, because a rule keyed on "crypto" would put a currency's
     * symbol on settings that have nothing to do with it.
     */
    paypalGlyph?: Snippet;
    /** Opens the crypto window (CryptoDonateDialog). Omit it and the card offers
     *  no crypto button. */
    onCrypto?: () => void;
    cryptoGlyph?: Snippet;
    hueIndex?: number;
  }
</script>

<script lang="ts">
  import Card from "./Card.svelte";
  import ReadmeButton from "./ReadmeButton.svelte";

  // The last card of the Info tile: who made the app, then the give row.
  let { text, onCoffee, coffeeArt, onPaypal, paypalGlyph, onCrypto, cryptoGlyph, hueIndex }: InfoAboutCardProps = $props();
</script>

<Card data-glim="InfoAboutCard" title={text.title} {hueIndex}>
  <!-- No reading-width cap: a reading width belongs to a whole page, and a
       cap on this card alone reads as hand-set line breaks. -->
  <p class="glim-info-text">{text.body}</p>

  <p class="glim-info-text">{text.coffee}</p>
  <!-- The hosted payment routes first and the wallet, which needs no account,
       last. One line per button, as on the README, so nothing moves up under
       the pointer. -->
  <div class="glim-readme-btn-rows glim-about-give">
    <ReadmeButton brand="coffee" parts={[{ name: text.coffeeButton, onClick: onCoffee }]} art={coffeeArt} />
    {#if onPaypal && text.paypalButton}
      <ReadmeButton brand="paypal" parts={[{ name: text.paypalButton, onClick: onPaypal }]} mark={paypalGlyph} markClass="glim-paypal-mark" />
    {/if}
    <!-- The bare letterform without its disc: at button size a disc reads as
         an orange dot. The coin tiles in the donation window keep it. -->
    {#if onCrypto && text.cryptoButton}
      <ReadmeButton brand="bitcoin" parts={[{ name: text.cryptoButton, onClick: onCrypto }]} mark={cryptoGlyph} markClass="glim-bitcoin-mark" />
    {/if}
  </div>
</Card>
