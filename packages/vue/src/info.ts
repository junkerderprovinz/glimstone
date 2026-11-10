import type { Component } from "vue";
import type { UpdateCheck, VersionRow } from "@glimstone/core";

// Spelled out rather than core's OpenUrl: the library build cannot read types from
// another package, and without a runtime type Vue calls the default opener on mount.
type OpenUrl = (url: string) => void;

export interface InfoVersionCardProps {
  text: {
    title: string;
    /** The card's "(i)", such as what a click on a number opens. */
    hint?: string;
    unreleased: (version: string) => string;
    /** "Release notes". Only drawn with `onReleaseNotes` and without the `whats-new` slot. */
    releaseNotes?: string;
  };
  /** The app first, then the design language, then every component it ships. */
  rows: VersionRow[];
  updateCheck?: UpdateCheck;
  /** Opens the app's window on the running version's release notes, for an app that marks no changes. */
  onReleaseNotes?: () => void;
  openUrl?: OpenUrl;
  hueIndex?: number;
}

export interface InfoHelpCardProps {
  text: {
    title?: string;
    hint?: string;
    report: string;
    repoButton: string;
    mailButton: string;
    mailSubject: string;
    bugReport?: string;
    bugReportSub?: string;
    manual?: string;
    manualSub?: string;
  };
  repoUrl: string;
  repoGlyph?: Component;
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
