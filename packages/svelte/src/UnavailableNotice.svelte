<script lang="ts" module>
  import type { Snippet } from "svelte";

  export interface UnavailableNoticeProps {
    /** One line saying what is unavailable. Already translated. */
    title: string;
    /**
     * Why, and ideally what would change it. Already translated. A snippet lets
     * a caller mark up a hostname or a path inside it.
     */
    reason: string | Snippet;
    /**
     * A control for what somebody can do from here, such as opening the setting
     * that fixes the cause. Never the control that was refused.
     */
    action?: Snippet;
  }
</script>

<script lang="ts">
  // What a card shows in place of a control when the environment forbids what the
  // control would do, such as a passkey on a bare IP address or an untrusted
  // certificate, where WebAuthn refuses the exchange. See "The second way in
  // (second factor and passkey)" in the design language.
  //
  // Every string is a prop and arrives translated; a server's verdict travels as a
  // boolean, never as the sentence shown here. It is a paragraph rather than an
  // info bubble because there is no control to hang a bubble off.
  let { title, reason, action }: UnavailableNoticeProps = $props();
</script>

<div data-glim="UnavailableNotice" data-glim-title={title} class="glim-notice">
  <p class="glim-notice-title">{title}</p>
  <p class="glim-notice-reason">{#if typeof reason === "string"}{reason}{:else}{@render reason()}{/if}</p>
  {#if action}<div class="glim-notice-action">{@render action()}</div>{/if}
</div>
