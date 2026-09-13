import type { ReactNode } from "react";

// UnavailableNotice — what a card shows where a control would be, when the
// environment does not permit the thing the control would do.
//
// See "The second way in (second factor and passkey)" in the design language
// for the argument. The short version: there are three answers to a control
// that cannot act, and only one of them is this component.
//
//   - the thing it touches is unavailable        -> dim the control, it reports
//   - a decision elsewhere on the page rules it out -> leave the control out
//   - the ENVIRONMENT forbids it entirely        -> leave the control out AND
//                                                   say why. That is this file.
//
// Passkeys are the case that produced it. WebAuthn binds a credential to a
// domain name, so a browser refuses the whole exchange on a bare IP address and
// again on a certificate it does not trust - which is the DEFAULT state of a
// self-hosted app opened over its LAN address. Offering a button there means
// the browser answers with an error nobody can act on. Saying it first means
// somebody reads one sentence and either fixes their setup or stops looking.
//
// Three things this component deliberately does not do, all of them for the
// reasons in this folder's README:
//
//   - It does not translate. Every string is a prop, including the title.
//   - It does not know what a passkey is. It takes a reason and renders it.
//   - It does not take the SERVER's sentence. The caller passes UI copy in the
//     reader's own language; a server's verdict travels as a boolean. Promoting
//     a diagnostic string to be the paragraph that explains a feature is the
//     specific mistake this shape exists to prevent.
//
// Why a paragraph and not an info bubble, when rule 8 says every explanation is
// a bubble: a bubble hangs off a control, and the entire point here is that
// there is no control to hang it off. The design language names this as one of
// its few deliberate exceptions rather than letting it drift into prose.
export function UnavailableNotice({
  title,
  reason,
  action,
}: {
  /** One line saying what is unavailable. Already translated. */
  title: string;
  /**
   * Why, and ideally what would change it. Already translated. A string is the
   * common case; a node lets a caller mark up a hostname or a path inside it.
   */
  reason: ReactNode;
  /**
   * Optional. A control the caller builds - the thing somebody CAN do from
   * here, such as opening the setting that fixes the cause. Never the control
   * that was refused: offering that again is the button-that-fails this
   * component exists to remove.
   */
  action?: ReactNode;
}) {
  return (
    <div className="rounded-card bg-statusWarnBgSoft px-4 py-3">
      <p className="text-sm font-medium text-carbon-text">{title}</p>
      <p className="mt-1 text-sm text-carbon-textSub">{reason}</p>
      {action ? <div className="mt-3">{action}</div> : null}
    </div>
  );
}
