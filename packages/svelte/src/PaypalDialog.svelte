<script lang="ts" module>
  import type { Snippet } from "svelte";
  import type { Attachment } from "svelte/attachments";
  import type { GiveFrequency } from "@glimstone/core";

  export interface PaypalSelectorProps {
    labelledBy: string;
    options: { value: string; label: string }[];
    /** Null when no segment is picked, as while a typed amount applies. */
    value: string | null;
    onChange: (value: string) => void;
  }

  export interface PaypalDialogProps {
    text: {
      title: string;
      /** The app's appeal, the same in every giving window. */
      appeal: string;
      /** One sentence: the payment happens at PayPal, by account or by card. */
      intro: string;
      frequencyLabel: string;
      frequencies: Record<GiveFrequency, string>;
      amountLabel: string;
      /** Placeholder and accessible name of the free amount. */
      otherAmount: string;
      loading: string;
      thanks: string;
      failed: string;
      closeLabel: string;
    };
    frequency: GiveFrequency;
    onFrequency?: (frequency: GiveFrequency) => void;
    /** The preset amounts, as whole numbers in the currency. */
    amounts: string[];
    currencySymbol: string;
    /** The picked preset, or null while the free amount is in use. */
    preset: string | null;
    onPreset?: (amount: string) => void;
    typed: string;
    /** Whether `typed` parses as an amount PayPal accepts. */
    typedValid: boolean;
    onTyped?: (text: string) => void;
    /** The app's own horizontal selector. */
    renderSelector: Snippet<[PaypalSelectorProps]>;
    /** From usePaypalButtons. */
    buttonsRef: Attachment<HTMLDivElement>;
    status: "idle" | "done" | "failed";
    onClose: () => void;
    /** The window's own card, bound with `bind:ref`, for the app's Escape handling and focus trap. */
    ref?: HTMLDivElement | null;
  }
</script>

<script lang="ts">
  import Badge from "./Badge.svelte";
  import Button from "./Button.svelte";

  // The window for PayPal: how often and how much in the house's own controls,
  // then PayPal's two buttons. The PayPal button opens PayPal's login popup; the
  // card button opens a card form inside this window, for somebody without a
  // PayPal account.
  //
  // PayPal draws its buttons itself and allows no more than a colour, a radius
  // and a height, so the window keeps them apart from the house controls above
  // them. Like the other give windows it holds no state of its own: the app
  // binds the selection or follows the callbacks, owns Escape and the portal,
  // and passes its own horizontal selector in.
  let {
    text,
    frequency = $bindable(),
    onFrequency,
    amounts,
    currencySymbol,
    preset = $bindable(),
    onPreset,
    typed = $bindable(),
    typedValid,
    onTyped,
    renderSelector,
    buttonsRef,
    status,
    onClose,
    ref = $bindable(null),
  }: PaypalDialogProps = $props();

  const frequencies: GiveFrequency[] = ["once", "month", "year"];
</script>

<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
<div
  class="glim-modal-backdrop"
  onclick={(e) => {
    if (e.target === e.currentTarget) onClose();
  }}
>
  <div
    data-glim="PaypalDialog"
    data-glim-title={text.title}
    bind:this={ref}
    tabindex={-1}
    role="dialog"
    aria-modal="true"
    aria-labelledby="paypal-window-title"
    class="glim-modal-card glim-modal-card--wide"
  >
    <div class="glim-modal-head">
      <h2 id="paypal-window-title" class="glim-modal-title">
        <Badge tone="heading" size="heading" wrap>{text.title}</Badge>
      </h2>
    </div>

    <div class="glim-give-body glim-give-body--scroll">
      <p class="glim-give-appeal">{text.appeal}</p>
      <p class="glim-give-intro">{text.intro}</p>

      <div class="glim-give-group">
        <span id="paypal-frequency" class="glim-eyebrow">{text.frequencyLabel}</span>
        {@render renderSelector({
          labelledBy: "paypal-frequency",
          options: frequencies.map((f) => ({ value: f, label: text.frequencies[f] })),
          value: frequency,
          onChange: (v) => {
            frequency = v as GiveFrequency;
            onFrequency?.(frequency);
          },
        })}
      </div>

      <div class="glim-give-group">
        <span id="paypal-amount" class="glim-eyebrow">{text.amountLabel}</span>
        <!-- The presets keep the window's width, and the free amount stands at
             the end of the row under them. A valid entry takes the selection
             away from the presets. -->
        <div class="glim-give-amounts">
          <div>
            {@render renderSelector({
              labelledBy: "paypal-amount",
              options: amounts.map((a) => ({ value: a, label: `${a} ${currencySymbol}` })),
              value: preset,
              onChange: (v) => {
                preset = v;
                onPreset?.(v);
              },
            })}
          </div>
          <input
            type="text"
            inputmode="decimal"
            value={typed}
            placeholder={text.otherAmount}
            aria-label={text.otherAmount}
            aria-invalid={typed !== "" && !typedValid}
            oninput={(e) => {
              typed = e.currentTarget.value;
              onTyped?.(typed);
            }}
            class={`glim-give-amount${typedValid ? " glim-give-amount--valid" : ""}`}
          />
        </div>
      </div>

      <div {@attach buttonsRef} class="glim-give-wallet">
        <p class="glim-give-loading">{text.loading}</p>
      </div>

      {#if status === "done"}<p class="glim-give-status glim-give-status--ok">{text.thanks}</p>{/if}
      {#if status === "failed"}<p class="glim-give-status glim-give-status--fail">{text.failed}</p>{/if}
    </div>

    <div class="glim-give-foot">
      <Button label={text.closeLabel} labelKey="common.close" tone="neutral" onClick={onClose} />
    </div>
  </div>
</div>
