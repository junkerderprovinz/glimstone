import { createEffect, createMemo, createSignal, on, onCleanup } from "solid-js";
import { donationHandlers, loadPaypal, type GiveFrequency, type PaypalConfig } from "@glimstone/core";

export interface PaypalButtonsOptions {
  config: PaypalConfig;
  frequency: GiveFrequency;
  /** The amount to charge, or null while the typed amount is not valid. */
  amount: string | null;
  description: string;
  onDone: () => void;
  onError: () => void;
}

/**
 * Renders PayPal's two buttons into the element the returned ref lands on, and
 * again whenever the frequency changes, since a subscription needs the other
 * SDK namespace. The amount is read at click time, so picking another amount
 * reloads nothing. Hand the ref to PaypalDialog as `buttonsRef`.
 */
export function usePaypalButtons(options: () => PaypalButtonsOptions): (el: HTMLDivElement) => void {
  const [box, setBox] = createSignal<HTMLDivElement>();
  // Each its own memo, so a new amount, which the caller's options also hold, reruns nothing.
  const config = createMemo(() => options().config);
  const frequency = createMemo(() => options().frequency);
  const description = createMemo(() => options().description);

  createEffect(
    on([box, config, frequency, description], ([el, config, frequency, description]) => {
      if (!el) return;
      let buttons: { close(): Promise<void> } | null = null;
      let cancelled = false;

      loadPaypal(config, frequency !== "once").then(
        (paypal) => {
          if (cancelled) return;
          const instance = paypal.Buttons({
            // Blue is one of the five colours PayPal allows, and reads on both themes.
            style: { layout: "vertical", color: "blue", shape: "rect", borderRadius: 10, label: "donate", height: 40 },
            // A half-typed amount keeps the buttons from opening PayPal at all.
            onClick: (_: unknown, actions: any) => (options().amount ? actions.resolve() : actions.reject()),
            ...donationHandlers(config, frequency, () => options().amount ?? "0", description, () => options().onDone()),
            onError: () => options().onError(),
          });
          buttons = instance;
          el.replaceChildren();
          instance.render(el).catch(() => options().onError());
        },
        () => {
          if (!cancelled) options().onError();
        },
      );

      onCleanup(() => {
        cancelled = true;
        buttons?.close().catch(() => {});
      });
    }),
  );

  return (el) => void setBox(el);
}
