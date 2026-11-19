// The VPN tiles the picker demo words itself: the own configuration, which
// takes any WireGuard server and stands last.
import type { VpnProviderId } from "@glimstone/core/vpnProviders";

export const VPN_LAST = ["custom"] as const satisfies readonly VpnProviderId[];
