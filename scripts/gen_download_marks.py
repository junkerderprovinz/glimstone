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

from brand_marks import BRAND, MarkSet, local, simple, simple_data, write

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
]

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
}

MARKS = MarkSet(ROOT / "packages" / "core" / "download-marks", {}, set(), TILE_COLOUR, set())

if SRC is None or not SRC.is_dir():
    raise SystemExit("pass the icons folder of simple-icons@16: python scripts/gen_download_marks.py <path>")

data = simple_data(SRC)
entries = {m[0]: simple(*m, SRC, data, MARKS) for m in SIMPLE}
entries.update({m[0]: local(*m, MARKS) for m in LOCAL})
ids = write(OUT, HEAD, entries, "DOWNLOAD_MARKS", "DownloadMarkId")
print("%s: %d marks (%d from Simple Icons, %d from download-marks/)" % (OUT.name, len(ids), len(SIMPLE), len(LOCAL)))
