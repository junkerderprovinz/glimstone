// The window for Buy Me a Coffee: the maker's own BMAC widget inside a house
// window, so a donor pays without leaving the app.
//
// The widget page is the one BMAC page that allows framing; the profile page
// answers X-Frame-Options: SAMEORIGIN. It keeps BMAC's look and every feature
// BMAC offers there, card and wallet payments included. Mount the window only
// while it is open, so nothing from BMAC loads before somebody asks for it.
import { Badge } from "./Badge.tsx";
import { Button } from "./Button.tsx";

export interface CoffeeDialogProps {
  /** `https://buymeacoffee.com/widget/page/<handle>` with its query. */
  widgetUrl: string;
  text: {
    title: string;
    /** The app's appeal, the same in every giving window. */
    appeal: string;
    /** One sentence: the payment happens at BMAC, and no account is needed. */
    intro: string;
    closeLabel: string;
  };
  onClose: () => void;
  /** The window's own card, for the app's Escape handling and focus trap. */
  ref?: HTMLDivElement | ((el: HTMLDivElement) => void);
}

export function CoffeeDialog(props: CoffeeDialogProps) {
  return (
    <div
      class="glim-modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) props.onClose();
      }}
    >
      {/* As tall as the screen allows less a margin: BMAC's payment step is
          about 1200px, and every pixel here is scrolling a donor is spared. */}
      <div
        data-glim="CoffeeDialog"
        data-glim-title={props.text.title}
        ref={props.ref}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="coffee-title"
        class="glim-modal-card glim-modal-card--wide glim-modal-card--tall"
      >
        <div class="glim-modal-head">
          <h2 id="coffee-title" class="glim-modal-title">
            <Badge tone="heading" size="heading" wrap>
              {props.text.title}
            </Badge>
          </h2>
        </div>

        <div class="glim-give-body">
          <p class="glim-give-appeal">{props.text.appeal}</p>
          <p class="glim-give-intro">{props.text.intro}</p>
          <div class="glim-give-frame">
            <iframe src={props.widgetUrl} title={props.text.title} allow="payment" class="glim-give-iframe" />
          </div>
        </div>

        <div class="glim-give-foot">
          <Button label={props.text.closeLabel} labelKey="common.close" tone="neutral" onClick={() => props.onClose()} />
        </div>
      </div>
    </div>
  );
}
