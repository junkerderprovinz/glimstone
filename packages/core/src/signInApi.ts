// A client for the sign-in contract the kit's apps share (`/api/signin/v1`).
// Every call answers with its value or with the kit's code as it came; the
// app says a code in its own words. An app that lives under a sub-path, such
// as /files/, names that root once, and every address follows it.

/** The codes the kit refuses with, as its contract lists them. */
export const SIGN_IN_ERRORS = [
  "accountOwner",
  "badRequest",
  "blocked",
  "caInvalid",
  "confirmOff",
  "crossSite",
  "forbidden",
  "fromConfig",
  "internal",
  "issuerInvalid",
  "lastWayIn",
  "nameInvalid",
  "nameTaken",
  "noAccount",
  "notFound",
  "notJSON",
  "notLocal",
  "notOwner",
  "notWithToken",
  "oneOwner",
  "passkeyRefused",
  "passkeysUnavailable",
  "passkeyUnknown",
  "passwordLong",
  "passwordSet",
  "passwordShort",
  "resetRefused",
  "roleUnknown",
  "scopeUnknown",
  "secretAgain",
  "secretMissing",
  "serviceChanged",
  "serviceOff",
  "serviceUnknown",
  "serviceUnreachable",
  "serviceUntested",
  "setPasswordFirst",
  "setupExpired",
  "signInAgain",
  "signInFirst",
  "stepExpired",
  "throttled",
  "tokenNameMissing",
  "tooLarge",
  "twoFactorOff",
  "wrongCode",
  "wrongPassword",
] as const;
export type SignInErrorCode = (typeof SIGN_IN_ERRORS)[number];

/** What went wrong before the kit could answer: the network, or a passkey prompt the person closed. */
export type SignInClientError = "offline" | "cancelled";

/** The codes a trip to a sign-in service comes back with, as `?signin=` on the return path. */
export const SIGN_IN_REDIRECTS = [
  "addressMissing",
  "blocked",
  "flowExpired",
  "identityTaken",
  "linked",
  "nameMissing",
  "nameTaken",
  "noAccount",
  "renewNeeded",
  "serviceChanged",
  "serviceOff",
  "serviceRefused",
  "serviceUnknown",
  "serviceUnreachable",
  "signInFirst",
  "testOk",
  "throttled",
] as const;
export type SignInRedirectCode = (typeof SIGN_IN_REDIRECTS)[number];

export type SignInVia = "open" | "password" | "passkey" | "service" | "token" | "door";

export interface SignInFailure {
  ok: false;
  /** The HTTP status, 0 when nothing came back. */
  status: number;
  error: SignInErrorCode | SignInClientError;
  /** Seconds, with `throttled`. */
  retryAfter?: number;
  /** With `signInAgain`: the app may ask for the password instead of a new sign-in. */
  askPassword?: boolean;
  /** The shortest password, with `passwordShort`. */
  min?: number;
  /** The scope the kit does not know, with `scopeUnknown`. */
  scope?: string;
}

export type SignInResult<T> = { ok: true; value: T } | SignInFailure;

export interface SignInVisitor {
  account?: string;
  name?: string;
  role: string;
  via: SignInVia;
  service?: string;
  scopes?: string[];
}

export interface SignInMe extends SignInVisitor {
  owner: boolean;
  password: boolean;
  twoFactor: boolean;
  recoveryLeft: number;
  /** Signed in moments ago, as new lasting ways in want. */
  fresh: boolean;
  askPassword: boolean;
}

/** The kit's answer to a new password. */
export interface SignInPasswordSet {
  /** The password is shorter than `minPassword`, which the kit takes all the same. */
  short?: boolean;
}

/** What the sign-in page offers. */
export interface SignInOffer {
  /** Nobody can sign in, so everyone is admin. */
  open: boolean;
  /** One local account, so the page asks for no name. */
  owner: boolean;
  /** The length from which the app stops suggesting a longer password. */
  minPassword: number;
  signedIn: boolean;
  /** Passkeys answer on this address, through the browser's offer in the password field. */
  passkeys: boolean;
  renew?: string;
  services: { id: string; provider: string; name: string }[];
}

export interface SignInSession {
  id: string;
  via: SignInVia;
  service?: string;
  created: string;
  seen: string;
  from?: string;
  agent?: string;
  current: boolean;
}

export interface SignInToken {
  id: string;
  name: string;
  scopes: string[];
  created: string;
  used?: string;
  expires?: string;
  /** Made while the app was open: it stands for the admin and ends when the app closes, by the first password or the first sign-in service. */
  endsWhenClosed?: boolean;
}

export interface SignInPasskey {
  id: string;
  name: string;
  created: string;
  used?: string;
  rpID: string;
  synced: boolean;
  /** Made for the address the app has today. */
  here: boolean;
}

export interface SignInIdentity {
  id: string;
  kind: "service";
  service?: string;
  name?: string;
  linked: string;
  seen?: string;
}

export interface SignInAccount {
  id: string;
  name: string;
  role: string;
  owner: boolean;
  via: SignInVia;
  service?: string;
  created: string;
  seen?: string;
  blocked: boolean;
  password: boolean;
  groups?: string[];
}

/** What the kit knows about a kind of sign-in service, by the identity catalog's id. */
export interface SignInPreset {
  id: string;
  scopes: string;
  nameClaim: string;
  groupsClaim: string;
}

export interface SignInServiceInput {
  provider?: string;
  name?: string;
  issuer?: string;
  clientId?: string;
  secret?: string;
  scopes?: string;
  nameClaim?: string;
  groupsClaim?: string;
  /** A PEM certificate to trust beside the system's. */
  ca?: string;
  on?: boolean;
  /** The role a newcomer from the service gets, one of `roles()`. */
  role?: string;
}

export interface SignInService {
  id: string;
  provider: string;
  name: string;
  issuer: string;
  clientId: string;
  secretSet: boolean;
  scopes: string;
  nameClaim: string;
  groupsClaim: string;
  ca: boolean;
  on: boolean;
  /** A reset took it off. */
  paused: boolean;
  tested: boolean;
  testedAt?: string;
  /** The address to register at the service. */
  redirect: string;
  /** The app sets it up in its configuration file, so only turning it on again after a reset changes it here. */
  fromConfig: boolean;
  /** The role a newcomer from the service gets. */
  role: string;
}

/** The app's roles, the admin first, and the one a new sign-in service hands its newcomers unless the form picks another. */
export interface SignInRoles {
  roles: string[];
  serviceRole: string;
}

export interface SignInLogEntry {
  at: string;
  account?: string;
  name?: string;
  via?: SignInVia;
  service?: string;
  from?: string;
  result: string;
  agent?: string;
  count?: number;
}

export interface SignInSettings {
  /** Before a change that wants a fresh sign-in, the app asks for the password instead. */
  askPassword: boolean;
}

/** What a reset took away. */
export interface SignInRemoved {
  tokens: number;
  passkeys: number;
  twoFactor: boolean;
  services: number;
}

export interface SignInReauthState {
  /** A change waits for the password. */
  asking: boolean;
  password: string;
  busy: boolean;
  /** Why the last password was refused. */
  error: SignInErrorCode | SignInClientError | null;
  /** Grows with every refusal, so the same refusal twice still shakes twice. */
  refused: number;
}

/**
 * The password question before a change the kit wants fresh. It asks only
 * while a window listens, so an app without one gets `signInAgain` back.
 */
export interface SignInReauth {
  state(): SignInReauthState;
  subscribe(listener: () => void): () => void;
  set(password: string): void;
  /** Confirms the password, and the waiting change runs again. */
  submit(): Promise<void>;
  /** The waiting change answers with its `signInAgain`. */
  cancel(): void;
}

export interface SignInApiOptions {
  /** The app's root path, such as `/` or `/files/`. */
  root?: string;
  fetch?: typeof fetch;
}

type Json = Record<string, unknown>;

export interface SignInApi {
  /** The app's root path with a trailing slash. */
  readonly root: string;
  readonly reauth: SignInReauth;
  /** Called after every change that went through, so every part showing the sign-in can read again. */
  subscribe(listener: () => void): () => void;

  options(): Promise<SignInResult<SignInOffer>>;
  login(password: string, name?: string): Promise<SignInResult<{ visitor?: SignInVisitor; step?: "code" }>>;
  loginCode(code: string): Promise<SignInResult<{ visitor: SignInVisitor }>>;
  /**
   * Lets the browser offer a passkey in the password field and signs in with
   * the one picked. `null` when the browser offers none here, or the offer
   * ended with `signal`.
   */
  offerPasskey(signal: AbortSignal): Promise<SignInResult<{ visitor: SignInVisitor }> | null>;
  logout(): Promise<SignInResult<Json>>;
  resetCode(): Promise<SignInResult<Json>>;
  reset(code: string, password: string, name?: string): Promise<SignInResult<{ visitor: SignInVisitor; removed: SignInRemoved }>>;
  /** Where the browser goes to sign in with a service, and comes back to `back` with `?signin=`. */
  serviceAddress(id: string, back: string): string;

  me(): Promise<SignInResult<SignInMe>>;
  setPassword(input: { next: string; current?: string; name?: string }): Promise<SignInResult<SignInPasswordSet>>;
  removePassword(current: string): Promise<SignInResult<Json>>;
  confirm(password: string): Promise<SignInResult<Json>>;
  sessions(): Promise<SignInResult<SignInSession[]>>;
  endOtherSessions(): Promise<SignInResult<{ ended?: number }>>;
  endSession(id: string): Promise<SignInResult<Json>>;
  startTwoFactor(): Promise<SignInResult<{ secret: string; uri: string }>>;
  confirmTwoFactor(code: string): Promise<SignInResult<{ codes: string[] }>>;
  stopTwoFactor(code: string): Promise<SignInResult<Json>>;
  newRecoveryCodes(): Promise<SignInResult<{ codes: string[] }>>;
  passkeys(): Promise<SignInResult<SignInPasskey[]>>;
  /** Asks the browser for a new passkey and keeps it under `name`. */
  addPasskey(name: string): Promise<SignInResult<{ id?: string }>>;
  renamePasskey(id: string, name: string): Promise<SignInResult<Json>>;
  removePasskey(id: string): Promise<SignInResult<Json>>;
  identities(): Promise<SignInResult<SignInIdentity[]>>;
  unlinkIdentity(id: string): Promise<SignInResult<Json>>;
  linkService(service: string, back: string): Promise<SignInResult<{ url: string }>>;
  tokens(): Promise<SignInResult<SignInToken[]>>;
  makeToken(input: { name: string; scopes: string[]; days?: number; never?: boolean }): Promise<SignInResult<{ token: SignInToken; value: string }>>;
  revokeToken(id: string): Promise<SignInResult<Json>>;

  accounts(): Promise<SignInResult<SignInAccount[]>>;
  addAccount(input: { name: string; password: string; role: string }): Promise<SignInResult<{ account: SignInAccount }>>;
  changeAccount(id: string, input: { blocked?: boolean; role?: string }): Promise<SignInResult<{ account: SignInAccount }>>;
  removeAccount(id: string): Promise<SignInResult<Json>>;
  roles(): Promise<SignInResult<SignInRoles>>;
  presets(): Promise<SignInResult<SignInPreset[]>>;
  services(): Promise<SignInResult<SignInService[]>>;
  addService(input: SignInServiceInput): Promise<SignInResult<{ service: SignInService }>>;
  changeService(id: string, input: SignInServiceInput): Promise<SignInResult<{ service: SignInService }>>;
  removeService(id: string): Promise<SignInResult<Json>>;
  checkService(id: string): Promise<SignInResult<Json>>;
  /** The address of the test sign-in, which binds the admin and turns the service on. */
  /** `role` is the newcomers' role the form shows; the kit answers `serviceChanged` when it is no longer the stored one. */
  testService(id: string, back: string, role?: string): Promise<SignInResult<{ url: string }>>;
  settings(): Promise<SignInResult<SignInSettings>>;
  changeSettings(input: Partial<SignInSettings>): Promise<SignInResult<SignInSettings>>;
  log(limit?: number): Promise<SignInResult<SignInLogEntry[]>>;
}

/** `/`, `/files` and `files/` all become a root with a slash at both ends. */
export function signInRoot(root = "/"): string {
  // Counted by hand, since /\/+$/ backtracks over every slash of a long run.
  let start = 0;
  let end = root.length;
  while (start < end && root[start] === "/") start++;
  while (end > start && root[end - 1] === "/") end--;
  return start < end ? `/${root.slice(start, end)}/` : "/";
}

/**
 * Takes the code a sign-in service sent back out of the address, so a reload
 * does not say it again. `null` when the address has none.
 */
export function takeSignInCode(): string | null {
  const url = new URL(location.href);
  const code = url.searchParams.get("signin");
  if (code === null) return null;
  url.searchParams.delete("signin");
  history.replaceState(history.state, "", url.pathname + url.search + url.hash);
  return code;
}

// WebAuthn speaks ArrayBuffers and the contract base64url.
function fromB64(s: string): ArrayBuffer {
  const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((s.length + 3) % 4));
  return Uint8Array.from(bin, (c) => c.charCodeAt(0)).buffer;
}

function toB64(b: ArrayBuffer): string {
  let bin = "";
  for (const byte of new Uint8Array(b)) bin += String.fromCharCode(byte);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

const withIds = (list: unknown) => ((list as { id: string }[] | undefined) ?? []).map((c) => ({ ...c, id: fromB64(c.id) }));

function credentialJson(c: PublicKeyCredential): Json {
  const r = c.response as AuthenticatorAttestationResponse & AuthenticatorAssertionResponse;
  const response: Json = { clientDataJSON: toB64(r.clientDataJSON) };
  if ("attestationObject" in r && r.attestationObject) {
    response.attestationObject = toB64(r.attestationObject);
    response.transports = r.getTransports?.() ?? [];
  } else {
    response.authenticatorData = toB64(r.authenticatorData);
    response.signature = toB64(r.signature);
    response.userHandle = r.userHandle ? toB64(r.userHandle) : null;
  }
  return {
    id: c.id,
    rawId: toB64(c.rawId),
    type: c.type,
    authenticatorAttachment: c.authenticatorAttachment,
    clientExtensionResults: c.getClientExtensionResults(),
    response,
  };
}

const failure = (status: number, body: Json): SignInFailure => {
  const out: SignInFailure = { ok: false, status, error: (typeof body.error === "string" ? body.error : "internal") as SignInErrorCode };
  for (const key of ["retryAfter", "min"] as const) if (typeof body[key] === "number") out[key] = body[key];
  if (typeof body.askPassword === "boolean") out.askPassword = body.askPassword;
  if (typeof body.scope === "string") out.scope = body.scope;
  return out;
};

function createReauth(confirm: (password: string) => Promise<SignInResult<Json>>) {
  let state: SignInReauthState = { asking: false, password: "", busy: false, error: null, refused: 0 };
  const listeners = new Set<() => void>();
  let waiting: ((confirmed: boolean) => void) | null = null;
  const update = (change: Partial<SignInReauthState>) => {
    state = { ...state, ...change };
    listeners.forEach((fn) => fn());
  };
  const settle = (confirmed: boolean) => {
    const resume = waiting;
    waiting = null;
    update({ asking: false, password: "", busy: false, error: null });
    resume?.(confirmed);
  };
  const reauth: SignInReauth = {
    state: () => state,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    set: (password) => update({ password, error: null }),
    async submit() {
      if (!state.asking || state.busy || state.password === "") return;
      update({ busy: true, error: null });
      const r = await confirm(state.password);
      if (r.ok) settle(true);
      else update({ busy: false, error: r.error, refused: state.refused + 1 });
    },
    cancel: () => settle(false),
  };
  // Two changes that both want the password share one question.
  let pending: Promise<boolean> | null = null;
  const ask = (): Promise<boolean> => {
    if (listeners.size === 0) return Promise.resolve(false);
    pending ??= new Promise<boolean>((resolve) => {
      waiting = resolve;
      update({ asking: true, password: "", error: null });
    }).finally(() => (pending = null));
    return pending;
  };
  return { reauth, ask };
}

export function createSignInApi(options: SignInApiOptions = {}): SignInApi {
  const root = signInRoot(options.root);
  const base = `${root}api/signin/v1/`;
  const doFetch = options.fetch ?? ((input, init) => globalThis.fetch(input, init));
  const changed = new Set<() => void>();

  async function send(method: string, path: string, body?: unknown): Promise<{ status: number; body: Json }> {
    const init: RequestInit = { method, credentials: "same-origin", headers: {} };
    if (body !== undefined) {
      init.body = JSON.stringify(body);
      init.headers = { "Content-Type": "application/json" };
    }
    let r: Response;
    try {
      r = await doFetch(base + path, init);
    } catch {
      return { status: 0, body: { error: "offline" } };
    }
    let parsed: Json = {};
    try {
      parsed = (await r.json()) as Json;
    } catch {
      // An empty answer is a done one.
    }
    return { status: r.status, body: parsed };
  }

  async function call<T>(method: string, path: string, body?: unknown, pick: (b: Json) => T = (b) => b as T): Promise<SignInResult<T>> {
    let r = await send(method, path, body);
    if (r.body.error === "signInAgain" && r.body.askPassword === true && path !== "me/confirm" && (await ask())) r = await send(method, path, body);
    if (r.status < 200 || r.status >= 300) return failure(r.status, r.body);
    if (method !== "GET") changed.forEach((fn) => fn());
    return { ok: true, value: pick(r.body) };
  }

  const get = <T>(path: string, pick?: (b: Json) => T) => call<T>("GET", path, undefined, pick);
  const list = <T>(key: string) => (b: Json) => (b[key] as T[] | undefined) ?? [];
  const at = (path: string, id: string) => `${path}/${encodeURIComponent(id)}`;

  const { reauth, ask } = createReauth((password) => call<Json>("POST", "me/confirm", { password }));

  return {
    root,
    reauth,
    subscribe(listener) {
      changed.add(listener);
      return () => changed.delete(listener);
    },

    options: () => get<SignInOffer>("options"),
    login: (password, name) => call("POST", "login", name === undefined ? { password } : { name, password }),
    loginCode: (code) => call("POST", "login/totp", { code: code.trim() }),
    async offerPasskey(signal) {
      const pk = globalThis.PublicKeyCredential;
      if (!pk?.isConditionalMediationAvailable || !(await pk.isConditionalMediationAvailable()) || signal.aborted) return null;
      const start = await call<{ publicKey: Json }>("POST", "login/passkey/options", {});
      if (!start.ok || signal.aborted) return null;
      const key = start.value.publicKey;
      let cred: Credential | null;
      try {
        cred = await navigator.credentials.get({
          mediation: "conditional",
          signal,
          publicKey: { ...key, challenge: fromB64(key.challenge as string), allowCredentials: withIds(key.allowCredentials) } as PublicKeyCredentialRequestOptions,
        });
      } catch {
        return null;
      }
      if (!cred) return null;
      return call("POST", "login/passkey", credentialJson(cred as PublicKeyCredential));
    },
    logout: () => call("POST", "logout", {}),
    resetCode: () => call("POST", "reset-code", {}),
    reset: (code, password, name) => call("POST", "reset", name === undefined ? { code, password } : { code, password, name }),
    serviceAddress: (id, back) => `${root}signin/oidc/${encodeURIComponent(id)}?return=${encodeURIComponent(back)}`,

    me: () => get<SignInMe>("me"),
    setPassword: (input) => call("PUT", "me/password", input),
    removePassword: (current) => call("DELETE", "me/password", { current }),
    confirm: (password) => call("POST", "me/confirm", { password }),
    sessions: () => get("me/sessions", list<SignInSession>("sessions")),
    endOtherSessions: () => call("DELETE", "me/sessions"),
    endSession: (id) => call("DELETE", at("me/sessions", id)),
    startTwoFactor: () => call("POST", "me/totp", {}),
    confirmTwoFactor: (code) => call("POST", "me/totp/confirm", { code: code.trim() }),
    stopTwoFactor: (code) => call("DELETE", "me/totp", { code: code.trim() }),
    newRecoveryCodes: () => call("POST", "me/totp/codes", {}),
    passkeys: () => get("me/passkeys", list<SignInPasskey>("passkeys")),
    async addPasskey(name) {
      if (!globalThis.PublicKeyCredential) return { ok: false, status: 0, error: "passkeysUnavailable" };
      const start = await call<{ publicKey: Json }>("POST", "me/passkeys/options", {});
      if (!start.ok) return start;
      const key = start.value.publicKey;
      const user = key.user as Json;
      let cred: Credential | null;
      try {
        cred = await navigator.credentials.create({
          publicKey: {
            ...key,
            challenge: fromB64(key.challenge as string),
            user: { ...user, id: fromB64(user.id as string) },
            excludeCredentials: withIds(key.excludeCredentials),
          } as PublicKeyCredentialCreationOptions,
        });
      } catch {
        cred = null;
      }
      if (!cred) return { ok: false, status: 0, error: "cancelled" };
      return call("POST", "me/passkeys", { name, credential: credentialJson(cred as PublicKeyCredential) });
    },
    renamePasskey: (id, name) => call("PATCH", at("me/passkeys", id), { name }),
    removePasskey: (id) => call("DELETE", at("me/passkeys", id)),
    identities: () => get("me/identities", list<SignInIdentity>("identities")),
    unlinkIdentity: (id) => call("DELETE", at("me/identities", id)),
    linkService: (service, back) => call("POST", `${at("me/identities", service)}/link`, { return: back }),
    tokens: () => get("me/tokens", list<SignInToken>("tokens")),
    makeToken: (input) => call("POST", "me/tokens", input),
    revokeToken: (id) => call("DELETE", at("me/tokens", id)),

    accounts: () => get("accounts", list<SignInAccount>("accounts")),
    addAccount: (input) => call("POST", "accounts", input),
    changeAccount: (id, input) => call("PATCH", at("accounts", id), input),
    removeAccount: (id) => call("DELETE", at("accounts", id)),
    roles: () => get<SignInRoles>("roles"),
    presets: () => get("methods/presets", list<SignInPreset>("presets")),
    services: () => get("methods/oidc", list<SignInService>("services")),
    addService: (input) => call("POST", "methods/oidc", input),
    changeService: (id, input) => call("PATCH", at("methods/oidc", id), input),
    removeService: (id) => call("DELETE", at("methods/oidc", id)),
    checkService: (id) => call("POST", `${at("methods/oidc", id)}/check`, {}),
    testService: (id, back, role) => call("POST", `${at("methods/oidc", id)}/test`, { return: back, ...(role ? { role } : {}) }),
    settings: () => get<SignInSettings>("settings"),
    changeSettings: (input) => call("PATCH", "settings", input),
    log: (limit) => get(limit === undefined ? "log" : `log?limit=${limit}`, list<SignInLogEntry>("entries")),
  };
}
