// The sign-in tile's flow without a framework (docs/design-language.md, "The
// sign-in tile"): its cards read the account from the kit through the client,
// every change goes there and is read back, and the windows, the drafts and
// the refusals live here, so every framework draws the same tile.

import type { Catalog, CatalogEntry } from "./catalog.ts";
import { catalogPicker } from "./catalog.ts";
import { copyText } from "./clipboard.ts";
import type { ConnectionAction, ConnectionTest } from "./connectionRow.ts";
import { fill, listOf, plural, type Plural } from "./fortressText.ts";
import type { PickGroup, PickItem, TileMark } from "./picker.ts";
import { shake } from "./selectModel.ts";
import type {
  SignInAccount,
  SignInApi,
  SignInClientError,
  SignInErrorCode,
  SignInFailure,
  SignInMe,
  SignInOffer,
  SignInPasskey,
  SignInPreset,
  SignInRedirectCode,
  SignInRoles,
  SignInService,
  SignInServiceInput,
  SignInSession,
  SignInSettings,
  SignInToken,
  SignInVia,
} from "./signInApi.ts";
import type { ToastSeverity } from "./toastEngine.ts";

export type SignInTileCard = "password" | "askPassword" | "twoFactor" | "passkeys" | "sessions" | "tokens" | "services" | "accounts";

/** Every card, in the order the tile draws them. */
export const SIGN_IN_TILE_CARDS: readonly SignInTileCard[] = ["password", "askPassword", "twoFactor", "passkeys", "sessions", "tokens", "services", "accounts"];

/** The id of the tile the app adds for a sign-in service the catalog does not know. */
export const OWN_SIGN_IN_SERVICE = "custom";

/** A code the kit or the browser answered with, in the app's words. */
export type SignInErrorText = Partial<Record<SignInErrorCode | SignInClientError, string>>;

/** The tile's words, translated by the app. `{min}`, `{name}`, `{when}`, `{count}` and the like are filled in. */
export interface SignInTileText {
  cancel: string;
  close: string;
  /** The title of the question before something goes. */
  confirm: string;
  copy: string;
  copied: string;
  back: string;
  save: string;
  remove: string;
  /** The reveal eye's name while the secret is hidden, and once it shows. */
  show: string;
  hide: string;
  /** A new password's second field and its mismatch, as `componentText(lang).passwordField` says them. */
  confirmPassword: string;
  mismatch: string;
  /** Said when the kit refuses without a code the app has words for. */
  failed: string;
  /** In place of a card's controls while the account has no password of its own. */
  needsPassword: { title: string; reason: string };
  /** In place of two-factor's and the passkeys' controls for an account that signs in through a sign-in service, `{name}`. */
  notLocal: { title: string; reason: string };
  password: {
    title: string;
    /** The (i): how long a password has to be, and that a change ends the other sessions. */
    hint: string;
    /** The (i) while the app is open. */
    openHint: string;
    /** In place of the card's controls for an account that signs in through a sign-in service, `{name}`. */
    viaService: string;
    state: string;
    set: string;
    none: string;
    change: string;
    add: string;
    current: string;
    next: string;
    save: string;
    saved: string;
    /** The toast once the first password turned sign-in on. */
    first: string;
    wrongCurrent: string;
    tooShort: string;
    remove: string;
    removeTitle: string;
    /** What the open app means, above the list of what goes with the password. */
    removeText: string;
    goes: { twoFactor: string; passkeys: Plural; services: string; tokens: Plural };
    removed: string;
  };
  askPassword: { title: string; hint: string; label: string; on: string; off: string };
  twoFactor: {
    title: string;
    hint: string;
    state: string;
    on: string;
    off: string;
    setUp: string;
    codesLeft: string;
    codesLeftValue: Plural;
    newCodes: string;
    turnOff: string;
    setupTitle: string;
    scan: string;
    /** The QR code's name. */
    qr: string;
    key: string;
    code: string;
    confirm: string;
    sixDigits: string;
    codesTitle: string;
    codesText: string;
    copyCodes: string;
    codesSaved: string;
    turnedOn: string;
    newCodesReady: string;
    offTitle: string;
    offText: string;
    offConfirm: string;
    turnedOff: string;
  };
  passkeys: {
    title: string;
    hint: string;
    add: string;
    none: string;
    noneHint: string;
    created: string;
    used: string;
    never: string;
    here: string;
    other: string;
    synced: string;
    rename: string;
    renameTitle: string;
    removeText: string;
    removed: string;
    added: string;
    renamed: string;
    addTitle: string;
    name: string;
    nameHint: string;
    /** The name a passkey gets when the field is left empty. */
    fallbackName: string;
    continue: string;
    unavailableTitle: string;
    unavailable: string;
  };
  sessions: {
    title: string;
    hint: string;
    current: string;
    end: string;
    endOthers: string;
    ended: string;
    othersEnded: string;
    from: string;
    seen: string;
    /** "{browser} on {os}". */
    on: string;
    browser: string;
  };
  tokens: {
    title: string;
    hint: string;
    create: string;
    none: string;
    noneHint: string;
    /** The words for each scope the app hands its tokens. */
    scopes: Record<string, string>;
    created: string;
    used: string;
    neverUsed: string;
    expires: string;
    forever: string;
    revoke: string;
    revokeText: string;
    revoked: string;
    newTitle: string;
    name: string;
    nameHint: string;
    scope: string;
    lifetime: string;
    lifetimes: Record<SignInTokenLife, string>;
    make: string;
    nameMissing: string;
    shownTitle: string;
    shownText: string;
    shownDone: string;
  };
  services: {
    title: string;
    hint: string;
    add: string;
    on: string;
    off: string;
    untested: string;
    paused: string;
    show: string;
    mustTest: string;
    test: string;
    testing: string;
    testOk: string;
    testFailed: string;
    tested: string;
    /** The quiet line on a service the app sets up in its configuration file. */
    fromConfig: string;
    /** Turns such a service on again after a reset paused it. */
    confirmAgain: string;
    edit: string;
    removeText: string;
    removed: string;
    turnedOn: string;
    turnedOff: string;
    updated: string;
    pick: string;
    pickHint: string;
    group: string;
    own: string;
    /** A sign-in service with neither a name of its own nor an entry in the catalog. */
    unnamed: string;
    ownSub: string;
    ownHint: string;
    search: string;
    searchNone: string;
    clear: string;
    saved: string;
    formHint: string;
    /** The quiet line in the form: the service decides who gets in. */
    whoGetsIn: string;
    /** The label of the role a newcomer from the service gets, shown where the app has more than one. */
    role: string;
    /** The quiet line on that role, with `{name}` and `{role}`. */
    roleHint: string;
    issuer: string;
    issuerHint: string;
    clientId: string;
    secret: string;
    secretKept: string;
    redirect: string;
    redirectHint: string;
    label: string;
    /** The fold under the form that holds what only an unusual setup changes. */
    more: string;
    scopes: string;
    nameClaim: string;
    groupsClaim: string;
    turnOn: string;
    missing: string;
    unreachable: string;
  };
  accounts: {
    title: string;
    hint: string;
    owner: string;
    blocked: string;
    block: string;
    unblock: string;
    seen: string;
    created: string;
    groups: string;
    removeText: string;
    removed: string;
    blockedDone: string;
    unblocked: string;
  };
  /** The words for each role the app knows, by the kit's name for it. */
  roles: Record<string, string>;
  /** How an account or a session came in. `{name}` is the sign-in service. */
  via: Record<SignInVia, string>;
  errors: SignInErrorText;
  /** What a trip to a sign-in service came back with. */
  arrived: Partial<Record<SignInRedirectCode, string>>;
}

export type SignInTokenLife = "30" | "90" | "365" | "never";

const ERRORS_EN = {
  wrongPassword: "That password is wrong.",
  throttled: "Too many tries. Wait a minute, then try again.",
  wrongCode: "That code doesn’t match. Take a fresh one from your app.",
  stepExpired: "That took too long. Please start again.",
  passwordShort: "The new password needs at least {min} characters.",
  passwordLong: "That password is too long.",
  signInAgain: "This change wants a fresh sign-in. Sign out and back in, then try again.",
  confirmOff: "This change wants a fresh sign-in. Sign out and back in, then try again.",
  setPasswordFirst: "This needs a password of the app’s own first.",
  passkeysUnavailable: "Passkeys don’t work on this address.",
  cancelled: "The browser didn’t make a passkey.",
  passkeyRefused: "The passkey didn’t work. Try again or use your password.",
  passkeyUnknown: "This passkey can’t sign you in here.",
  serviceUnreachable: "The app can’t reach the sign-in service right now.",
  serviceUntested: "It turns on once a test sign-in has worked.",
  roleUnknown: "The app doesn’t know that role.",
  fromConfig: "The app’s configuration file sets up this service, so change it there.",
  secretAgain: "The address or the client changed, so enter the client secret again.",
  secretMissing: "Enter the client secret.",
  issuerInvalid: "That address doesn’t look like a sign-in service.",
  tokenNameMissing: "Give the token a name.",
  scopeUnknown: "The app doesn’t know the scope “{scope}”.",
  lastWayIn: "That’s the account’s last way in, so it stays.",
  accountOwner: "The owner’s account stays.",
  blocked: "This account is blocked.",
  nameTaken: "That name already belongs to another account.",
  offline: "The app isn’t answering right now. Try again in a moment.",
} satisfies SignInErrorText;

/** English words, for an app in English and for the demos. */
export const signInTileTextEn: SignInTileText = {
  cancel: "Cancel",
  close: "Close",
  confirm: "Confirm",
  copy: "Copy",
  copied: "Copied",
  back: "Back",
  save: "Save",
  remove: "Remove",
  show: "Show password",
  hide: "Hide password",
  confirmPassword: "Confirm password",
  mismatch: "The passwords do not match",
  failed: "That didn’t work. Please try again.",
  needsPassword: {
    title: "This needs a password first",
    reason: "Set a password of the app’s own above. It always gets you in, even when another way fails.",
  },
  notLocal: {
    title: "This comes from your sign-in service",
    reason: "You sign in through {name}. Set up two-factor and passkeys there.",
  },
  password: {
    title: "Password",
    hint: "A password needs at least {min} characters. Changing it ends every other session.",
    openHint: "Until a password is set, the app is open and everyone who reaches it is an admin.",
    viaService: "You sign in through {name}, so this account has no password here.",
    state: "Password",
    set: "Set",
    none: "No password",
    change: "Change",
    add: "Set a password",
    current: "Current password",
    next: "New password",
    save: "Save password",
    saved: "Password saved. Every other session has ended.",
    first: "Password set. Sign-in is on.",
    wrongCurrent: "The current password is wrong.",
    tooShort: "The new password needs at least {min} characters.",
    remove: "Remove password",
    removeTitle: "Remove the password?",
    removeText: "Without a password the app is open to anyone who reaches its address. These go with it:",
    goes: {
      twoFactor: "Two-factor authentication",
      passkeys: { one: "{count} passkey", other: "{count} passkeys" },
      services: "Sign-in with {names}",
      tokens: { one: "{count} API token", other: "{count} API tokens" },
    },
    removed: "Password removed. The app is open now.",
  },
  askPassword: {
    title: "Asking for the password",
    hint: "New passkeys, tokens, two-factor and sign-in services want a sign-in from the last few minutes. If yours is older, the app asks for your password once. Without the question you sign out and back in.",
    label: "Ask for the password on changes",
    on: "The app asks for your password before sensitive changes.",
    off: "The question is off. Sensitive changes need a fresh sign-in.",
  },
  twoFactor: {
    title: "Two-factor authentication",
    hint: "On top of the password, the app asks for a code from your authenticator app.",
    state: "Two-factor",
    on: "On",
    off: "Off",
    setUp: "Set up",
    codesLeft: "Recovery codes",
    codesLeftValue: { one: "{count} left", other: "{count} left" },
    newCodes: "New codes",
    turnOff: "Turn off",
    setupTitle: "Set up two-factor",
    scan: "Scan the code with your authenticator app, then enter the six digits it shows.",
    qr: "QR code for your authenticator app",
    key: "Key to type in",
    code: "Code from the app",
    confirm: "Turn on",
    sixDigits: "The code has six digits.",
    codesTitle: "Recovery codes",
    codesText: "Each code gets you in once when your phone isn’t at hand. The app shows them only now, so keep them somewhere safe.",
    copyCodes: "Copy codes",
    codesSaved: "I’ve saved the codes",
    turnedOn: "Two-factor is on.",
    newCodesReady: "New recovery codes are ready. The old ones no longer work.",
    offTitle: "Turn off two-factor",
    offText: "Enter a current code from your app, or a recovery code. After that the password is enough again.",
    offConfirm: "Turn off",
    turnedOff: "Two-factor is off. Your password still works.",
  },
  passkeys: {
    title: "Passkeys",
    hint: "A passkey signs you in with your fingerprint, your face or your device’s PIN. Your password still works.",
    add: "Add a passkey",
    none: "No passkeys yet",
    noneHint: "Add one and you sign in here without typing.",
    created: "Added {when}",
    used: "Last used {when}",
    never: "Never used",
    here: "works on this address",
    other: "works only on {address}",
    synced: "synced across your devices",
    rename: "Rename",
    renameTitle: "Rename the passkey",
    removeText: "“{name}” will no longer sign you in. Your password still works.",
    removed: "Passkey removed.",
    added: "Passkey added.",
    renamed: "Passkey renamed.",
    addTitle: "Add a passkey",
    name: "Name",
    nameHint: "A name you’ll know the device by later.",
    fallbackName: "Passkey",
    continue: "Continue",
    unavailableTitle: "Passkeys don’t work on this address",
    unavailable: "Browsers tie a passkey to a domain name with a trusted certificate. Open the app under its name over https, and you can add passkeys here.",
  },
  sessions: {
    title: "Sessions",
    hint: "Every device and browser you’re signed in on right now.",
    current: "This session",
    end: "End",
    endOthers: "Sign out everywhere else",
    ended: "Session ended.",
    othersEnded: "You’re signed out everywhere else.",
    from: "from {from}",
    seen: "last seen {when}",
    on: "{browser} on {os}",
    browser: "Browser",
  },
  tokens: {
    title: "API tokens",
    hint: "Scripts and other programs use an API token to talk to the app without your password.",
    create: "Create a token",
    none: "No API tokens yet",
    noneHint: "You need one to drive the app from a script.",
    scopes: { read: "Read only", all: "Everything" },
    created: "created {when}",
    used: "last used {when}",
    neverUsed: "never used",
    expires: "expires {when}",
    forever: "never expires",
    revoke: "Revoke",
    revokeText: "Programs that use “{name}” won’t get in anymore.",
    revoked: "Token revoked.",
    newTitle: "Create a token",
    name: "Name",
    nameHint: "What the token is for, so you’ll know it again later.",
    scope: "Can",
    lifetime: "Valid for",
    lifetimes: { "30": "30 days", "90": "90 days", "365": "1 year", never: "Always" },
    make: "Create",
    nameMissing: "Give the token a name.",
    shownTitle: "Your new token",
    shownText: "The app shows the token only now. Copy it to where you need it.",
    shownDone: "I’ve copied the token",
  },
  services: {
    title: "Sign-in services",
    hint: "A sign-in service signs people in to the app over OpenID Connect. The sign-in page shows its button while it’s on.",
    add: "Add a sign-in service",
    on: "On",
    off: "Off",
    untested: "Not tested yet",
    paused: "Paused",
    show: "On the sign-in page",
    mustTest: "It turns on once a test sign-in has worked.",
    test: "Test sign-in",
    testing: "Testing…",
    testOk: "Signed in",
    testFailed: "Not signed in",
    tested: "last tested {when}",
    fromConfig: "from the configuration file",
    confirmAgain: "Turn on again",
    edit: "Edit",
    removeText: "{name} won’t sign anyone in after this. Its accounts stay and get in another way. Your password still works.",
    removed: "{name} is removed.",
    turnedOn: "{name} is on the sign-in page.",
    turnedOff: "{name} is off the sign-in page.",
    updated: "{name} is saved.",
    pick: "Add a sign-in service",
    pickHint: "The app knows the right settings for the services in the catalog. Any other service with OpenID Connect goes through “Other sign-in service”.",
    group: "Self-hosted",
    own: "Other sign-in service",
    unnamed: "Sign-in service",
    ownSub: "OpenID Connect",
    ownHint: "Any service that speaks OpenID Connect. You fill in the scopes and where names and groups come from.",
    search: "Search sign-in services",
    searchNone: "Nothing matches “{query}”. “Other sign-in service” takes any service with OpenID Connect.",
    clear: "Clear the search",
    saved: "set up",
    formHint: "Create an application for the app at {name} and give it the redirect address below. The address, client ID and secret come from there.",
    whoGetsIn: "{name} decides who may sign in, for example through its groups.",
    role: "Role for newcomers",
    roleHint: "Whoever {name} lets in for the first time gets the role {role} here.",
    issuer: "Address",
    issuerHint: "The service’s own address, where it publishes its OpenID details, such as https://id.example.",
    clientId: "Client ID",
    secret: "Client secret",
    secretKept: "Saved. Leave it empty to keep it.",
    redirect: "Redirect address",
    redirectHint: "Enter this address at the service. It sends you back there after the sign-in.",
    label: "Name on the sign-in page",
    more: "More settings",
    scopes: "Scopes",
    nameClaim: "Name from",
    groupsClaim: "Groups from",
    turnOn: "Turn on",
    missing: "This field needs a value.",
    unreachable: "The app can’t reach {address}. Is the address right, and can the app get there?",
  },
  accounts: {
    title: "Accounts",
    hint: "Every account that can sign in here, with the way it comes in.",
    owner: "Owner",
    blocked: "Blocked",
    block: "Block",
    unblock: "Unblock",
    seen: "last seen {when}",
    created: "added {when}",
    groups: "groups {groups}",
    removeText: "{name} won’t get in after this, and the account’s sessions and API tokens end.",
    removed: "{name} is removed.",
    blockedDone: "{name} is blocked, and their sessions have ended.",
    unblocked: "{name} is unblocked.",
  },
  roles: { admin: "Admin" },
  via: {
    open: "no sign-in",
    password: "Password",
    passkey: "Passkey",
    service: "{name}",
    token: "API token",
    door: "The app’s own way",
  },
  errors: ERRORS_EN,
  arrived: {
    testOk: "The test sign-in worked, and the service is on the sign-in page.",
    linked: "The sign-in service is linked to your account.",
    serviceUnreachable: "The sign-in service couldn’t be reached.",
    serviceRefused: "The sign-in service didn’t confirm the sign-in.",
    flowExpired: "The sign-in took too long. Please try again.",
    identityTaken: "This person at the sign-in service already belongs to another account.",
    nameTaken: "That name already belongs to another account here.",
    nameMissing: "The sign-in service sent no name.",
    noAccount: "There’s no account here for that person yet.",
    blocked: "This account is blocked.",
    serviceOff: "That sign-in service is switched off.",
    addressMissing: "The app doesn’t know its own address yet, so the sign-in service can’t send you back.",
  },
};

/** The password question's words. */
export interface SignInReauthText {
  title: string;
  text: string;
  password: string;
  confirm: string;
  cancel: string;
  close: string;
  show: string;
  hide: string;
  wrong: string;
  /** Said when an admin turned the question off since. */
  off: string;
  failed: string;
}

export const signInReauthTextEn: SignInReauthText = {
  title: "Your password, please",
  text: "You signed in a while ago. Enter your password and the change goes on.",
  password: "Password",
  confirm: "Continue",
  cancel: "Cancel",
  close: "Close",
  show: "Show password",
  hide: "Hide password",
  wrong: "That password is wrong.",
  off: "This change wants a fresh sign-in. Sign out and back in, then try again.",
  failed: "That didn’t work. Please try again.",
};

/** A refusal in the app's words: its own sentence for the code, or `failed`, with the numbers the kit sent filled in. */
export function signInErrorText(words: { errors: SignInErrorText; failed: string }, error: Pick<SignInFailure, "error" | "min" | "retryAfter" | "scope">): string {
  return fill(words.errors[error.error] ?? words.failed, { min: error.min ?? "", retry: error.retryAfter ?? "", scope: error.scope ?? "" });
}

/** The question's sentence for the code the kit refused the password with. */
export function signInReauthError(text: SignInReauthText, error: string | null): string | undefined {
  if (error === null) return undefined;
  if (error === "wrongPassword") return text.wrong;
  if (error === "confirmOff") return text.off;
  return text.failed;
}

export type SignInTileWindow =
  | { kind: "removePassword" }
  | { kind: "twoFactorSetup"; secret: string; uri: string }
  /** `fresh` once two-factor was just turned on, otherwise new codes in place of the old. */
  | { kind: "recoveryCodes"; codes: string[]; fresh: boolean }
  | { kind: "twoFactorOff" }
  | { kind: "addPasskey" }
  | { kind: "renamePasskey"; id: string }
  | { kind: "newToken" }
  | { kind: "tokenShown"; name: string; value: string }
  | { kind: "pickService" }
  | { kind: "serviceForm"; provider: string; edit?: string };

export type SignInTileRemoval = "passkey" | "token" | "service" | "account";

/** What is typed into the password card and the open window. */
export interface SignInTileDraft {
  current: string;
  next: string;
  code: string;
  /** A passkey's or a token's name. */
  name: string;
  scope: string;
  life: SignInTokenLife;
  /** A sign-in service of the app's own: its name on the sign-in page. */
  label: string;
  issuer: string;
  clientId: string;
  secret: string;
  scopes: string;
  nameClaim: string;
  groupsClaim: string;
  /** The role a newcomer from the service gets. */
  role: string;
}

export type SignInTileField = keyof SignInTileDraft;

export interface SignInTileState {
  loaded: boolean;
  offer: SignInOffer | null;
  me: SignInMe | null;
  /** `null` where the account may not read them, such as one that is no admin. */
  settings: SignInSettings | null;
  sessions: SignInSession[];
  tokens: SignInToken[];
  passkeys: SignInPasskey[];
  services: SignInService[] | null;
  presets: SignInPreset[];
  accounts: SignInAccount[] | null;
  /** The app's roles and the one a new service hands its newcomers. */
  roles: SignInRoles;
  /** Every service the tile knows of by the name it shows (`signInServiceLabel`), for the lines that name one. */
  serviceLabels: { id: string; name: string }[];
  /** Passkeys work on the address the page is open on. */
  passkeysHere: boolean;
  window: SignInTileWindow | null;
  draft: SignInTileDraft;
  /** The password card shows its fields. */
  editing: boolean;
  /** The new password's two fields agree. */
  confirmed: boolean;
  /** A value a field cannot take, as the line under it. */
  invalid: { field: SignInTileField; message: string } | null;
  /** How the last try in the open window came out, as the line under its form. */
  said: { ok: boolean; message: string } | null;
  /** The service form's test sign-in. */
  formTest: ConnectionTest | undefined;
  /** Each service row's test sign-in, by the service's id. */
  rowTests: Record<string, ConnectionTest>;
  /** The `data-signin-tile` hook of the button whose work runs. */
  busy: string | null;
  /** The control that shakes, by its `data-signin-tile` hook. `count` grows with every refusal. */
  refusal: { hook: string; count: number } | null;
}

export interface SignInTileOptions {
  api: SignInApi;
  text: SignInTileText;
  lang: string;
  cards: readonly SignInTileCard[];
  /** The scopes a new token can take, the narrowest first. */
  scopes: readonly string[];
  /** The identity catalog, which names a service that has no name of its own. */
  providers?: Catalog;
  notify?: (message: string, severity: ToastSeverity) => void;
  /** The path a test sign-in comes back to. */
  returnTo?: string;
  /** Leaves the page for a test sign-in. Without it the browser goes there. */
  onLeave?: (url: string) => void;
}

export interface SignInTileFlow {
  state(): SignInTileState;
  subscribe(listener: () => void): () => void;
  /** Reads everything the cards show, and again after every change the client reports. Returns the stop. */
  start(): () => void;
  refresh(): Promise<void>;
  set(field: SignInTileField, value: string): void;
  setConfirmed(confirmed: boolean): void;
  close(): void;
  /** Says what a trip to a sign-in service came back with. */
  arrive(code: string): void;

  editPassword(): void;
  cancelPassword(): void;
  savePassword(): Promise<void>;
  askRemovePassword(): void;
  removePassword(): Promise<void>;
  setAskPassword(on: boolean): Promise<void>;

  setUpTwoFactor(): Promise<void>;
  confirmTwoFactor(): Promise<void>;
  newCodes(): Promise<void>;
  copyCodes(): Promise<void>;
  codesSaved(): void;
  askTwoFactorOff(): void;
  turnTwoFactorOff(): Promise<void>;

  askAddPasskey(agent?: string): void;
  addPasskey(): Promise<void>;
  askRenamePasskey(id: string): void;
  renamePasskey(): Promise<void>;

  endSession(id: string): Promise<void>;
  endOtherSessions(): Promise<void>;

  askToken(): void;
  makeToken(): Promise<void>;

  pickService(): void;
  chooseService(provider: string): void;
  editService(id: string): void;
  testDraft(): Promise<void>;
  saveService(): Promise<void>;
  testService(id: string): Promise<void>;
  setServiceOn(id: string, on: boolean): Promise<void>;
  /** Turns a service from the configuration file on again after a reset paused it. */
  confirmService(id: string): Promise<void>;

  block(id: string, blocked: boolean): Promise<void>;

  /** Takes a passkey, a token, a service or an account away, once the person confirmed `removalQuestion`. */
  remove(what: SignInTileRemoval, id: string): Promise<void>;
}

const EMPTY_DRAFT: SignInTileDraft = {
  current: "",
  next: "",
  code: "",
  name: "",
  scope: "",
  life: "90",
  label: "",
  issuer: "",
  clientId: "",
  secret: "",
  scopes: "",
  nameClaim: "",
  groupsClaim: "",
  role: "",
};

const START: SignInTileState = {
  loaded: false,
  offer: null,
  me: null,
  settings: null,
  sessions: [],
  tokens: [],
  passkeys: [],
  services: null,
  presets: [],
  accounts: null,
  roles: { roles: [], serviceRole: "" },
  serviceLabels: [],
  passkeysHere: false,
  window: null,
  draft: EMPTY_DRAFT,
  editing: false,
  confirmed: false,
  invalid: null,
  said: null,
  formTest: undefined,
  rowTests: {},
  busy: null,
  refusal: null,
};

/** The draft a recovery code or an authenticator code may take: six digits, or ten characters. */
export function signInCodeShape(code: string): "totp" | "recovery" | null {
  const bare = code.replace(/[\s-]/g, "");
  if (/^\d{6}$/.test(bare)) return "totp";
  return bare.length === 10 ? "recovery" : null;
}

/** The cards the tile draws out of those asked for, as far as the account may see them. */
export function signInTileCards(s: SignInTileState, cards: readonly SignInTileCard[]): SignInTileCard[] {
  if (!s.loaded || !s.me) return [];
  const open = s.me.via === "open";
  return SIGN_IN_TILE_CARDS.filter((c) => {
    if (!cards.includes(c)) return false;
    if (c === "askPassword") return s.settings !== null;
    if (c === "sessions") return !open;
    if (c === "services") return open || s.services !== null;
    if (c === "accounts") return !open && (s.accounts?.length ?? 0) > 0;
    return true;
  });
}

/** The tile's dates, such as "21 Nov 2026, 14:05", unless the app formats them itself. */
export function signInWhen(lang: string): (iso: string) => string {
  const format = new Intl.DateTimeFormat(lang, { dateStyle: "medium", timeStyle: "short" });
  return (iso) => format.format(new Date(iso));
}

/** The address a sign-in service sends the browser back to, as the service form shows it before the kit names it. */
export function signInRedirectAddress(api: Pick<SignInApi, "root">, service?: Pick<SignInService, "redirect"> | null): string {
  return service?.redirect || `${location.origin}${api.root}signin/oidc/callback`;
}

/** What the question before a removal says, and its button. */
export function removalQuestion(text: SignInTileText, what: SignInTileRemoval, name: string): { message: string; confirm: string } {
  if (what === "passkey") return { message: fill(text.passkeys.removeText, { name }), confirm: text.remove };
  if (what === "token") return { message: fill(text.tokens.revokeText, { name }), confirm: text.tokens.revoke };
  if (what === "service") return { message: fill(text.services.removeText, { name }), confirm: text.remove };
  return { message: fill(text.accounts.removeText, { name }), confirm: text.remove };
}

/** How long a new token can live, in the order the window offers it. */
export const SIGN_IN_TOKEN_LIVES: readonly SignInTokenLife[] = ["30", "90", "365", "never"];

/** The scopes a new token can take, each in the app's words where it has some. */
export function signInScopeItems(scopes: readonly string[], words: Record<string, string>): { id: string; label: string }[] {
  return scopes.map((id) => ({ id, label: words[id] ?? id }));
}

/**
 * The picker's tiles for the sign-in services: the catalog's, each marked where
 * one is set up already, and the tile for any other service last.
 * `M` is the framework's kind of glyph.
 */
export function signInServicePicker<M>(
  catalog: Catalog,
  text: SignInTileText,
  lang: string,
  services: readonly SignInService[] | null,
  glyph: (entry: CatalogEntry | null) => M,
): { items: PickItem<M>[]; groups: PickGroup[] } {
  const t = text.services;
  const setUp = new Set((services ?? []).map((s) => s.provider));
  const { items, groups } = catalogPicker(catalog, {
    ids: catalog.entries.map((e) => e.id),
    titles: Object.fromEntries(catalog.groups.map((g) => [g, t.group])),
    glyph,
    lang,
    own: (e) => (setUp.has(e.id) ? { sub: t.saved } : undefined),
  });
  const own: PickItem<M> = { id: OWN_SIGN_IN_SERVICE, label: t.own, sub: t.ownSub, hint: t.ownHint, mark: glyph(null), last: true };
  if (catalog.groups[0] !== undefined) own.group = catalog.groups[0];
  return { items: [...items, own], groups };
}

/** A service's mark from the catalog, or `null` for one the catalog does not know, which wears a glyph. */
export function signInServiceMark(catalog: Catalog, provider: string): TileMark | null {
  return catalog.entries.find((e) => e.id === provider)?.mark ?? null;
}

/**
 * How a sign-in service is named on a button or a row: its own name, or the
 * catalog's name for its kind, or the app's word for a sign-in service, which
 * wears the app's glyph (`mark` is `null`). Never the protocol's name.
 */
export function signInServiceLabel(
  service: { name?: string; provider?: string },
  catalog: Catalog | undefined,
  text: { services: { unnamed: string } },
): { name: string; mark: TileMark | null } {
  const entry = catalog?.entries.find((e) => e.id === service.provider);
  return { name: service.name?.trim() || entry?.name || text.services.unnamed, mark: entry?.mark ?? null };
}

/** The role choice in the service form, or `null` where the app has one role and nothing to choose. */
export function signInRoleItems(text: SignInTileText, roles: SignInRoles): { id: string; label: string }[] | null {
  if (roles.roles.length < 2) return null;
  return roles.roles.map((id) => ({ id, label: text.roles[id] ?? id }));
}

/** The service form's quiet line: the service decides who gets in, and which role a newcomer gets here. */
export function signInServiceQuiet(text: SignInTileText, s: SignInTileState, name: string): string {
  const role = s.draft.role || s.roles.serviceRole;
  const who = fill(text.services.whoGetsIn, { name });
  return role ? `${who} ${fill(text.services.roleHint, { name, role: text.roles[role] ?? role })}` : who;
}

/** The test sign-in's words as its button says them while it runs and once it came out. */
export function signInTestLabel(text: SignInTileText, test: ConnectionTest | undefined): string {
  const t = text.services;
  if (test?.busy) return t.testing;
  if (test?.tone === "ok") return t.testOk;
  if (test?.tone === "danger") return t.testFailed;
  return t.test;
}

/**
 * Whether passkeys can work on this address, as the kit decides it: https or
 * localhost, under a name rather than an IP address. The kit's own `passkeys`
 * says so only once some account has a passkey.
 */
export function passkeysAllowedAt(at: { protocol: string; hostname: string }): boolean {
  const host = at.hostname.replace(/^\[|\]$/g, "");
  if (host === "localhost") return true;
  return at.protocol === "https:" && !/^[\d.]+$/.test(host) && !host.includes(":");
}

/** The sign-in service the account came in through, by its name. */
function serviceOfMe(s: SignInTileState): string {
  const id = s.me?.service;
  return s.serviceLabels.find((x) => x.id === id)?.name ?? id ?? "";
}

/**
 * What stands in place of a card's controls, or `null` where they can work:
 * every lasting way in waits for the first password while the app is open,
 * and two-factor and passkeys belong to the sign-in service for an account
 * without a password of its own.
 */
export function signInCardNotice(text: SignInTileText, s: SignInTileState, card: "twoFactor" | "passkeys" | "tokens" | "services"): { title: string; reason: string } | null {
  if (s.me?.via === "open") return text.needsPassword;
  if (!s.me?.password && (card === "twoFactor" || card === "passkeys")) return { title: text.notLocal.title, reason: fill(text.notLocal.reason, { name: serviceOfMe(s) }) };
  return null;
}

/** The password card's line for an account that signs in through a sign-in service and has no password here, or `null`. */
export function signInPasswordElsewhere(text: SignInTileText, s: SignInTileState): string | null {
  if (!s.me || s.me.via === "open" || s.me.password) return null;
  return fill(text.password.viaService, { name: serviceOfMe(s) });
}

/** The browser and the system in an agent string, as "Firefox on Windows". */
export function signInDevice(agent: string | undefined, text: Pick<SignInTileText["sessions"], "on" | "browser">): { name: string; phone: boolean } {
  const a = agent ?? "";
  const browser = /Firefox\//.test(a)
    ? "Firefox"
    : /Edg\//.test(a)
      ? "Edge"
      : /OPR\//.test(a)
        ? "Opera"
        : /Chrome\//.test(a)
          ? "Chrome"
          : /Safari\//.test(a)
            ? "Safari"
            : "";
  const os = /Android/.test(a) ? "Android" : /iPhone|iPad/.test(a) ? "iOS" : /Windows/.test(a) ? "Windows" : /Mac OS/.test(a) ? "macOS" : /Linux/.test(a) ? "Linux" : "";
  const phone = /Android|iPhone|Mobile/.test(a);
  const name = browser && os ? fill(text.on, { browser, os }) : browser || os || text.browser;
  return { name, phone };
}

/** How an account or a session came in, in the app's words. */
export function signInViaWords(text: SignInTileText, via: SignInVia, service: string | undefined, services: readonly { id: string; name: string }[] | null): string {
  const name = services?.find((s) => s.id === service)?.name ?? service ?? "";
  return fill(text.via[via], { name });
}

type When = (iso: string) => string;

/**
 * A passkey's row: when it was added on the row itself, and the rest (when it
 * was last used, where it works, whether it is synced) in the row's info
 * bubble, apart in middle dots.
 */
export function passkeyFacts(text: SignInTileText, p: SignInPasskey, when: When): { added: string; more: string } {
  const t = text.passkeys;
  return {
    added: fill(t.created, { when: when(p.created) }),
    more: [p.used ? fill(t.used, { when: when(p.used) }) : t.never, p.here ? t.here : fill(t.other, { address: p.rpID }), ...(p.synced ? [t.synced] : [])].join(" · "),
  };
}

export function tokenFacts(text: SignInTileText, k: SignInToken, when: When): string[] {
  const t = text.tokens;
  return [
    fill(t.created, { when: when(k.created) }),
    k.used ? fill(t.used, { when: when(k.used) }) : t.neverUsed,
    k.expires ? fill(t.expires, { when: when(k.expires) }) : t.forever,
  ];
}

export function sessionFacts(text: SignInTileText, s: SignInSession, services: readonly { id: string; name: string }[] | null, when: When): string[] {
  return [signInViaWords(text, s.via, s.service, services), ...(s.from ? [fill(text.sessions.from, { from: s.from })] : []), fill(text.sessions.seen, { when: when(s.seen) })];
}

export function accountFacts(text: SignInTileText, a: SignInAccount, services: readonly { id: string; name: string }[] | null, when: When): string[] {
  const t = text.accounts;
  return [
    text.roles[a.role] ?? a.role,
    signInViaWords(text, a.via, a.service, services),
    ...(a.groups?.length ? [fill(t.groups, { groups: a.groups.join(", ") })] : []),
    a.seen ? fill(t.seen, { when: when(a.seen) }) : fill(t.created, { when: when(a.created) }),
  ];
}

/** A service's state as its badge says it. */
export function signInServiceBadge(text: SignInTileText, s: SignInService): { tone: "ok" | "warn" | "neutral"; label: string } {
  const t = text.services;
  if (s.paused) return { tone: "warn", label: t.paused };
  if (s.on) return { tone: "ok", label: t.on };
  if (!s.tested) return { tone: "warn", label: t.untested };
  return { tone: "neutral", label: t.off };
}

export function signInServiceStatus(text: SignInTileText, s: SignInService, when: When): string {
  return [
    s.issuer,
    ...(s.tested && s.testedAt ? [fill(text.services.tested, { when: when(s.testedAt) })] : []),
    ...(s.fromConfig ? [text.services.fromConfig] : []),
  ].join(" · ");
}

/**
 * A service row's own action: Turn on again, on a service from the
 * configuration file that a reset paused. Such a service has no Edit, Remove
 * or switch, since the app's configuration file decides the rest.
 */
export function signInServiceActions<G>(text: SignInTileText, s: SignInService, state: SignInTileState, labelKey: string, confirm: (id: string) => void): ConnectionAction<G>[] {
  if (!s.fromConfig || !s.paused) return [];
  return [{ id: "confirm", label: text.services.confirmAgain, labelKey, busy: state.busy === `service-confirm-${s.id}`, onClick: () => confirm(s.id) }];
}

/** What goes off with the password, for the window that removes it. */
export function passwordGoes(text: SignInTileText, lang: string, s: SignInTileState): string[] {
  const g = text.password.goes;
  const on = (s.services ?? []).filter((x) => x.on).map((x) => x.name);
  return [
    ...(s.me?.twoFactor ? [g.twoFactor] : []),
    ...(s.passkeys.length ? [plural(lang, g.passkeys, s.passkeys.length)] : []),
    ...(on.length ? [fill(g.services, { names: listOf(lang, on) })] : []),
    ...(s.tokens.length ? [plural(lang, g.tokens, s.tokens.length)] : []),
  ];
}

/** The name the service form and its window title use. */
export function signInServiceName(text: SignInTileText, provider: string, label: string, catalogName: string | undefined): string {
  return label.trim() || catalogName || text.services.own;
}

/** The first field of the service form that still waits for a value. */
export function signInServiceMissing(d: SignInTileDraft, editing: boolean): SignInTileField | null {
  if (!/^https?:\/\/\S+$/.test(d.issuer.trim())) return "issuer";
  if (!d.clientId.trim()) return "clientId";
  if (!editing && !d.secret) return "secret";
  return null;
}

/** Puts the shake on the refused control, wherever its window stands. */
export function showTileRefusal(refusal: { hook: string } | null): () => void {
  if (!refusal) return () => {};
  const el = document.querySelector<HTMLElement>(`[data-signin-tile="${refusal.hook}"]`);
  return el ? shake(el) : () => {};
}

/**
 * The flow behind one tile. `options` is read at every step, so a framework
 * hands in its current props rather than the ones the tile was made with.
 */
export function createSignInTileFlow(options: () => SignInTileOptions): SignInTileFlow {
  let state = START;
  const listeners = new Set<() => void>();
  const update = (change: Partial<SignInTileState>) => {
    state = { ...state, ...change };
    listeners.forEach((fn) => fn());
  };
  const text = () => options().text;
  const notify = (message: string, severity: ToastSeverity = "success") => options().notify?.(message, severity);
  const say = (e: SignInFailure) => signInErrorText(text(), e);
  const refuse = (hook: string) => ({ refusal: { hook, count: (state.refusal?.count ?? 0) + 1 } });
  // A refusal says why in a toast, unless it is a field's, and shakes what sent it.
  const failed = (e: SignInFailure, hook: string) => {
    notify(say(e), "fail");
    update(refuse(hook));
  };
  const invalid = (field: SignInTileField, message: string, hook: string) => update({ invalid: { field, message }, ...refuse(hook) });
  const open = (window: SignInTileWindow, draft: Partial<SignInTileDraft> = {}) =>
    update({ window, draft: { ...state.draft, ...draft }, invalid: null, said: null, formTest: undefined, confirmed: false });

  async function run(hook: string, work: () => Promise<void>) {
    if (state.busy) return;
    update({ busy: hook });
    try {
      await work();
    } catch {
      notify(text().failed, "fail");
      update(refuse(hook));
    } finally {
      update({ busy: null });
    }
  }

  async function read() {
    const { api, cards } = options();
    const need = (...c: SignInTileCard[]) => c.some((x) => cards.includes(x));
    const [offer, me] = await Promise.all([api.options(), api.me()]);
    const mine = me.ok && me.value.via !== "open";
    const [settings, sessions, tokens, passkeys, services, presets, accounts, roles] = await Promise.all([
      need("askPassword") ? api.settings() : null,
      need("sessions") && mine ? api.sessions() : null,
      need("tokens", "password") && mine ? api.tokens() : null,
      need("passkeys", "password") && mine ? api.passkeys() : null,
      need("services", "password", "sessions", "accounts") ? api.services() : null,
      need("services") ? api.presets() : null,
      need("accounts") ? api.accounts() : null,
      need("services") ? api.roles() : null,
    ]);
    update({
      loaded: true,
      offer: offer.ok ? offer.value : null,
      me: me.ok ? me.value : null,
      settings: settings?.ok ? settings.value : null,
      sessions: sessions?.ok ? sessions.value : [],
      tokens: tokens?.ok ? tokens.value : [],
      passkeys: passkeys?.ok ? passkeys.value : [],
      services: services?.ok ? services.value : null,
      presets: presets?.ok ? presets.value : [],
      accounts: accounts?.ok ? accounts.value : null,
      roles: roles?.ok ? roles.value : START.roles,
      serviceLabels: [...(services?.ok ? services.value : []), ...(offer.ok ? offer.value.services : [])]
        .filter((x, i, all) => all.findIndex((y) => y.id === x.id) === i)
        .map((x) => ({ id: x.id, name: signInServiceLabel(x, options().providers, options().text).name })),
      passkeysHere: (offer.ok && offer.value.passkeys) || (typeof location !== "undefined" && passkeysAllowedAt(location)),
    });
  }

  // A read asked for while one runs waits for the next, which sees the change.
  let reading: Promise<void> | null = null;
  let queued: Promise<void> | null = null;
  function refresh(): Promise<void> {
    if (!reading) {
      reading = read().finally(() => (reading = null));
      return reading;
    }
    queued ??= reading.then(() => {
      queued = null;
      return refresh();
    });
    return queued;
  }

  const preset = (provider: string) => state.presets.find((p) => p.id === provider) ?? state.presets.find((p) => p.id === OWN_SIGN_IN_SERVICE);
  const back = () => options().returnTo ?? (typeof location === "undefined" ? "/" : location.pathname);
  const leave = (url: string) => {
    const go = options().onLeave;
    if (go) go(url);
    else location.assign(url);
  };
  const labelOf = (service: { name?: string; provider?: string }) => signInServiceLabel(service, options().providers, text()).name;
  // What the service form sends. The role goes along only where the app has a choice of them.
  const serviceBody = (): SignInServiceInput => {
    const d = state.draft;
    return {
      name: d.label.trim(),
      issuer: d.issuer.trim(),
      clientId: d.clientId.trim(),
      ...(d.secret ? { secret: d.secret } : {}),
      scopes: d.scopes,
      nameClaim: d.nameClaim,
      groupsClaim: d.groupsClaim,
      ...(state.roles.roles.length > 1 && d.role ? { role: d.role } : {}),
    };
  };
  // The service the form stored, so a second test changes it instead of adding another.
  let stored: string | null = null;

  async function testAt(id: string, hook: string, report: (e: SignInFailure) => void) {
    const r = await options().api.testService(id, back());
    if (!r.ok) {
      report(r);
      update(refuse(hook));
      return;
    }
    leave(r.value.url);
  }

  const flow: SignInTileFlow = {
    state: () => state,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    start() {
      void refresh();
      return options().api.subscribe(() => void refresh());
    },
    refresh,
    set(field, value) {
      update({ draft: { ...state.draft, [field]: value }, invalid: state.invalid?.field === field ? null : state.invalid, said: null });
    },
    setConfirmed: (confirmed) => update({ confirmed }),
    close() {
      const w = state.window;
      if (w?.kind === "recoveryCodes") return flow.codesSaved();
      update({ window: null, invalid: null, said: null, formTest: undefined, draft: EMPTY_DRAFT });
    },
    arrive(code) {
      const words = text().arrived[code as SignInRedirectCode];
      if (code === "testOk" || code === "linked") {
        update({ window: null });
        notify(words ?? text().failed, "success");
      } else notify(words ?? text().failed, "warn");
      void refresh();
    },

    editPassword: () => update({ editing: true, draft: { ...state.draft, current: "", next: "" }, invalid: null, confirmed: false }),
    cancelPassword: () => update({ editing: false, draft: { ...state.draft, current: "", next: "" }, invalid: null }),
    async savePassword() {
      const t = text().password;
      const min = state.offer?.minPassword ?? 12;
      const had = !!state.me?.password;
      const { current, next } = state.draft;
      if (had && current === "") return invalid("current", t.wrongCurrent, "save-password");
      if ([...next].length < min) return invalid("next", fill(t.tooShort, { min }), "save-password");
      if (!state.confirmed) return invalid("next", text().mismatch, "save-password");
      return run("save-password", async () => {
        const r = await options().api.setPassword(had ? { current, next } : { next });
        if (!r.ok) {
          if (r.error === "wrongPassword") return invalid("current", t.wrongCurrent, "save-password");
          if (r.error === "passwordShort") return invalid("next", fill(t.tooShort, { min: r.min ?? min }), "save-password");
          return failed(r, "save-password");
        }
        update({ editing: false, draft: { ...state.draft, current: "", next: "" } });
        notify(had ? t.saved : t.first);
        await refresh();
      });
    },
    askRemovePassword: () => open({ kind: "removePassword" }, { current: "" }),
    async removePassword() {
      const t = text().password;
      if (state.draft.current === "") return invalid("current", t.wrongCurrent, "remove-password");
      return run("remove-password", async () => {
        const r = await options().api.removePassword(state.draft.current);
        if (!r.ok) {
          if (r.error === "wrongPassword") return invalid("current", t.wrongCurrent, "remove-password");
          return failed(r, "remove-password");
        }
        flow.close();
        notify(t.removed, "warn");
        await refresh();
      });
    },
    async setAskPassword(on) {
      const before = state.settings;
      if (!before) return;
      update({ settings: { ...before, askPassword: on } });
      const r = await options().api.changeSettings({ askPassword: on });
      if (!r.ok) {
        update({ settings: before });
        return failed(r, "ask-password");
      }
      update({ settings: r.value });
      notify(on ? text().askPassword.on : text().askPassword.off);
    },

    setUpTwoFactor: () =>
      run("two-factor-set-up", async () => {
        const r = await options().api.startTwoFactor();
        if (!r.ok) return failed(r, "two-factor-set-up");
        open({ kind: "twoFactorSetup", secret: r.value.secret, uri: r.value.uri }, { code: "" });
      }),
    async confirmTwoFactor() {
      const t = text().twoFactor;
      const code = state.draft.code.trim();
      if (!/^\d{6}$/.test(code)) return invalid("code", t.sixDigits, "two-factor-confirm");
      return run("two-factor-confirm", async () => {
        const r = await options().api.confirmTwoFactor(code);
        if (!r.ok) {
          if (r.error === "wrongCode") return invalid("code", say(r), "two-factor-confirm");
          return failed(r, "two-factor-confirm");
        }
        open({ kind: "recoveryCodes", codes: r.value.codes, fresh: true });
        await refresh();
      });
    },
    newCodes: () =>
      run("two-factor-codes", async () => {
        const r = await options().api.newRecoveryCodes();
        if (!r.ok) return failed(r, "two-factor-codes");
        open({ kind: "recoveryCodes", codes: r.value.codes, fresh: false });
        await refresh();
      }),
    async copyCodes() {
      const w = state.window;
      if (w?.kind !== "recoveryCodes") return;
      if (await copyText(w.codes.join("\n"))) notify(text().copied);
      else notify(text().failed, "fail");
    },
    codesSaved() {
      const w = state.window;
      update({ window: null, draft: EMPTY_DRAFT });
      if (w?.kind === "recoveryCodes") notify(w.fresh ? text().twoFactor.turnedOn : text().twoFactor.newCodesReady);
    },
    askTwoFactorOff: () => open({ kind: "twoFactorOff" }, { code: "" }),
    async turnTwoFactorOff() {
      const t = text().twoFactor;
      const code = state.draft.code.trim();
      if (!signInCodeShape(code)) return invalid("code", t.sixDigits, "two-factor-off");
      return run("two-factor-off", async () => {
        const r = await options().api.stopTwoFactor(code);
        if (!r.ok) {
          if (r.error === "wrongCode") return invalid("code", say(r), "two-factor-off");
          return failed(r, "two-factor-off");
        }
        flow.close();
        notify(t.turnedOff);
        await refresh();
      });
    },

    askAddPasskey(agent = typeof navigator === "undefined" ? "" : navigator.userAgent) {
      open({ kind: "addPasskey" }, { name: signInDevice(agent, text().sessions).name });
    },
    addPasskey: () =>
      run("passkey-add", async () => {
        const t = text().passkeys;
        const r = await options().api.addPasskey(state.draft.name.trim() || t.fallbackName);
        if (!r.ok) {
          update({ said: { ok: false, message: say(r) }, ...refuse("passkey-add") });
          return;
        }
        flow.close();
        notify(t.added);
        await refresh();
      }),
    askRenamePasskey(id) {
      const p = state.passkeys.find((x) => x.id === id);
      if (p) open({ kind: "renamePasskey", id }, { name: p.name });
    },
    renamePasskey: () =>
      run("passkey-rename", async () => {
        const w = state.window;
        if (w?.kind !== "renamePasskey") return;
        const name = state.draft.name.trim();
        if (!name) return invalid("name", text().services.missing, "passkey-rename");
        const r = await options().api.renamePasskey(w.id, name);
        if (!r.ok) return failed(r, "passkey-rename");
        flow.close();
        notify(text().passkeys.renamed);
        await refresh();
      }),

    endSession: (id) =>
      run(`session-end-${id}`, async () => {
        const r = await options().api.endSession(id);
        if (!r.ok) return failed(r, `session-end-${id}`);
        notify(text().sessions.ended);
        await refresh();
      }),
    endOtherSessions: () =>
      run("sessions-end-others", async () => {
        const r = await options().api.endOtherSessions();
        if (!r.ok) return failed(r, "sessions-end-others");
        notify(text().sessions.othersEnded);
        await refresh();
      }),

    askToken: () => open({ kind: "newToken" }, { name: "", scope: options().scopes[0] ?? "read", life: "90" }),
    makeToken: () =>
      run("token-make", async () => {
        const name = state.draft.name.trim();
        if (!name) return invalid("name", text().tokens.nameMissing, "token-make");
        const life = state.draft.life;
        const r = await options().api.makeToken({ name, scopes: [state.draft.scope], ...(life === "never" ? { never: true } : { days: Number(life) }) });
        if (!r.ok) {
          if (r.error === "tokenNameMissing") return invalid("name", text().tokens.nameMissing, "token-make");
          return failed(r, "token-make");
        }
        open({ kind: "tokenShown", name, value: r.value.value });
        await refresh();
      }),

    pickService: () => open({ kind: "pickService" }),
    chooseService(provider) {
      const p = preset(provider);
      stored = null;
      open(
        { kind: "serviceForm", provider },
        {
          label: "",
          issuer: "",
          clientId: "",
          secret: "",
          scopes: p?.scopes ?? "openid profile email",
          nameClaim: p?.nameClaim ?? "preferred_username",
          groupsClaim: p?.groupsClaim ?? "groups",
          role: state.roles.serviceRole,
        },
      );
    },
    editService(id) {
      const s = state.services?.find((x) => x.id === id);
      if (!s) return;
      stored = id;
      open(
        { kind: "serviceForm", provider: s.provider, edit: id },
        { label: s.name, issuer: s.issuer, clientId: s.clientId, secret: "", scopes: s.scopes, nameClaim: s.nameClaim, groupsClaim: s.groupsClaim, role: s.role },
      );
    },
    testDraft: () =>
      run("service-test", async () => {
        const w = state.window;
        if (w?.kind !== "serviceForm") return;
        const t = text().services;
        const missing = signInServiceMissing(state.draft, stored !== null);
        if (missing) return invalid(missing, t.missing, "service-test");
        const { api } = options();
        const d = state.draft;
        const body = serviceBody();
        update({ formTest: { busy: true }, said: null });
        const saved = stored === null ? await api.addService({ provider: w.provider, ...body }) : await api.changeService(stored, body);
        const report = (message: string) => update({ formTest: { tone: "danger", title: message }, said: { ok: false, message }, ...refuse("service-test") });
        if (!saved.ok) {
          if (saved.error === "secretAgain" || saved.error === "secretMissing") update({ invalid: { field: "secret", message: say(saved) } });
          return report(say(saved));
        }
        stored = saved.value.service.id;
        const check = await api.checkService(stored);
        if (!check.ok) return report(check.error === "notFound" ? say(check) : fill(t.unreachable, { address: d.issuer.trim() }));
        await testAt(stored, "service-test", (e) => report(say(e)));
      }),
    saveService: () =>
      run("service-save", async () => {
        const w = state.window;
        if (w?.kind !== "serviceForm" || !w.edit) return;
        const missing = signInServiceMissing(state.draft, true);
        if (missing) return invalid(missing, text().services.missing, "service-save");
        const r = await options().api.changeService(w.edit, serviceBody());
        if (!r.ok) {
          if (r.error === "secretAgain") return invalid("secret", say(r), "service-save");
          if (r.error === "roleUnknown") return invalid("role", say(r), "service-save");
          return failed(r, "service-save");
        }
        flow.close();
        notify(fill(text().services.updated, { name: labelOf(r.value.service) }));
        await refresh();
      }),
    async testService(id) {
      if (state.rowTests[id]?.busy) return;
      update({ rowTests: { ...state.rowTests, [id]: { busy: true } } });
      await testAt(id, `service-row-test-${id}`, (e) => update({ rowTests: { ...state.rowTests, [id]: { tone: "danger", title: say(e) } } }));
    },
    async setServiceOn(id, on) {
      const before = state.services;
      if (!before) return;
      update({ services: before.map((s) => (s.id === id ? { ...s, on } : s)) });
      const r = await options().api.changeService(id, { on });
      if (!r.ok) {
        update({ services: before });
        if (r.error === "serviceUntested") notify(text().services.mustTest, "warn");
        else notify(say(r), "fail");
        update(refuse(`service-on-${id}`));
        return;
      }
      notify(fill(on ? text().services.turnedOn : text().services.turnedOff, { name: labelOf(r.value.service) }));
      await refresh();
    },

    confirmService: (id) =>
      run(`service-confirm-${id}`, async () => {
        const r = await options().api.changeService(id, { on: true });
        if (!r.ok) return failed(r, `service-confirm-${id}`);
        notify(fill(text().services.turnedOn, { name: labelOf(r.value.service) }));
        await refresh();
      }),

    block: (id, blocked) =>
      run(`account-block-${id}`, async () => {
        const t = text().accounts;
        const r = await options().api.changeAccount(id, { blocked });
        if (!r.ok) return failed(r, `account-block-${id}`);
        notify(fill(blocked ? t.blockedDone : t.unblocked, { name: r.value.account.name }), blocked ? "warn" : "success");
        await refresh();
      }),

    remove: (what, id) =>
      run(`remove-${what}-${id}`, async () => {
        const { api } = options();
        const t = text();
        const name =
          what === "passkey"
            ? state.passkeys.find((x) => x.id === id)?.name
            : what === "token"
              ? state.tokens.find((x) => x.id === id)?.name
              : what === "service"
                ? state.serviceLabels.find((x) => x.id === id)?.name
                : state.accounts?.find((x) => x.id === id)?.name;
        const r =
          what === "passkey"
            ? await api.removePasskey(id)
            : what === "token"
              ? await api.revokeToken(id)
              : what === "service"
                ? await api.removeService(id)
                : await api.removeAccount(id);
        if (!r.ok) return failed(r, `remove-${what}-${id}`);
        const said = { passkey: t.passkeys.removed, token: t.tokens.revoked, service: t.services.removed, account: t.accounts.removed }[what];
        notify(fill(said, { name: name ?? "" }));
        await refresh();
      }),
  };
  return flow;
}

/** The label keys behind the tile's buttons and tiles, which pick their glyphs (see Button). */
export interface SignInTileLabelKeys {
  change: string;
  setPassword: string;
  removePassword: string;
  savePassword: string;
  setUp: string;
  newCodes: string;
  turnOff: string;
  copy: string;
  confirm: string;
  add: string;
  rename: string;
  remove: string;
  end: string;
  endOthers: string;
  createToken: string;
  revoke: string;
  addService: string;
  turnOn: string;
  save: string;
  block: string;
  unblock: string;
  passkey: string;
  token: string;
  account: string;
  laptop: string;
  phone: string;
  service: string;
  forward: string;
}

export const SIGN_IN_TILE_KEYS: SignInTileLabelKeys = {
  change: "edit",
  setPassword: "setPassword",
  removePassword: "removePassword",
  savePassword: "setPassword",
  setUp: "twoFactor",
  newCodes: "retry",
  turnOff: "turnOff",
  copy: "copy",
  confirm: "confirm",
  add: "add",
  rename: "edit",
  remove: "delete",
  end: "signOut",
  endOthers: "signOut",
  createToken: "add",
  revoke: "revoke",
  addService: "add",
  turnOn: "signIn",
  save: "save",
  block: "block",
  unblock: "unblock",
  passkey: "passkey",
  token: "apiToken",
  account: "account",
  laptop: "deviceLaptop",
  phone: "devicePhone",
  service: "signIn",
  forward: "forward",
};
