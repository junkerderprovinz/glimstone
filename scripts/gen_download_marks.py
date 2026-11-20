"""Generate the download services' marks in packages/core/src/downloadMarks.ts.

    npm pack simple-icons@16 somewhere and unpack it, then:
    python scripts/gen_download_marks.py <path to simple-icons/icons>

Two kinds of source, as for the storage providers' marks. The SIMPLE ones come
from Simple Icons, whose icons are CC0 unless the set names another licence for
one, which the generated comment then carries. The rest are whole SVG files in
packages/core/download-marks/, each with its source and licence recorded below
and in that folder's README. Every mark is a trademark of its owner, used only
to name the provider it refers to, on a tile that picks exactly that provider,
reproduced unmodified apart from its colour, with no claim of endorsement by or
affiliation with any of them.

The machinery is in brand_marks.py, which needs the svgelements package (pip
install svgelements).
"""
import sys
from pathlib import Path

from brand_marks import BRAND, MarkSet, local, local_hover, simple, simple_data, write

ROOT = Path(__file__).parent.parent
SRC = Path(sys.argv[1]) if len(sys.argv) > 1 else None
OUT = ROOT / "packages" / "core" / "src" / "downloadMarks.ts"

DASHBOARD = "Apache-2.0"

# The id a catalog entry names its mark by -> the Simple Icons slug, with what it is.
SIMPLE = [
    ("debridlink", "debridlink", "Debrid-Link"),
    ("mediafire", "mediafire", "MediaFire"),
]

# The id -> the file in download-marks/, what it is, where it comes from, its licence.
LOCAL = [
    ("mega", "MEGA", "homarr-labs/dashboard-icons, svg/mega-nz.svg", DASHBOARD),
    ("premiumize", "premiumize.me", "homarr-labs/dashboard-icons, svg/premiumize.svg", DASHBOARD),
    ("realdebrid", "Real-Debrid", "homarr-labs/dashboard-icons, svg/real-debrid.svg", DASHBOARD),

    ("pixeldrain", "Pixeldrain", "Fornaxian/pixeldrain_web, res/static/img/pixeldrain.svg", "AGPL-3.0"),

    ("fichier", "1Fichier", "traced from img.1fichier.com/logo.png, which has no vector", BRAND),
    ("torbox", "TorBox", "torbox.app, logo.svg", BRAND),
    ("workupload", "Workupload", "workupload.com, img/workupload_logo_medium.svg without the word", BRAND),
    ("rpnet", "RPNet", "traced from the flash in premium.rpnet.biz, img/rpnet-logo.svg, which holds it as a picture", BRAND),
    ("tezfiles", "TezFiles", "tezfiles.com, the logo in its page header", BRAND),

    ("deepbrid", "Deepbrid", "the D of Deepbrid's logo as an SVG", BRAND),
    ("ddownload", "ddownload", "ddownload's logo as an SVG", BRAND),
    ("fileboom", "FileBoom", "FileBoom's logo as an SVG", BRAND),
    ("filer", "filer.net", "the square of filer.net's logo as an SVG, without the word", BRAND),
    ("gofile", "Gofile", "Gofile's logo as an SVG", BRAND),
    ("keep2share", "Keep2Share", "Keep2Share's logo as an SVG, without the slate plate it sits on", BRAND),
    ("mydebrid", "MyDebrid", "the M of MyDebrid's logo as an SVG", BRAND),
    ("rapidgator", "Rapidgator", "Rapidgator's logo as an SVG", BRAND),
    ("zevera", "Zevera", "Zevera's logo as an SVG, its ring drawn a little heavier", BRAND),

    ("alldebrid", "AllDebrid", "traced from AllDebrid's logo, which has no vector", BRAND),
    ("cocoleech", "CocoLeech", "traced from cocoleech.com/images/coco2.png, which has no vector", BRAND),
    ("cooldebrid", "CoolDebrid", "traced from cooldebrid.com/img/logo1.png, which has no vector, without the word", BRAND),
    ("fakirdebrid", "FakirDebrid", "traced from fakirdebrid.net/images/logo2.png, which has no vector, without the word",
     BRAND),
    ("katfile", "KatFile", "traced from katfile.com/images/logo.png, which has no vector, the round FILE badge without the word", BRAND),
    ("krakenfiles", "KrakenFiles", "traced from krakenfiles.com/images/kf_logo_dark.png, which has no vector", BRAND),
    ("megadebrid", "Mega-Debrid", "traced from cdn.mega-debrid.eu/images/publicHome/logo.png, which has no vector",
     BRAND),
    ("nitroflare", "NitroFlare", "traced from nitroflare.com/img/symbol.png, which has no vector", BRAND),
    ("offcloud", "Offcloud", "traced from offcloud.com/images/logo-blue-short-lg.png, which has no vector", BRAND),
    ("sendnow", "Send.now", "traced from send.now/static/img/logo.png, which has no vector", BRAND),
    ("uploadrar", "Uploadrar", "traced from Uploadrar's logo, which has no vector", BRAND),
]

# The marks that are the brand's name written out.
WORDMARK = {"alldebrid", "cocoleech", "ddownload", "fileboom", "keep2share", "megadebrid", "tezfiles", "uploadrar"}

HEAD = """// The marks of debrid services and file hosters, as markup for BrandMark, each
// with the colour its tile lights up in and the ink that holds on it ("Brand
// tiles"). Written by scripts/gen_download_marks.py;
// packages/core/download-marks/ holds the sources, their licences and the
// README that records where each came from.
//
// Every mark is a trademark of its owner, used only to name the provider it
// refers to, on a tile that picks exactly that provider, reproduced unmodified
// apart from its colour, with no claim of endorsement by or affiliation with
// any of them. The download catalog names the mark each provider wears; a
// provider whose brand has no clean source wears the app's glyph instead.

import type { TileMark } from "./picker.ts";
"""

TILE_COLOUR = {
    # A white drawing with no colour of its own, lit on black as the brand's
    # dark site shows it.
    "pixeldrain": ("#000000", None),
    # White logos, lit in the colour each brand's own site sets them on.
    "katfile": ("#3074b5", None),
    "megadebrid": ("#239f85", None),
    "rpnet": ("#232838", None),
    # The brand's colour rather than the black outline drawn round it.
    "alldebrid": ("#fbc624", None),
    "rapidgator": ("#fc9020", None),
    "uploadrar": ("#10bbb8", None),
    "zevera": ("#ffce32", None),
    # The slate of the plate Keep2Share's logo sits on, rather than the blue 2.
    "keep2share": ("#465a65", None),
}

FORCE_THEMED = {
    # White logos in their tile colour on the light ground.
    "katfile": {"#ffffff": ("#ffffff", "#3074b5")},
    "megadebrid": {"#ffffff": ("#ffffff", "#239f85")},
    "rpnet": {"#ffffff": ("#ffffff", "#232838")},
    # Keep2Share's white letters, off their slate plate, in that slate on the
    # light ground.
    "keep2share": {"#fff": ("#ffffff", "#465a65")},
    # Dark letters that the rest of the logo keeps from being lifted: CocoLeech's
    # brown in the lighter brown of its own highlight, Uploadrar's black in white.
    "cocoleech": {"#5a2c08": ("#c58e52", "#5a2c08")},
    "uploadrar": {"#010101": ("#ffffff", "#010101")},
}

# Marks whose parts sit side by side rather than one on another, so all of them
# turn ink on a lit tile: TezFiles' two-tone letters and the folds of Send.now's
# ribbon.
ONE_INK = {"tezfiles", "sendnow"}

# The marks whose lit tile shows <id>-hover.svg: premiumize.me's figure and
# check in one ink, kept apart by a gap where the check crosses the figure.
HOVER = ["premiumize"]

# Zevera's white spot in the notch of its V, which turns the disc's ink on a
# lit tile and is gone.
KEPT = {"zevera": {"#fff"}}

MARKS = MarkSet(ROOT / "packages" / "core" / "download-marks", FORCE_THEMED, set(), TILE_COLOUR, ONE_INK, KEPT)

if SRC is None or not SRC.is_dir():
    raise SystemExit("pass the icons folder of simple-icons@16: python scripts/gen_download_marks.py <path>")

data = simple_data(SRC)
entries = {m[0]: simple(*m, SRC, data, MARKS) for m in SIMPLE}
hovers = {slug: local_hover(slug, MARKS) for slug in HOVER}
entries.update({m[0]: local(*m, MARKS, hover=hovers.get(m[0]), wordmark=m[0] in WORDMARK) for m in LOCAL})
ids = write(OUT, HEAD, entries, "DOWNLOAD_MARKS", "DownloadMarkId")
print("%s: %d marks (%d from Simple Icons, %d from download-marks/)" % (OUT.name, len(ids), len(SIMPLE), len(LOCAL)))
