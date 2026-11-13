<script setup lang="ts">
import { shallowRef } from "vue";
import type { GiveFrequency } from "@glimstone/core";
import Badge from "./Badge.vue";
import Button from "./Button.vue";

// The window for PayPal: how often and how much in the house's own controls,
// then PayPal's two buttons. The PayPal button opens PayPal's login popup; the
// card button opens a card form inside this window, for somebody without a
// PayPal account.
//
// PayPal draws its buttons itself and allows no more than a colour, a radius
// and a height, so the window keeps them apart from the house controls above
// them. Like the other give windows it holds no state: the app owns the
// selection, Escape and the portal, and puts its own horizontal selector in
// the `selector` slot. Frequency, preset and typed bind with v-model, and
// `card` is exposed for the Escape handling and focus trap.
defineProps<{
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
  /** The preset amounts, as whole numbers in the currency. */
  amounts: string[];
  currencySymbol: string;
  /** The picked preset, or null while the free amount is in use. */
  preset: string | null;
  typed: string;
  /** Whether `typed` parses as an amount PayPal accepts. */
  typedValid: boolean;
  /** From usePaypalButtons. */
  buttonsRef: (el: unknown) => void;
  status: "idle" | "done" | "failed";
}>();
const emit = defineEmits<{
  "update:frequency": [frequency: GiveFrequency];
  "update:preset": [amount: string];
  "update:typed": [text: string];
  close: [];
}>();
defineSlots<{
  selector(props: { labelledBy: string; options: { value: string; label: string }[]; value: string | null; onChange: (value: string) => void }): unknown;
}>();
const frequencies: GiveFrequency[] = ["once", "month", "year"];
const card = shallowRef<HTMLDivElement | null>(null);
defineExpose({ card });

const pickFrequency = (v: string) => emit("update:frequency", v as GiveFrequency);
const pickPreset = (v: string) => emit("update:preset", v);
const type = (e: Event) => emit("update:typed", (e.target as HTMLInputElement).value);
</script>

<template>
  <div class="glim-modal-backdrop" @click.self="emit('close')">
    <div
      ref="card"
      data-glim="PaypalDialog"
      :data-glim-title="text.title"
      tabindex="-1"
      role="dialog"
      aria-modal="true"
      aria-labelledby="paypal-window-title"
      class="glim-modal-card glim-modal-card--wide"
    >
      <div class="glim-modal-head">
        <h2 id="paypal-window-title" class="glim-modal-title">
          <Badge tone="heading" size="heading" wrap>{{ text.title }}</Badge>
        </h2>
      </div>

      <div class="glim-give-body glim-give-body--scroll">
        <p class="glim-give-appeal">{{ text.appeal }}</p>
        <p class="glim-give-intro">{{ text.intro }}</p>

        <div class="glim-give-group">
          <span id="paypal-frequency" class="glim-eyebrow">{{ text.frequencyLabel }}</span>
          <slot
            name="selector"
            labelled-by="paypal-frequency"
            :options="frequencies.map((f) => ({ value: f, label: text.frequencies[f] }))"
            :value="frequency"
            :on-change="pickFrequency"
          />
        </div>

        <!-- The presets keep the window's width, and the free amount stands at
             the end of the row under them. A valid entry takes the selection
             away from the presets. -->
        <div class="glim-give-group">
          <span id="paypal-amount" class="glim-eyebrow">{{ text.amountLabel }}</span>
          <div class="glim-give-amounts">
            <div>
              <slot
                name="selector"
                labelled-by="paypal-amount"
                :options="amounts.map((a) => ({ value: a, label: `${a} ${currencySymbol}` }))"
                :value="preset"
                :on-change="pickPreset"
              />
            </div>
            <input
              type="text"
              inputmode="decimal"
              :value="typed"
              :placeholder="text.otherAmount"
              :aria-label="text.otherAmount"
              :aria-invalid="typed !== '' && !typedValid"
              :class="typedValid ? 'glim-give-amount glim-give-amount--valid' : 'glim-give-amount'"
              @input="type"
            />
          </div>
        </div>

        <div :ref="buttonsRef" class="glim-give-wallet">
          <p class="glim-give-loading">{{ text.loading }}</p>
        </div>

        <p v-if="status === 'done'" class="glim-give-status glim-give-status--ok">{{ text.thanks }}</p>
        <p v-if="status === 'failed'" class="glim-give-status glim-give-status--fail">{{ text.failed }}</p>
      </div>

      <div class="glim-give-foot">
        <Button :label="text.closeLabel" label-key="common.close" tone="neutral" @click="emit('close')" />
      </div>
    </div>
  </div>
</template>
