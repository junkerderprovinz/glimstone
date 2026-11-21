import { createMemo, For, mergeProps, Show, splitProps, type JSX } from "solid-js";
import {
  autoSwitch,
  canCheck,
  componentRows,
  designRow,
  mailHref,
  numberLink,
  offersDiscord,
  offersMail,
  openInBrowser,
  updateAction,
  updateLine,
  versionLink,
  warnDeprecated,
  whatsNewLabel,
  withApp,
  type ComponentRow,
  type ComponentsCardText,
  type OpenUrl,
  type UpdateRoute,
  type UpdateState,
  type VersionCardText,
  type VersionRow,
} from "@glimstone/core";
import { Button } from "./Button.tsx";
import { Card } from "./Card.tsx";
import { FieldRow } from "./FieldRow.tsx";
import { ReadmeButton } from "./ReadmeButton.tsx";
import { Toggle } from "./Toggle.tsx";

// The Info tile, the last tile in Settings ("The Info tile and the About card"
// in design-language.md): the Version card with the app, where its updates
// stand and what this version brought, the Components card with everything
// else that carries a number, the Help card with the ways to report something,
// and the About card with the maker's sentence and the give row. Every string
// is passed in, and a sentence that names the app takes it from `name`.

export type { ComponentRow, ComponentsCardText, UpdateCheck, UpdateRoute, UpdateState, VersionCardText, VersionRow } from "@glimstone/core";

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
  /** `componentText(lang).versionCard`, or the app's own words in its shape. */
  text: VersionCardText;
  /** The app's name, which fills "{app}" in the card's sentences. */
  name: string;
  /** Read from the build, never typed in. */
  version: string;
  /** The repository whose newest release the number opens. */
  repoUrl?: string;
  /** How the app gets a new version, which decides the one action. */
  route: UpdateRoute;
  /** Where the updates stand. The app finds out; the card shows it. */
  state: UpdateState;
  /** "Check for updates". A store app passes none. */
  onCheck?: () => void;
  /** Fetches and installs the new version, or leads to the host's plugin page. */
  onUpdate?: () => void;
  /** Starts the downloaded version. */
  onRestart?: () => void;
  /** Where a container's update instructions live. */
  guideUrl?: string;
  /** Opens the app's window of what changed, a card per release with its notes. */
  onWhatsNew: () => void;
  /** How many marked changes are still unseen. */
  unseen?: number;
  /** The switch under the state. Left out, the card draws none. */
  autoUpdate?: boolean;
  onAutoUpdateChange?: (on: boolean) => void;
  openUrl?: OpenUrl;
  hueIndex?: number;
}

/**
 * The first card: the app's name and version, one line on where its updates
 * stand, the one action once there is something to do, and two quiet actions,
 * "What's new" and "Check for updates".
 */
export function InfoVersionCard(props: InfoVersionCardProps) {
  const merged = mergeProps({ unseen: 0, openUrl: openInBrowser }, props);
  const face = createMemo(() => updateLine(merged.state, merged.text));
  const action = createMemo(() => updateAction(merged.route, merged.state, merged.text));
  const toggle = createMemo(() => autoSwitch(merged.route, merged.text));
  const found = () => {
    const s = merged.state;
    return s.kind === "available" && merged.repoUrl ? { version: s.version, href: `${merged.repoUrl}/releases/latest` } : undefined;
  };
  const progress = () => {
    const s = merged.state;
    return s.kind === "downloading" ? s.percent : undefined;
  };
  const press = () => {
    const kind = action()?.kind;
    if (kind === "restart") merged.onRestart?.();
    else if (kind === "guide") merged.guideUrl && merged.openUrl(merged.guideUrl);
    else merged.onUpdate?.();
  };
  return (
    <Card data-glim="InfoVersionCard" title={merged.text.title} hint={withApp(merged.text.hint, merged.name)} hueIndex={merged.hueIndex}>
      <div class="glim-version-head">
        <span class="glim-version-app">{merged.name}</span>
        <VersionNumber row={{ name: merged.name, version: merged.version, repoUrl: merged.repoUrl }} unreleased={merged.text.unreleased} openUrl={merged.openUrl} />
      </div>
      <p class="glim-version-state" data-tone={face().tone} role="status">
        <span class="glim-version-line">{face().line}</span>
        <Show when={face().note}>
          <span class="glim-version-note">{face().note}</span>
        </Show>
        <Show when={found()}>
          {(f) => (
            <TextLink href={f().href} openUrl={merged.openUrl}>
              {merged.text.newIn(f().version)}
            </TextLink>
          )}
        </Show>
      </p>
      <Show when={progress() !== undefined}>
        <div class="glim-version-progress" role="progressbar" aria-label={face().line} aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress()}>
          <span style={{ width: `${progress()}%` }} />
        </div>
      </Show>
      <Show when={action()}>
        {(a) => (
          <div class="glim-version-actions">
            <Button label={a().label} labelKey={a().labelKey} tone={a().kind === "guide" ? "neutral" : "accent"} onClick={press} />
          </div>
        )}
      </Show>
      <div class="glim-version-links">
        <button type="button" class="glim-text-action" onClick={() => merged.onWhatsNew()}>
          <span class="glim-text-action-dot" data-unseen={merged.unseen > 0 ? "" : undefined} aria-hidden="true" />
          {whatsNewLabel(merged.text, merged.unseen)}
        </button>
        <Show when={merged.onCheck && merged.route !== "store"}>
          <button type="button" class="glim-text-action" disabled={!canCheck(merged.route, merged.state)} onClick={() => merged.onCheck?.()}>
            {merged.text.check}
          </button>
        </Show>
      </div>
      <Show when={toggle() && merged.autoUpdate !== undefined ? toggle() : undefined}>
        {(t) => (
          <FieldRow label={t().label} hint={withApp(t().hint, merged.name)}>
            <Toggle checked={merged.autoUpdate ?? false} onChange={(on) => merged.onAutoUpdateChange?.(on)} label={t().label} hideLabel />
          </FieldRow>
        )}
      </Show>
    </Card>
  );
}

export interface InfoComponentsCardProps {
  /** `componentText(lang).componentsCard`, or the app's own words in its shape. */
  text: ComponentsCardText;
  /** The app's name, which fills "{app}" in the card's sentences. */
  name: string;
  /** The app's own parts, the programs it brings along and, for a desktop
   *  build, its installer. The card adds the design language and sorts them. */
  rows: ComponentRow[];
  /** The switch for updating the components. Left out, the card draws none. */
  autoUpdate?: boolean;
  onAutoUpdateChange?: (on: boolean) => void;
  /** "Update components" at the foot of the card. Omit it where the app updates none. */
  onUpdate?: () => void;
  updating?: boolean;
  openUrl?: OpenUrl;
  hueIndex?: number;
}

/**
 * The second card: every version the app is made of or brings along, as plain
 * numbers in a fixed order, with a status and one action on a row that needs one.
 */
export function InfoComponentsCard(props: InfoComponentsCardProps) {
  const merged = mergeProps({ updating: false, openUrl: openInBrowser }, props);
  const rows = createMemo(() => componentRows([...merged.rows, designRow(merged.text)]));
  return (
    <Card data-glim="InfoComponentsCard" title={merged.text.title} hint={withApp(merged.text.hint, merged.name)} hueIndex={merged.hueIndex}>
      <ul class="glim-version-rows">
        <For each={rows()}>
          {(row) => (
            <li class="glim-version-row">
              <span class="glim-version-name">
                <span class="glim-version-part">{row.name}</span>
                <Show when={row.sub}>
                  <span class="glim-version-sub">{row.sub}</span>
                </Show>
              </span>
              <Show when={row.status}>
                <span class="glim-version-status" data-tone={row.tone}>
                  {row.status}
                </span>
              </Show>
              <Show when={row.action}>{(a) => <Button label={a().label} labelKey={a().labelKey} onClick={() => a().onClick()} />}</Show>
              <VersionNumber row={row} unreleased={merged.text.unreleased} openUrl={merged.openUrl} />
            </li>
          )}
        </For>
      </ul>
      <Show when={merged.autoUpdate !== undefined}>
        <FieldRow label={merged.text.auto} hint={withApp(merged.text.autoHint, merged.name)}>
          <Toggle checked={merged.autoUpdate ?? false} onChange={(on) => merged.onAutoUpdateChange?.(on)} label={merged.text.auto} hideLabel />
        </FieldRow>
      </Show>
      <Show when={merged.onUpdate}>
        <div class="glim-version-actions">
          <Button label={merged.text.update} labelKey="components.update" busy={merged.updating} onClick={() => merged.onUpdate?.()} />
        </div>
      </Show>
    </Card>
  );
}

/** A quiet action that opens a page, such as a release's notes. */
function TextLink(props: { href: string; openUrl: OpenUrl; children: JSX.Element }) {
  return (
    <a
      href={props.href}
      target="_blank"
      rel="noopener noreferrer"
      class="glim-text-action"
      onClick={(e) => {
        e.preventDefault();
        props.openUrl(props.href);
      }}
    >
      {props.children}
    </a>
  );
}

/**
 * A number that reads as plain text and opens the newest release of its
 * project. The underline comes only under the pointer.
 */
function VersionNumber(props: { row: VersionRow; unreleased: (version: string) => string; openUrl: OpenUrl }) {
  const link = createMemo(() => numberLink(props.row));
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
    /** "Discord". Only drawn together with `discordUrl`. */
    discordButton?: string;
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
  /** An invite to the app's Discord server, for an app that takes its
   *  questions there rather than by mail. */
  discordUrl?: string;
  /** `IconDiscord`, Discord's own mark. */
  discordGlyph?: JSX.Element;
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

/** The second card: a sentence inviting a report, then GitHub, Discord, Email, the manual and the bug report. */
export function InfoHelpCard(props: InfoHelpCardProps) {
  const merged = mergeProps({ openUrl: openInBrowser }, props);
  const wantsMail = () => offersMail(merged.text.report, merged.mailAddress);
  const wantsDiscord = () => offersDiscord(merged.text.report, merged.discordUrl) && Boolean(merged.text.discordButton);

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
        <Show when={wantsDiscord()}>
          <ReadmeButton
            brand="discord"
            parts={[{ name: merged.text.discordButton!, onClick: () => merged.openUrl(merged.discordUrl!) }]}
            mark={merged.discordGlyph}
            markClass="glim-discord-mark"
          />
        </Show>
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
  components: Omit<InfoComponentsCardProps, "hueIndex">;
  help: Omit<InfoHelpCardProps, "hueIndex">;
  about: Omit<InfoAboutCardProps, "hueIndex">;
  /** The Version card's rainbow position; the cards after it take the next ones. */
  hueIndex?: number;
  /** Data attributes for the tile, so a component built on it can name itself. */
  [data: `data-${string}`]: string | undefined;
}

/** The Info tile's cards in their fixed order, Version, Components, Help and About, for the page that stacks them. */
export function InfoTile(props: InfoTileProps) {
  const [own, data] = splitProps(props, ["version", "components", "help", "about", "hueIndex"]);
  const at = (offset: number) => (own.hueIndex === undefined ? undefined : own.hueIndex + offset);
  return (
    <div data-glim="InfoTile" {...data} style={{ display: "contents" }}>
      <InfoVersionCard {...own.version} hueIndex={at(0)} />
      <InfoComponentsCard {...own.components} hueIndex={at(1)} />
      <InfoHelpCard {...own.help} hueIndex={at(2)} />
      <InfoAboutCard {...own.about} hueIndex={at(3)} />
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
    discordButton?: string;
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
  discordUrl?: string;
  discordGlyph?: JSX.Element;
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
  const at = (offset: number) => (merged.hueIndex === undefined ? undefined : merged.hueIndex + offset);
  return (
    <div data-glim="AboutCard" style={{ display: "contents" }}>
      <Card title={merged.text.version} hueIndex={at(0)}>
        <ul class="glim-version-rows">
          <For each={rows()}>
            {(row) => {
              const link = versionLink(row);
              return (
                <li class="glim-version-row">
                  <span class="glim-version-name">
                    <span class="glim-version-part">{row.name}</span>
                  </span>
                  <Show
                    when={link.href}
                    fallback={<span class="glim-num glim-version-number">{link.released ? link.shown : merged.text.unreleased(link.shown)}</span>}
                  >
                    {(href) => (
                      <a href={href()} target="_blank" rel="noopener noreferrer" class="glim-num glim-version-number">
                        {link.shown}
                      </a>
                    )}
                  </Show>
                </li>
              );
            }}
          </For>
        </ul>
      </Card>
      <InfoHelpCard
        hueIndex={at(1)}
        text={{
          title: merged.text.helpTitle,
          report: merged.text.report,
          repoButton: merged.text.repoButton,
          discordButton: merged.text.discordButton,
          mailButton: merged.text.mailButton,
          mailSubject: merged.text.mailSubject,
        }}
        repoUrl={merged.repoUrl}
        repoGlyph={merged.repoGlyph}
        discordUrl={merged.discordUrl}
        discordGlyph={merged.discordGlyph}
        mailAddress={merged.mailAddress}
        mailGlyph={merged.mailGlyph}
        openUrl={merged.openUrl}
      />
      <InfoAboutCard
        hueIndex={at(2)}
        text={merged.text}
        onCoffee={merged.onCoffee}
        coffeeArt={merged.coffeeArt}
        onPaypal={merged.onPaypal}
        paypalGlyph={merged.paypalGlyph}
        onCrypto={merged.onCrypto}
        cryptoGlyph={merged.cryptoGlyph}
      />
    </div>
  );
}
