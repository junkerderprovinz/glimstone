import type { Component } from "vue";
import type { ComponentRow, ComponentsCardText, UpdateRoute, UpdateState, VersionCardText } from "@glimstone/core";

// Spelled out rather than core's OpenUrl: the library build cannot read types from
// another package, and without a runtime type Vue calls the default opener on mount.
type OpenUrl = (url: string) => void;

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
  openUrl?: OpenUrl;
  hueIndex?: number;
}

export interface InfoComponentsCardProps {
  /** `componentText(lang).componentsCard`, or the app's own words in its shape. */
  text: ComponentsCardText;
  /** The app's name, which fills "{app}" in the card's sentences. */
  name: string;
  /** The app's own parts, the programs it brings along and, for a desktop
   *  build, its installer. The card adds the design language and sorts them. */
  rows: ComponentRow[];
  /** "Update components" at the foot of the card. Omit it where the app updates none. */
  onUpdate?: () => void;
  updating?: boolean;
  openUrl?: OpenUrl;
  hueIndex?: number;
}

export interface InfoHelpCardProps {
  text: {
    title?: string;
    hint?: string;
    report: string;
    repoButton: string;
    /** Only drawn together with `discordUrl`. */
    discordButton?: string;
    mailButton: string;
    mailSubject: string;
    bugReport?: string;
    bugReportSub?: string;
    manual?: string;
    manualSub?: string;
  };
  repoUrl: string;
  repoGlyph?: Component;
  /** An invite to the app's Discord server, for an app that takes its questions there rather than by mail. */
  discordUrl?: string;
  /** `IconDiscord`, Discord's own mark. */
  discordGlyph?: Component;
  /** The workshop's own mailbox. Omit it and the card offers no mail route. */
  mailAddress?: string;
  /** The envelope, `MAIL_SVG` from appMarks.ts, which opens under the pointer. */
  mailGlyph?: Component;
  /** The app's handbook. The README is not a manual. */
  manualUrl?: string;
  manualGlyph?: Component;
  /** Downloads the instance's logs and settings as one file, without passwords, keys or credentials. */
  onBugReport?: () => void;
  bugGlyph?: Component;
  openUrl?: OpenUrl;
  hueIndex?: number;
}

export interface InfoAboutCardProps {
  text: {
    title: string;
    body: string;
    coffee: string;
    /** The coffee button's accessible name; its artwork carries the words. */
    coffeeButton: string;
    /** Only drawn together with `onPaypal`. */
    paypalButton?: string;
    /** Only drawn together with `onCrypto`. */
    cryptoButton?: string;
  };
  /** Opens the coffee window, which stays inside the app. */
  onCoffee: () => void;
  /** Buy Me a Coffee's own button artwork, `COFFEE_BUTTON_SVG` from appMarks.ts. */
  coffeeArt: Component;
  onPaypal?: () => void;
  /** Passed rather than resolved by label key, because a rule keyed on
   *  "crypto" would put a currency's symbol on unrelated settings. */
  paypalGlyph?: Component;
  onCrypto?: () => void;
  cryptoGlyph?: Component;
  hueIndex?: number;
}
