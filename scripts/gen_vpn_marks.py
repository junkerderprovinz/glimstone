"""Generate the VPN providers' marks in packages/core/src/vpnMarks.ts.

    npm pack simple-icons@16 somewhere and unpack it, then:
    python scripts/gen_vpn_marks.py <path to simple-icons/icons>

Two kinds of source, as for the storage providers' marks. The SIMPLE ones come
from Simple Icons, whose icons are CC0 unless the set names another licence for
one, which the generated comment then carries. The rest are whole SVG files in
packages/core/vpn-marks/, each with its source and licence recorded below and
in that folder's README. A logo whose colours flatten into one blot on a lit
tile brings its brand's single-colour version, from Simple Icons or as
`<id>-hover.svg` beside the logo, as the drawing that tile shows. Every mark is
a trademark of its owner, used only to name the provider it refers to, on a
tile that picks exactly that provider, reproduced unmodified apart from its
colour, with no claim of endorsement by or affiliation with any of them.

The machinery is in brand_marks.py, which needs the svgelements package (pip
install svgelements).
"""
import sys
from pathlib import Path

from brand_marks import BRAND, MarkSet, local, local_hover, simple, simple_data, simple_hover, write

ROOT = Path(__file__).parent.parent
SRC = Path(sys.argv[1]) if len(sys.argv) > 1 else None
OUT = ROOT / "packages" / "core" / "src" / "vpnMarks.ts"

DASHBOARD = "Apache-2.0"
SELFHST = "CC-BY-4.0"

# The id a catalog entry names its mark by -> the Simple Icons slug, with what it is.
SIMPLE = [
    ("avast", "avast", "Avast, for SecureLine VPN"),
    ("avira", "avira", "Avira, for Phantom VPN"),
    ("bitdefender", "bitdefender", "Bitdefender, for its VPN"),
    ("expressvpn", "expressvpn", "ExpressVPN"),
    ("mcafee", "mcafee", "McAfee, for its VPN"),
    ("mozilla", "mozilla", "Mozilla, for Mozilla VPN"),
    ("mullvad", "mullvad", "Mullvad"),
    ("nordvpn", "nordvpn", "NordVPN"),
    ("norton", "norton", "Norton, for its VPN"),
    ("pia", "privateinternetaccess", "Private Internet Access"),
    ("surfshark", "surfshark", "Surfshark"),
    ("wireguard", "wireguard", "WireGuard, for a configuration of one's own"),
]

# The id -> the file in vpn-marks/, what it is, where it comes from, its licence.
LOCAL = [
    ("airvpn", "AirVPN", "homarr-labs/dashboard-icons, svg/airvpn.svg", DASHBOARD),
    ("protonvpn", "Proton VPN", "homarr-labs/dashboard-icons, svg/proton-vpn.svg", DASHBOARD),
    ("ivpn", "IVPN", "ivpn/desktop-app, ui/References/Linux/ui/ivpnicon.svg", "GPL-3.0"),
    ("kaspersky", "Kaspersky, for its VPN", "Wikimedia Commons, File:Kaspersky icon.svg", "public domain"),
    ("fsecure", "F-Secure, for its VPN",
     "F-Secure's media kit, f-secure_2023_logo.zip, F-SECURE_LOGO_VERTICAL_POSITIVE_RGB.svg without the word", BRAND),
    ("purevpn", "PureVPN", "PureVPN's press room, PureVPN.zip, vpn original.svg without the word", BRAND),

    ("azirevpn", "AzireVPN", "selfhst/icons, svg/azirevpn.svg", SELFHST),
    ("ipvanish", "IPVanish", "selfhst/icons, svg/ipvanish.svg", SELFHST),
    ("njalla", "Njalla VPN", "selfhst/icons, svg/njalla.svg", SELFHST),
    ("ovpn", "OVPN", "selfhst/icons, svg/ovpn.svg", SELFHST),
    ("privadovpn", "PrivadoVPN", "selfhst/icons, svg/privadovpn.svg", SELFHST),

    ("cactusvpn", "CactusVPN", "cactusvpn.com, images/logo.svg without the word", BRAND),
    ("cyberghost", "CyberGhost", "cyberghostvpn.com, navigation/icons/logo-cyberghost.svg without the word", BRAND),
    ("hideme", "hide.me", "hide.me, favicon.svg", BRAND),
    ("hma", "HMA VPN", "hidemyass.com, the hma-logo symbol in its page header", BRAND),
    ("hotspotshield", "Hotspot Shield", "hotspotshield.com, imgs/hotspot-shield-logo.1.0.0.svg without the word", BRAND),
    ("levpn", "Le VPN", "le-vpn.com, icons/favicon.svg", BRAND),
    ("obscura", "Obscura VPN", "obscura.com, favicon.svg", BRAND),
    ("privatevpn", "PrivateVPN", "privatevpn.com, logotype_light.svg without the word", BRAND),
    ("strongvpn", "StrongVPN", "strongvpn.com, uploads/2023/01/logo.svg without the word", BRAND),
    ("trustzone", "Trust.Zone", "trust.zone, images/favicon/safari-pinned-tab.svg", BRAND),
    ("unlocator", "Unlocator VPN", "unlocator.com, logo.svg without the word", BRAND),
    ("vpnunlimited", "VPN Unlimited", "vpnunlimited.com, svg/vpnu_mark.svg", BRAND),
    ("vyprvpn", "VyprVPN", "vyprvpn.com, images/vyprvpn_logo.svg without the word", BRAND),
    ("windscribe", "Windscribe", "windscribe.com, images/badge-logo.svg", BRAND),
    ("xvpn", "X-VPN", "xvpn.io, safari-pinned-tab.svg", BRAND),
    ("zoogvpn", "ZoogVPN", "zoogvpn.com, ZoogVPN-darck-logo.svg without the word", BRAND),
    ("anonine", "Anonine", "the logo of anonine.com as an SVG, without the tagline under the name", BRAND),
    ("astrill", "Astrill VPN", "astrill.com, the white logo in its page header", BRAND),
    ("ivacy", "Ivacy VPN", "ivacy.com, the logo in its page header without the word", BRAND),
    ("torguard", "TorGuard", "torguard.net, images/logo.svg, the padlock without the word", BRAND),
    ("tunnelbear", "TunnelBear", "tunnelbear.com, static/img/tunnelbear-app-DXzLP4Lt.svg", BRAND),
    ("turbovpn", "Turbo VPN", "the rabbit of Turbo VPN's logo as an SVG", BRAND),
    ("vpnac", "VPN.ac", "vpn.ac, assets/images/logo.svg, the AC badge without the word", BRAND),
    ("xeovo", "Xeovo", "xeovo.com, static/images/logo_hidden.svg", BRAND),

    ("cryptostorm", "cryptostorm", "traced from the figure of cryptostorm's logo, privacysharks.com, "
     "wp-content/uploads/2021/12/cryptostorm-vpn-189x160.png, without the word", BRAND),
    ("fastestvpn", "FastestVPN", "traced from FastestVPN's app icon, which has no vector", BRAND),
]

# The marks that are the brand's name written out.
WORDMARK = {"anonine", "astrill"}

# The lit tile's drawing, by id: a Simple Icons slug, or None for <id>-hover.svg.
HOVER = {
    "ipvanish": None,
    "levpn": None,
    "privadovpn": None,
    "protonvpn": "protonvpn",
    "purevpn": None,
}

HEAD = """// The marks of VPN providers, as markup for BrandMark, each with the colour
// its tile lights up in and the ink that holds on it ("Brand tiles"). Written
// by scripts/gen_vpn_marks.py; packages/core/vpn-marks/ holds the sources,
// their licences and the README that records where each came from.
//
// Every mark is a trademark of its owner, used only to name the provider it
// refers to, on a tile that picks exactly that provider, reproduced unmodified
// apart from its colour, with no claim of endorsement by or affiliation with
// any of them. The VPN catalog names the mark each provider wears; a provider
// whose brand has no clean source wears the app's glyph instead.

import type { TileMark } from "./picker.ts";
"""

TILE_COLOUR = {
    # Proton's violet rather than the pale lilac its gradient covers most with.
    "protonvpn": ("#6d4aff", None),
    # Single-colour marks, lit in the colour each brand's own site gives them.
    "hma": ("#0059a5", None),
    "trustzone": ("#005a88", None),
    "windscribe": ("#1c2332", None),
    "xvpn": ("#000000", None),
    # White and pale logos, lit in the colour each brand's own site sets them on.
    "astrill": ("#34448b", None),
    "xeovo": ("#06de6b", None),
    # TorGuard's white padlock, lit in the green of the TOR in its name.
    "torguard": ("#63de03", None),
    # Ivacy's blue rather than the cyan of the shield's other half.
    "ivacy": ("#21a7f4", None),
    # VyprVPN's orange rather than black, a hair lighter so the near-black ink
    # reaches 9:1 on it.
    "vyprvpn": ("#fba81f", None),
}

FORCE_THEMED = {
    # Njalla's navy, which its green stroke keeps from being lifted, in white on
    # the dark ground.
    "njalla": {"#203742": ("#ffffff", "#203742")},
    # Anonine's near-black name, whose faint blue would lift to a dull violet,
    # in white on the dark ground.
    "anonine": {"#1C1D29": ("#ffffff", "#1C1D29")},
    # Astrill's white logo in the blue of its own site on the light ground.
    "astrill": {"#FFF": ("#ffffff", "#34448b")},
    # FastestVPN's two yellows, which fade into a light tile, deepened as a pair
    # so the fold in the bolt stays where it is.
    "fastestvpn": {"#fec32b": ("#fec32b", "#a67c00"), "#e7b228": ("#e7b228", "#8a6400")},
}

MARKS = MarkSet(ROOT / "packages" / "core" / "vpn-marks", FORCE_THEMED, set(), TILE_COLOUR, set())

if SRC is None or not SRC.is_dir():
    raise SystemExit("pass the icons folder of simple-icons@16: python scripts/gen_vpn_marks.py <path>")

data = simple_data(SRC)
hovers = {
    slug: simple_hover(slug, si_slug, SRC, data) if si_slug else local_hover(slug, MARKS)
    for slug, si_slug in HOVER.items()
}
entries = {m[0]: simple(*m, SRC, data, MARKS, hover=hovers.get(m[0])) for m in SIMPLE}
entries.update({m[0]: local(*m, MARKS, hover=hovers.get(m[0]), wordmark=m[0] in WORDMARK) for m in LOCAL})
ids = write(OUT, HEAD, entries, "VPN_MARKS", "VpnMarkId")
print("%s: %d marks (%d from Simple Icons, %d from vpn-marks/, %d with a drawing for the lit tile)"
      % (OUT.name, len(ids), len(SIMPLE), len(LOCAL), len(hovers)))
