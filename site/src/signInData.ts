// A made-up kit for the sign-in demos: one owner with the password "letmein",
// two sessions, a passkey, a token and three sign-in services: Pocket ID, on
// and named after its kind; one with a name of its own, not tested yet; and one
// of no kind the catalog knows, from the app's configuration file, which a
// reset paused.
// Every demo gets a kit of its own, so the frameworks side by side never
// share a change. A change that wants a fresh sign-in asks for the password
// once, and a test sign-in comes back as if it had worked.
import {
  signInTileTextEn,
  type SignInAccount,
  type SignInApi,
  type SignInFailure,
  type SignInMe,
  type SignInPasskey,
  type SignInResult,
  type SignInService,
  type SignInSession,
  type SignInToken,
} from "@glimstone/core";
import { IDENTITY_PROVIDERS } from "@glimstone/core/identityProviders";

export const PASSWORD = "letmein";

export { IDENTITY_PROVIDERS };

export const TILE_TEXT = { ...signInTileTextEn, roles: { admin: "Admin", user: "Member" } };

const FORMAT = new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" });

/** The demos' dates, the same on every machine. */
export const demoTime = (iso: string) => FORMAT.format(new Date(iso));

const FIREFOX = "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0";
const PHONE = "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Mobile Safari/537.36";

const ok = <T>(value: T): SignInResult<T> => ({ ok: true, value });
const no = (error: SignInFailure["error"], status: number, more: Partial<SignInFailure> = {}): SignInFailure => ({ ok: false, status, error, ...more });

function service(id: string, provider: string, name: string, on: boolean): SignInService {
  return {
    id,
    provider,
    name,
    issuer: `https://${provider.replace("-", "")}.example`,
    clientId: "glimstone",
    secretSet: true,
    scopes: "openid profile email groups",
    nameClaim: "preferred_username",
    groupsClaim: "groups",
    ca: false,
    on,
    paused: false,
    tested: on,
    testedAt: on ? "2026-11-18T09:12:00Z" : undefined,
    redirect: "https://glimstone.example/signin/oidc/callback",
    fromConfig: false,
    role: "admin",
  };
}

export type DemoScene = "signedIn" | "open" | "fresh" | "service";

/**
 * A kit for one demo. `signedIn` is the owner, who signed in a while ago, so
 * new ways in ask for the password; `fresh` signed in moments ago; `open` has
 * no password yet; `service` is an account that signs in through Pocket ID and
 * has no password here.
 */
export function demoKit(scene: DemoScene = "signedIn"): SignInApi & { leave(url: string): void } {
  const open = scene === "open";
  const outside = scene === "service";
  let fresh = scene !== "signedIn";
  const me: SignInMe = {
    account: open ? undefined : outside ? "a2" : "owner",
    name: open ? undefined : outside ? "sam" : "owner",
    role: "admin",
    via: open ? "open" : outside ? "service" : "password",
    service: outside ? "pocket" : undefined,
    owner: !outside,
    password: !open && !outside,
    twoFactor: false,
    recoveryLeft: 0,
    fresh,
    askPassword: true,
  };
  let askPassword = true;
  let sessions: SignInSession[] = open
    ? []
    : [
        { id: "s1", via: "password", created: "2026-11-21T08:02:00Z", seen: "2026-11-21T10:40:00Z", from: "192.168.20.14", agent: FIREFOX, current: true },
        { id: "s2", via: "service", service: "pocket", created: "2026-11-19T18:30:00Z", seen: "2026-11-20T21:05:00Z", from: "192.168.20.31", agent: PHONE, current: false },
      ];
  let passkeys: SignInPasskey[] = open || outside ? [] : [{ id: "p1", name: "Firefox on Windows", created: "2026-11-02T14:20:00Z", used: "2026-11-20T07:55:00Z", rpID: "glimstone.example", synced: true, here: true }];
  let tokens: SignInToken[] = open || outside ? [] : [{ id: "t1", name: "Backup script", scopes: ["read"], created: "2026-10-28T12:00:00Z", used: "2026-11-21T03:00:00Z", expires: "2027-01-26T12:00:00Z" }];
  let services: SignInService[] = open
    ? []
    : [
        service("pocket", "pocket-id", "", true),
        service("authentik", "authentik", "Home login", false),
        { ...service("config", "custom", "", false), fromConfig: true, paused: true, tested: true, testedAt: "2026-11-12T08:30:00Z" },
      ];
  let accounts: SignInAccount[] = open
    ? []
    : [
        { id: "owner", name: "owner", role: "admin", owner: true, via: "password", created: "2026-09-01T10:00:00Z", seen: "2026-11-21T10:40:00Z", blocked: false, password: true },
        { id: "a2", name: "sam", role: "admin", owner: false, via: "service", service: "pocket", created: "2026-11-10T16:00:00Z", seen: "2026-11-20T21:05:00Z", blocked: false, password: false, groups: ["family"] },
      ];
  const listeners = new Set<() => void>();
  const changed = () => listeners.forEach((fn) => fn());
  let nextId = 1;

  // The question waits for the window, as the real client's does.
  let state = { asking: false, password: "", busy: false, error: null as SignInFailure["error"] | null, refused: 0 };
  const waiting = new Set<() => void>();
  let resume: ((yes: boolean) => void) | null = null;
  const tell = (change: Partial<typeof state>) => {
    state = { ...state, ...change };
    waiting.forEach((fn) => fn());
  };
  const reauth: SignInApi["reauth"] = {
    state: () => state,
    subscribe(fn) {
      waiting.add(fn);
      return () => waiting.delete(fn);
    },
    set: (password) => tell({ password, error: null }),
    async submit() {
      if (state.password !== PASSWORD) return tell({ error: "wrongPassword", refused: state.refused + 1 });
      fresh = true;
      const go = resume;
      resume = null;
      tell({ asking: false, password: "", error: null });
      go?.(true);
    },
    cancel() {
      const go = resume;
      resume = null;
      tell({ asking: false, password: "", error: null });
      go?.(false);
    },
  };
  // A new lasting way in wants a sign-in from moments ago.
  async function lasting<T>(work: () => SignInResult<T>): Promise<SignInResult<T>> {
    if (!fresh) {
      const yes =
        waiting.size > 0 &&
        (await new Promise<boolean>((done) => {
          resume = done;
          tell({ asking: true });
        }));
      if (!yes) return no("signInAgain", 403, { askPassword: true });
    }
    return work();
  }
  const change = <T>(value: T): SignInResult<T> => {
    changed();
    return ok(value);
  };
  const needsPassword = () => (open && !me.password ? no("setPasswordFirst", 409) : null);

  return {
    root: "/",
    reauth,
    subscribe(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    leave() {
      fresh = true;
    },
    options: async () => ok({ open: me.via === "open" && !me.password, owner: true, minPassword: 12, signedIn: !open, passkeys: passkeys.length > 0, services: services.filter((s) => s.on).map(({ id, provider, name }) => ({ id, provider, name })) }),
    login: async (password) => (password === PASSWORD ? ok({ visitor: me }) : no("wrongPassword", 401)),
    loginCode: async () => no("wrongCode", 401),
    offerPasskey: (signal) => new Promise((done) => signal.addEventListener("abort", () => done(null))),
    logout: async () => ok({}),
    resetCode: async () => ok({}),
    reset: async () => ok({ visitor: me, removed: { tokens: tokens.length, passkeys: passkeys.length, twoFactor: me.twoFactor, services: services.length } }),
    serviceAddress: (id, back) => `/signin/oidc/${id}?return=${encodeURIComponent(back)}`,
    me: async () => ok({ ...me, fresh }),
    async setPassword({ current, next }) {
      if (me.password && current !== PASSWORD) return no("wrongPassword", 401);
      if (next.length < 12) return no("passwordShort", 400, { min: 12 });
      Object.assign(me, { password: true, via: "password", account: "owner", name: "owner" });
      return change({});
    },
    async removePassword(current) {
      if (current !== PASSWORD) return no("wrongPassword", 401);
      Object.assign(me, { password: false, twoFactor: false, via: "open" });
      passkeys = [];
      tokens = [];
      services = services.map((s) => ({ ...s, on: false }));
      return change({});
    },
    confirm: async (password) => (password === PASSWORD ? ok({}) : no("wrongPassword", 401)),
    sessions: async () => ok(sessions),
    async endOtherSessions() {
      const ended = sessions.filter((s) => !s.current).length;
      sessions = sessions.filter((s) => s.current);
      return change({ ended });
    },
    async endSession(id) {
      sessions = sessions.filter((s) => s.id !== id);
      return change({});
    },
    startTwoFactor: () => lasting(() => ok({ secret: "JBSWY3DPEHPK3PXPJBSWY3DP", uri: "otpauth://totp/GlimStone:owner?secret=JBSWY3DPEHPK3PXPJBSWY3DP&issuer=GlimStone" })),
    async confirmTwoFactor(code) {
      if (code !== "123456") return no("wrongCode", 401);
      Object.assign(me, { twoFactor: true, recoveryLeft: 10 });
      return change({ codes: ["7K2M9-QW4XR", "H3T8N-PZ6CV", "R9D2F-K7MBX", "W5Y3J-T8QNA", "C6V4P-M2HRZ", "N8B7K-X3FWD", "Q2Z9R-H5TJM", "F4X6C-V8NPY", "J7P3W-D2KQB", "T5M8H-R9ZXC"] });
    },
    async stopTwoFactor(code) {
      if (code !== "123456") return no("wrongCode", 401);
      Object.assign(me, { twoFactor: false, recoveryLeft: 0 });
      return change({});
    },
    newRecoveryCodes: () =>
      lasting(() => {
        me.recoveryLeft = 10;
        return change({ codes: ["B4N7X-K2PQM", "Z8R3C-W6TJH", "M5V9F-Q2XND", "P7K4T-H3ZRB", "X2W8J-N6CFM", "D9Q5R-T4KVY", "H6Z2M-B8PXC", "K3F7N-V5QWT", "R8C4X-J2MZD", "W5T9B-P7HNK"] });
      }),
    passkeys: async () => ok(passkeys),
    addPasskey: (name) =>
      lasting(() => {
        const id = `p${++nextId}`;
        passkeys = [...passkeys, { id, name, created: "2026-11-21T10:45:00Z", rpID: "glimstone.example", synced: false, here: true }];
        return change({ id });
      }),
    async renamePasskey(id, name) {
      passkeys = passkeys.map((p) => (p.id === id ? { ...p, name } : p));
      return change({});
    },
    async removePasskey(id) {
      passkeys = passkeys.filter((p) => p.id !== id);
      return change({});
    },
    identities: async () => ok([]),
    unlinkIdentity: async () => ok({}),
    linkService: async () => no("forbidden", 403),
    tokens: async () => ok(tokens),
    makeToken: (input) =>
      lasting(() => {
        const token = { id: `t${++nextId}`, name: input.name, scopes: input.scopes, created: "2026-11-21T10:45:00Z", expires: input.never ? undefined : "2027-02-19T10:45:00Z" };
        tokens = [...tokens, token];
        return change({ token, value: `gs_${token.id}Xq7fK2mWp9RtV4nYc8Hd` });
      }),
    async revokeToken(id) {
      tokens = tokens.filter((t) => t.id !== id);
      return change({});
    },
    accounts: async () => ok(accounts),
    addAccount: async () => no("forbidden", 403),
    async changeAccount(id, input) {
      accounts = accounts.map((a) => (a.id === id ? { ...a, blocked: input.blocked ?? a.blocked } : a));
      return change({ account: accounts.find((a) => a.id === id)! });
    },
    async removeAccount(id) {
      accounts = accounts.filter((a) => a.id !== id);
      return change({});
    },
    roles: async () => ok({ roles: ["admin", "user"], serviceRole: "user" }),
    presets: async () =>
      ok([
        ...IDENTITY_PROVIDERS.entries.map((e) => ({ id: e.id, scopes: "openid profile email groups", nameClaim: "preferred_username", groupsClaim: "groups" })),
        { id: "custom", scopes: "openid profile email", nameClaim: "preferred_username", groupsClaim: "groups" },
      ]),
    services: async () => needsPassword() ?? ok(services),
    addService: (input) =>
      lasting(() => {
        const { secret, ca, ...rest } = input;
        const made: SignInService = { ...service(`svc${++nextId}`, input.provider ?? "custom", input.name ?? input.provider ?? "", false), ...rest, secretSet: !!secret, ca: !!ca, on: false, tested: false };
        services = [...services, made];
        return change({ service: made });
      }),
    async changeService(id, input) {
      if (input.role !== undefined && !["admin", "user"].includes(input.role)) return no("roleUnknown", 400);
      const was = services.find((s) => s.id === id);
      if (!was) return no("notFound", 404);
      if (was.fromConfig && (input.on !== true || Object.keys(input).length > 1)) return no("fromConfig", 409);
      if (input.on && !was.tested) return no("serviceUntested", 409);
      const { secret, ca, ...rest } = input;
      services = services.map((s) => (s.id === id ? { ...s, ...rest, secretSet: s.secretSet || !!secret, ca: s.ca || !!ca, paused: input.on ? false : s.paused } : s));
      return change({ service: services.find((s) => s.id === id)! });
    },
    async removeService(id) {
      if (services.find((s) => s.id === id)?.fromConfig) return no("fromConfig", 409);
      services = services.filter((s) => s.id !== id);
      return change({});
    },
    checkService: async (id) => (services.find((s) => s.id === id)?.issuer.includes("unreachable") ? no("serviceUnreachable", 502) : ok({})),
    async testService(id, back) {
      services = services.map((s) => (s.id === id ? { ...s, tested: true, on: true, testedAt: "2026-11-21T10:46:00Z" } : s));
      return ok({ url: `${back}?signin=testOk` });
    },
    settings: async () => (open ? no("setPasswordFirst", 409) : ok({ askPassword })),
    async changeSettings(input) {
      askPassword = input.askPassword ?? askPassword;
      return change({ askPassword });
    },
    log: async () => ok([]),
  };
}
