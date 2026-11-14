import { children, createMemo, createSignal, For, mergeProps, Show, splitProps, type JSX } from "solid-js";
import {
  mailHref,
  offersMail,
  openInBrowser,
  runUpdateCheck,
  updateFace,
  updateStage,
  versionLink,
  warnDeprecated,
  type OpenUrl,
  type UpdateCheck,
  type UpdateVerdict,
  type VersionRow,
} from "@glimstone/core";
import { Button } from "./Button.tsx";
import { Card } from "./Card.tsx";
import { ReadmeButton } from "./ReadmeButton.tsx";

// The Info tile, the last tile in Settings ("The Info tile and the About card"
// in design-language.md): the Version card with every version the app is made
// of and one button to its release notes and changes, the Help card with the
// ways to report something, and the About card with the maker's sentence and
// the give row. Each sentence sits directly above the buttons it asks for, and
// no card names a route no control on it can reach. Every string is passed in.

export type { UpdateCheck, VersionRow } from "@glimstone/core";

export interface InfoAboutCardProps {
  text: {
    title: string;
    body: string;
    coffee: string;
    /** The coffee button's accessible name; its artwork carries the words. */
    coffeeButton: string;
    /** The second give button. Only drawn together with `onPaypal`. */
    paypalButton?: string;
    /** The third. Only drawn together with `onCrypto`. */
    cryptoButton?: string;
  };
  /** Opens the coffee window (CoffeeDialog), which stays inside the app. */
  onCoffee: () => void;
  /** Buy Me a Coffee's own button artwork, `COFFEE_BUTTON_SVG` from appMarks.ts. */
  coffeeArt: JSX.Element;
  /** Opens the PayPal window (PaypalDialog). Omit it where the maker takes no
   *  PayPal donations. */
  onPaypal?: () => void;
  /**
   * The marks on the other give buttons. They are passed rather than resolved
   * by label key, because a rule keyed on "crypto" would put a currency's
   * symbol on settings that have nothing to do with it.
   */
  paypalGlyph?: JSX.Element;
  /** Opens the crypto window (CryptoDonateDialog). Omit it and the card offers
   *  no crypto button. */
  onCrypto?: () => void;
  cryptoGlyph?: JSX.Element;
  hueIndex?: number;
}

/** The last card of the Info tile: who made the app, then the give row. */
export function InfoAboutCard(props: InfoAboutCardProps) {
  return (
    <Card data-glim="InfoAboutCard" title={props.text.title} hueIndex={props.hueIndex}>
      {/* No reading-width cap: a reading width belongs to a whole page, and a
          cap on this card alone reads as hand-set line breaks. */}
      <p class="glim-info-text">{props.text.body}</p>

      <p class="glim-info-text">{props.text.coffee}</p>
      {/* The hosted payment routes first and the wallet, which needs no
          account, last. One line per button, as on the README, so nothing
          moves up under the pointer. */}
      <div class="glim-readme-btn-rows glim-about-give">
        <ReadmeButton brand="coffee" parts={[{ name: props.text.coffeeButton, onClick: () => props.onCoffee() }]} art={props.coffeeArt} />
        <Show when={props.onPaypal && props.text.paypalButton}>
          {(name) => (
            <ReadmeButton
              brand="paypal"
              parts={[{ name: name(), onClick: () => props.onPaypal?.() }]}
              mark={props.paypalGlyph}
              markClass="glim-paypal-mark"
            />
          )}
        </Show>
        {/* The bare letterform without its disc: at button size a disc reads
            as an orange dot. The coin tiles in the donation window keep it. */}
        <Show when={props.onCrypto && props.text.cryptoButton}>
          {(name) => (
            <ReadmeButton
              brand="bitcoin"
              parts={[{ name: name(), onClick: () => props.onCrypto?.() }]}
              mark={props.cryptoGlyph}
              markClass="glim-bitcoin-mark"
            />
          )}
        </Show>
      </div>
    </Card>
  );
}

export interface InfoVersionCardProps {
  text: {
    title: string;
    /** The card's "(i)", such as what a click on a number opens. */
    hint?: string;
    unreleased: (version: string) => string;
    /** "Release notes". Only drawn with `onReleaseNotes` and without `whatsNew`. */
    releaseNotes?: string;
  };
  /** The app first, then the design language, then every component it ships. */
  rows: VersionRow[];
  /** "Check for updates" at the bottom of the card. Omit it and the card
   *  offers no check. */
  updateCheck?: UpdateCheck;
  /** Opens the app's window on the running version's release notes, for an
   *  app that marks no changes. */
  onReleaseNotes?: () => void;
  /** The app's own "New · n" button, wearing `IconWhatsNew` with the dot in
   *  front. It takes the place of "Release notes", so the card has one button there. */
  whatsNew?: JSX.Element;
  openUrl?: OpenUrl;
  hueIndex?: number;
}

/** The first card: every version as a row, and the New or Release notes button and the update check under them. */
export function InfoVersionCard(props: InfoVersionCardProps) {
  const merged = mergeProps({ openUrl: openInBrowser }, props);
  const whatsNew = children(() => merged.whatsNew);
  const notes = () => !whatsNew() && merged.onReleaseNotes && merged.text.releaseNotes;
  return (
    <Card data-glim="InfoVersionCard" title={merged.text.title} hint={merged.text.hint} hueIndex={merged.hueIndex}>
      <ul class="glim-version-rows">
        <For each={merged.rows}>
          {(row) => (
            <li class="glim-version-row">
              <span class="glim-version-name">
                <span class="glim-version-part">{row.name}</span>
                <Show when={row.sub}>
                  <span class="glim-version-sub">{row.sub}</span>
                </Show>
              </span>
              <VersionNumber row={row} unreleased={merged.text.unreleased} openUrl={merged.openUrl} />
            </li>
          )}
        </For>
      </ul>
      <Show when={notes() || whatsNew() || merged.updateCheck}>
        <div class="glim-version-actions">
          <Show when={notes()}>{(label) => <Button label={label()} labelKey="about.releaseNotes" onClick={() => merged.onReleaseNotes?.()} />}</Show>
          {whatsNew()}
          <Show when={merged.updateCheck}>{(check) => <UpdateCheckButton {...check()} />}</Show>
        </div>
      </Show>
    </Card>
  );
}

/** The update check shows its verdict on itself, like a test button. */
function UpdateCheckButton(check: UpdateCheck) {
  const [verdict, setVerdict] = createSignal<UpdateVerdict>({ kind: "idle" });
  const [shake, setShake] = createSignal(0);
  const face = createMemo(() => updateFace(verdict(), check.text));

  return (
    <>
      {/* A new button for every failure, so the shake runs again. */}
      <Show when={shake() + 1} keyed>
        <Button
          label={face().label}
          labelKey={face().labelKey}
          tone={face().tone}
          stage={updateStage(check.text, face().label)}
          busy={verdict().kind === "busy"}
          onClick={() =>
            void runUpdateCheck(check, verdict(), (v) => {
              setVerdict(v);
              if (v.kind === "failed") setShake((n) => n + 1);
            })
          }
          class={shake() > 0 ? "glim-shake" : ""}
        />
      </Show>
      <span role="status" class="glim-sr-only">
        {face().announced}
      </span>
    </>
  );
}

/**
 * The number at a row's end, a link to its release page when it is a published
 * release. It has no underline; the ink lifts on hover.
 */
function VersionNumber(props: { row: VersionRow; unreleased: (version: string) => string; openUrl: OpenUrl }) {
  const link = createMemo(() => versionLink(props.row));
  return (
    <Show
      when={link().href}
      fallback={<span class="glim-num glim-version-number">{link().released ? link().shown : props.unreleased(link().shown)}</span>}
    >
      {(href) => (
        <a
          href={href()}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => {
            e.preventDefault();
            props.openUrl(href());
          }}
          class="glim-num glim-version-number"
        >
          {link().shown}
        </a>
      )}
    </Show>
  );
}

export interface InfoHelpCardProps {
  text: {
    title?: string;
    /** The card's "(i)", such as what the bug report holds. */
    hint?: string;
    report: string;
    repoButton: string;
    mailButton: string;
    mailSubject: string;
    /** "Bug report". Only drawn together with `onBugReport`. */
    bugReport?: string;
    /** The bug report's second line, "Download". */
    bugReportSub?: string;
    /** "Manual". Only drawn together with `manualUrl`. */
    manual?: string;
    /** The manual's second line, "Open". */
    manualSub?: string;
  };
  repoUrl: string;
  /** The mark on the repository button, passed for the same reason as the
   *  give buttons' marks. */
  repoGlyph?: JSX.Element;
  /** The workshop's own mailbox. Omit it and the card offers no mail route. */
  mailAddress?: string;
  /** The envelope, `MAIL_SVG` from appMarks.ts, which opens under the pointer. */
  mailGlyph?: JSX.Element;
  /** The app's handbook. Omit it where the app has none; the README is not a
   *  manual. */
  manualUrl?: string;
  /** The book, `MANUAL_SVG` from appMarks.ts, which opens under the pointer. */
  manualGlyph?: JSX.Element;
  /** Downloads the instance's logs and settings as one file, without
   *  passwords, keys or credentials. */
  onBugReport?: () => void;
  /** `IconDiagnostics`, the bug. */
  bugGlyph?: JSX.Element;
  openUrl?: OpenUrl;
  hueIndex?: number;
}

/** The second card: a sentence inviting a report, then GitHub, Email, the manual and the bug report. */
export function InfoHelpCard(props: InfoHelpCardProps) {
  const merged = mergeProps({ openUrl: openInBrowser }, props);
  const wantsMail = () => offersMail(merged.text.report, merged.mailAddress);

  return (
    <Card data-glim="InfoHelpCard" title={merged.text.title} hint={merged.text.hint} hueIndex={merged.hueIndex}>
      <p class="glim-info-text">{merged.text.report}</p>
      <div class="glim-readme-btn-rows">
        <ReadmeButton
          brand="github"
          parts={[{ name: merged.text.repoButton, onClick: () => merged.openUrl(merged.repoUrl) }]}
          mark={merged.repoGlyph}
          markClass="glim-github-mark"
        />
        {/* This button reaches the app's own authors rather than a third
            party, so it follows the user's accent and rainbow. */}
        <Show when={wantsMail()}>
          <ReadmeButton
            brand="house"
            parts={[
              {
                name: merged.text.mailButton,
                onClick: () => merged.openUrl(mailHref(merged.mailAddress!, merged.text.mailSubject)),
              },
            ]}
            mark={merged.mailGlyph}
            markClass="glim-house-mark"
          />
        </Show>
        {/* The README's docs button, its book and its yellow. */}
        <Show when={merged.manualUrl && merged.text.manual}>
          {(name) => (
            <ReadmeButton
              brand="docs"
              parts={[{ name: name(), sub: merged.text.manualSub, onClick: () => merged.openUrl(merged.manualUrl!) }]}
              mark={merged.manualGlyph}
              markClass="glim-docs-mark"
            />
          )}
        </Show>
        {/* The file goes with an issue on GitHub, so it lights up beside it. */}
        <Show when={merged.onBugReport && merged.text.bugReport}>
          {(name) => (
            <ReadmeButton
              brand="github"
              parts={[{ name: name(), sub: merged.text.bugReportSub, onClick: () => merged.onBugReport?.() }]}
              mark={merged.bugGlyph}
            />
          )}
        </Show>
      </div>
    </Card>
  );
}

export interface InfoTileProps {
  version: Omit<InfoVersionCardProps, "hueIndex">;
  help: Omit<InfoHelpCardProps, "hueIndex">;
  about: Omit<InfoAboutCardProps, "hueIndex">;
  /** The Version card's rainbow position; the cards after it take the next ones. */
  hueIndex?: number;
  /** Data attributes for the tile, so a component built on it can name itself. */
  [data: `data-${string}`]: string | undefined;
}

/** The Info tile's cards in their fixed order, for the page that stacks them. */
export function InfoTile(props: InfoTileProps) {
  const [own, data] = splitProps(props, ["version", "help", "about", "hueIndex"]);
  const at = (offset: number) => (own.hueIndex === undefined ? undefined : own.hueIndex + offset);
  return (
    <div data-glim="InfoTile" {...data} style={{ display: "contents" }}>
      <InfoVersionCard {...own.version} hueIndex={at(0)} />
      <InfoHelpCard {...own.help} hueIndex={at(1)} />
      <InfoAboutCard {...own.about} hueIndex={at(2)} />
    </div>
  );
}

/**
 * The 3.2.0 props of the single About card, laid out as the Info tile: the
 * About card under `text.title`, the Version card under `text.version` with the
 * app and GlimStone as its rows, and the Help card.
 *
 * @deprecated Use `InfoTile`, which adds the version rows' sub-lines, the
 * other components, "Check for updates" and the bug report.
 */
export function AboutCard(props: {
  text: {
    title: string;
    body: string;
    coffee: string;
    coffeeButton: string;
    cryptoButton?: string;
    paypalButton?: string;
    report: string;
    repoButton: string;
    mailButton: string;
    mailSubject: string;
    version: string;
    unreleased: (version: string) => string;
    /** The Help card's heading. Without it the card draws none. */
    helpTitle?: string;
  };
  version: string | null;
  glimstoneVersion: string;
  repoUrl: string;
  repoGlyph?: JSX.Element;
  glimstoneRepoUrl: string;
  onCoffee: () => void;
  coffeeArt: JSX.Element;
  cryptoGlyph?: JSX.Element;
  paypalGlyph?: JSX.Element;
  onPaypal?: () => void;
  onCrypto?: () => void;
  mailAddress?: string;
  mailGlyph?: JSX.Element;
  openUrl?: (url: string) => void;
  hueIndex?: number;
}) {
  warnDeprecated("AboutCard");
  const merged = mergeProps({ openUrl: openInBrowser }, props);
  const rows = (): VersionRow[] => [
    ...(merged.version ? [{ name: merged.text.version, version: merged.version, repoUrl: merged.repoUrl }] : []),
    { name: "GlimStone", version: merged.glimstoneVersion, repoUrl: merged.glimstoneRepoUrl },
  ];
  return (
    <InfoTile
      data-glim="AboutCard"
      hueIndex={merged.hueIndex}
      about={{
        text: merged.text,
        onCoffee: merged.onCoffee,
        coffeeArt: merged.coffeeArt,
        onPaypal: merged.onPaypal,
        paypalGlyph: merged.paypalGlyph,
        onCrypto: merged.onCrypto,
        cryptoGlyph: merged.cryptoGlyph,
      }}
      version={{ text: { title: merged.text.version, unreleased: merged.text.unreleased }, rows: rows(), openUrl: merged.openUrl }}
      help={{
        text: {
          title: merged.text.helpTitle,
          report: merged.text.report,
          repoButton: merged.text.repoButton,
          mailButton: merged.text.mailButton,
          mailSubject: merged.text.mailSubject,
        },
        repoUrl: merged.repoUrl,
        repoGlyph: merged.repoGlyph,
        mailAddress: merged.mailAddress,
        mailGlyph: merged.mailGlyph,
        openUrl: merged.openUrl,
      }}
    />
  );
}
