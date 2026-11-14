import type { Attachment } from "svelte/attachments";
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
 * Renders PayPal's two buttons into the element the returned attachment sits
 * on, and again whenever the frequency changes, since a subscription needs the
 * other SDK namespace. The amount is read at click time, so picking another
 * amount reloads nothing. Hand the attachment to PaypalDialog as `buttonsRef`.
 */
export function usePaypalButtons(options: () => PaypalButtonsOptions): Attachment<HTMLDivElement> {
  // Each its own derived, so a new amount, which the caller's options also hold, reruns nothing.
  const config = $derived(options().config);
  const frequency = $derived(options().frequency);
  const description = $derived(options().description);

  return (box) => {
    let buttons: { close(): Promise<void> } | null = null;
    let cancelled = false;
    // Built here rather than once PayPal has loaded, so the attachment follows the description too.
    const handlers = donationHandlers(config, frequency, () => options().amount ?? "0", description, () => options().onDone());

    loadPaypal(config, frequency !== "once").then(
      (paypal) => {
        if (cancelled) return;
        const instance = paypal.Buttons({
          // Blue is one of the five colours PayPal allows, and reads on both themes.
          style: { layout: "vertical", color: "blue", shape: "rect", borderRadius: 10, label: "donate", height: 40 },
          // A half-typed amount keeps the buttons from opening PayPal at all.
          onClick: (_: unknown, actions: any) => (options().amount ? actions.resolve() : actions.reject()),
          ...handlers,
          onError: () => options().onError(),
        });
        buttons = instance;
        box.replaceChildren();
        instance.render(box).catch(() => options().onError());
      },
      () => {
        if (!cancelled) options().onError();
      },
    );

    return () => {
      cancelled = true;
      buttons?.close().catch(() => {});
    };
  };
}
