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
]

# The lit tile's drawing, by id: a Simple Icons slug, or None for <id>-hover.svg.
HOVER = {
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
}

MARKS = MarkSet(ROOT / "packages" / "core" / "vpn-marks", {}, set(), TILE_COLOUR, set())

if SRC is None or not SRC.is_dir():
    raise SystemExit("pass the icons folder of simple-icons@16: python scripts/gen_vpn_marks.py <path>")

data = simple_data(SRC)
hovers = {
    slug: simple_hover(slug, si_slug, SRC, data) if si_slug else local_hover(slug, MARKS)
    for slug, si_slug in HOVER.items()
}
entries = {m[0]: simple(*m, SRC, data, MARKS, hover=hovers.get(m[0])) for m in SIMPLE}
entries.update({m[0]: local(*m, MARKS, hover=hovers.get(m[0])) for m in LOCAL})
ids = write(OUT, HEAD, entries, "VPN_MARKS", "VpnMarkId")
print("%s: %d marks (%d from Simple Icons, %d from vpn-marks/, %d with a drawing for the lit tile)"
      % (OUT.name, len(ids), len(SIMPLE), len(LOCAL), len(hovers)))
