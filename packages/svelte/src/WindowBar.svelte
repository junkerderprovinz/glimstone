<script lang="ts" module>
  export interface WindowBarProps {
    /** The app's name. The bar shows none, so this is what a screen reader
     *  announces for it. */
    appName: string;
    /** Whether the window fills the screen. The middle button then restores it,
     *  and the app turns its edge resizing off. */
    maximised: boolean;
    /** The buttons' accessible names, which also show in their bubbles. */
    text: { minimise: string; maximise: string; restore: string; close: string };
    onMinimise: () => void;
    onToggleMaximise: () => void;
    /** Asks the way the native close button does, so an app that hides to the
     *  tray on close still does. */
    onClose: () => void;
    /** Called once a press on the bar starts to move. The app hands the press to
     *  the system, which moves the window from there. */
    onDragStart: () => void;
  }
</script>

<script lang="ts">
  import { IconClose, IconWindowMaximise, IconWindowMinimise, IconWindowRestore } from "./glyphs.js";
  import IconTipButton from "./IconTipButton.svelte";

  // The title bar a desktop app draws where its window has no native one
  // (design-language.md, "The desktop window frame"): a strip to drag and the
  // three window buttons, nothing else. The rail already shows the mark and the
  // name. It knows nothing of the shell that hosts the page; the app hands it
  // the window calls and whether the window is maximised.
  //
  // Render it only where the app draws its own frame. tokens.css moves the page
  // and every scrim below it as soon as it is in the document.
  let { appName, maximised, text, onMinimise, onToggleMaximise, onClose, onDragStart }: WindowBarProps = $props();

  const onButton = (e: MouseEvent) => (e.target as Element).closest("button") !== null;

  // The drag starts on the first move, not on the press, so a click and a
  // double click on the bar stay clicks. An edge the app's resize has taken
  // arrives with its default prevented and is left to it.
  let pressed = false;
  function down(e: MouseEvent) {
    pressed = e.button === 0 && !e.defaultPrevented && !onButton(e);
  }
  function move(e: MouseEvent) {
    if (!pressed) return;
    pressed = false;
    if (e.buttons === 1) onDragStart();
  }
  function toggle(e: MouseEvent) {
    if (!onButton(e)) onToggleMaximise();
  }
</script>

<!-- Each button takes the bar's full height and shows the house square inside,
     so a pointer thrown into the corner of a maximised window still lands on close. -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<header
  data-glim="WindowBar"
  aria-label={appName}
  class="glim-window-bar"
  onmousedown={down}
  onmousemove={move}
  onmouseup={() => (pressed = false)}
  ondblclick={toggle}
>
  <IconTipButton tip={text.minimise} onclick={onMinimise} class="glim-window-button">
    <span class="glim-window-square">{@render IconWindowMinimise()}</span>
  </IconTipButton>
  <IconTipButton tip={maximised ? text.restore : text.maximise} onclick={onToggleMaximise} class="glim-window-button">
    <span class="glim-window-square">{#if maximised}{@render IconWindowRestore()}{:else}{@render IconWindowMaximise()}{/if}</span>
  </IconTipButton>
  <IconTipButton tip={text.close} onclick={onClose} class="glim-window-button">
    <span class="glim-window-square">{@render IconClose()}</span>
  </IconTipButton>
</header>
