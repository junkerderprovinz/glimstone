// The window for PayPal: how often and how much in the house's own controls,
// then PayPal's two buttons. The PayPal button opens PayPal's login popup; the
// card button opens a card form inside this window, for somebody without a
// PayPal account.
//
// PayPal draws its buttons itself and allows no more than a colour, a radius
// and a height, so the window keeps them apart from the house controls above
// them. Like the other give windows it holds no state: the app owns the
// selection, Escape and the portal, and passes its own horizontal selector in.
import { Show, type JSX } from "solid-js";
import type { GiveFrequency } from "@glimstone/core";
import { Badge } from "./Badge.tsx";
import { Button } from "./Button.tsx";

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
  onFrequency: (frequency: GiveFrequency) => void;
  /** The preset amounts, as whole numbers in the currency. */
  amounts: string[];
  currencySymbol: string;
  /** The picked preset, or null while the free amount is in use. */
  preset: string | null;
  onPreset: (amount: string) => void;
  typed: string;
  /** Whether `typed` parses as an amount PayPal accepts. */
  typedValid: boolean;
  onTyped: (text: string) => void;
  /** The app's own horizontal selector. */
  renderSelector: (props: PaypalSelectorProps) => JSX.Element;
  /** From usePaypalButtons. */
  buttonsRef: (el: HTMLDivElement) => void;
  status: "idle" | "done" | "failed";
  onClose: () => void;
  /** The window's own card, for the app's Escape handling and focus trap. */
  ref?: HTMLDivElement | ((el: HTMLDivElement) => void);
}

const FREQUENCIES: GiveFrequency[] = ["once", "month", "year"];

export function PaypalDialog(props: PaypalDialogProps) {
  return (
    <div
      class="glim-modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) props.onClose();
      }}
    >
      <div
        data-glim="PaypalDialog"
        data-glim-title={props.text.title}
        ref={props.ref}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="paypal-window-title"
        class="glim-modal-card glim-modal-card--wide"
      >
        <div class="glim-modal-head">
          <h2 id="paypal-window-title" class="glim-modal-title">
            <Badge tone="heading" size="heading" wrap>
              {props.text.title}
            </Badge>
          </h2>
        </div>

        <div class="glim-give-body glim-give-body--scroll">
          <p class="glim-give-appeal">{props.text.appeal}</p>
          <p class="glim-give-intro">{props.text.intro}</p>

          <div class="glim-give-group">
            <span id="paypal-frequency" class="glim-eyebrow">
              {props.text.frequencyLabel}
            </span>
            {props.renderSelector({
              labelledBy: "paypal-frequency",
              get options() {
                return FREQUENCIES.map((f) => ({ value: f, label: props.text.frequencies[f] }));
              },
              get value() {
                return props.frequency;
              },
              onChange: (v) => props.onFrequency(v as GiveFrequency),
            })}
          </div>

          <div class="glim-give-group">
            <span id="paypal-amount" class="glim-eyebrow">
              {props.text.amountLabel}
            </span>
            {/* The presets keep the window's width, and the free amount stands
                at the end of the row under them. A valid entry takes the
                selection away from the presets. */}
            <div class="glim-give-amounts">
              <div>
                {props.renderSelector({
                  labelledBy: "paypal-amount",
                  get options() {
                    return props.amounts.map((a) => ({ value: a, label: `${a} ${props.currencySymbol}` }));
                  },
                  get value() {
                    return props.preset;
                  },
                  onChange: (v) => props.onPreset(v),
                })}
              </div>
              <input
                type="text"
                inputmode="decimal"
                value={props.typed}
                placeholder={props.text.otherAmount}
                aria-label={props.text.otherAmount}
                aria-invalid={props.typed !== "" && !props.typedValid}
                onInput={(e) => props.onTyped(e.currentTarget.value)}
                class={`glim-give-amount${props.typedValid ? " glim-give-amount--valid" : ""}`}
              />
            </div>
          </div>

          <div ref={props.buttonsRef} class="glim-give-wallet">
            <p class="glim-give-loading">{props.text.loading}</p>
          </div>

          <Show when={props.status === "done"}>
            <p class="glim-give-status glim-give-status--ok">{props.text.thanks}</p>
          </Show>
          <Show when={props.status === "failed"}>
            <p class="glim-give-status glim-give-status--fail">{props.text.failed}</p>
          </Show>
        </div>

        <div class="glim-give-foot">
          <Button label={props.text.closeLabel} labelKey="common.close" tone="neutral" onClick={() => props.onClose()} />
        </div>
      </div>
    </div>
  );
}
