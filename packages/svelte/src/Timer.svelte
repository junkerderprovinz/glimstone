<script lang="ts" module>
  import type { TimerText } from "@glimstone/core";

  export type { TimerText } from "@glimstone/core";

  export interface TimerProps {
    /** Counts down from startMs to zero rather than up. */
    countdown?: boolean;
    /** Where it starts, in milliseconds. */
    startMs?: number;
    /** Where a count up stops, in milliseconds. */
    targetMs?: number;
    autoStart?: boolean;
    /** Called once a countdown reaches zero or a count up its target. */
    onComplete?: () => void;
    text?: Partial<TimerText>;
  }
</script>

<script lang="ts">
  import * as timer from "@zag-js/timer";
  import { normalizeProps, useMachine } from "@zag-js/svelte";
  import { TIMER_TEXT } from "@glimstone/core";
  import Button from "./Button.svelte";
  import { IconPause, IconPlay, IconResetArrow } from "./glyphs.js";

  // A clock that counts up from a start or down to zero, such as the time a
  // test may run. The figure is data and runs left to right in every language,
  // and it takes the accent's ink while it runs, the one moment it is activity.
  let { countdown = false, startMs = 0, targetMs, autoStart = false, onComplete, text }: TimerProps = $props();

  const words = $derived({ ...TIMER_TEXT, ...text });
  const id = $props.id();
  const service = useMachine(timer.machine, () => ({
    id,
    countdown,
    startMs,
    targetMs,
    autoStart,
    interval: 250,
    onComplete: () => onComplete?.(),
  }));
  const api = $derived(timer.connect(service, normalizeProps));
  const spoken = $derived(words.spoken(api.time.hours, api.time.minutes, api.time.seconds));
</script>

<div data-glim="Timer" {...api.getRootProps()} class="glim-timer">
  <div {...api.getAreaProps()} role="timer" aria-label={spoken} data-running={api.running ? "" : undefined} class="glim-timer-figure glim-num">
    <!-- One line, since a line break between the digits would read as a space. -->
    <span {...api.getItemProps({ type: "hours" })}>{api.formattedTime.hours}</span><span {...api.getSeparatorProps()}>:</span><span {...api.getItemProps({ type: "minutes" })}>{api.formattedTime.minutes}</span><span {...api.getSeparatorProps()}>:</span><span {...api.getItemProps({ type: "seconds" })}>{api.formattedTime.seconds}</span>
  </div>
  <div {...api.getControlProps()} class="glim-timer-control">
    {#if api.running}
      <Button label={words.pause} labelKey={null} glyph={IconPause} onClick={() => api.pause()} />
    {:else if api.paused}
      <Button label={words.resume} labelKey={null} glyph={IconPlay} onClick={() => api.resume()} />
    {:else}
      <Button label={words.start} labelKey={null} glyph={IconPlay} onClick={() => api.start()} />
    {/if}
    <Button label={words.reset} labelKey={null} glyph={IconResetArrow} onClick={() => api.reset()} />
  </div>
</div>
