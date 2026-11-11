import type { ReactNode } from "react";

// What a card shows in place of a control when the environment forbids what the
// control would do, such as a passkey on a bare IP address or an untrusted
// certificate, where WebAuthn refuses the exchange. See "The second way in
// (second factor and passkey)" in the design language.
//
// Every string is a prop and arrives translated; a server's verdict travels as a
// boolean, never as the sentence shown here. It is a paragraph rather than an
// info bubble because there is no control to hang a bubble off.
export function UnavailableNotice({
  title,
  reason,
  action,
}: {
  /** One line saying what is unavailable. Already translated. */
  title: string;
  /**
   * Why, and ideally what would change it. Already translated. A node lets a
   * caller mark up a hostname or a path inside it.
   */
  reason: ReactNode;
  /**
   * A control for what somebody can do from here, such as opening the setting
   * that fixes the cause. Never the control that was refused.
   */
  action?: ReactNode;
}) {
  return (
    <div data-glim="UnavailableNotice" data-glim-title={title} className="glim-notice">
      <p className="glim-notice-title">{title}</p>
      <p className="glim-notice-reason">{reason}</p>
      {action ? <div className="glim-notice-action">{action}</div> : null}
    </div>
  );
}
