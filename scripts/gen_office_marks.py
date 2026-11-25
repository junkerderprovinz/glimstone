"""Generate the office suites' marks in packages/core/src/officeMarks.ts.

    python scripts/gen_office_marks.py

Every mark is a whole SVG file in packages/core/office-marks/, with its source
and licence recorded below and in that folder's README. Every mark is a
trademark of its owner, used only to name the suite it refers to, on a tile
that picks exactly that suite, reproduced unmodified apart from its colour,
with no claim of endorsement by or affiliation with any of them.

The machinery is in brand_marks.py, which needs the svgelements package (pip
install svgelements).
"""
from pathlib import Path

from brand_marks import MarkSet, local, write

ROOT = Path(__file__).parent.parent
OUT = ROOT / "packages" / "core" / "src" / "officeMarks.ts"

# The id an app names its mark by -> the file in office-marks/, what it is,
# where it comes from, its licence.
LOCAL = [
    ("onlyoffice", "ONLYOFFICE", "ONLYOFFICE/document-server-integration, web/documentserver-example/nodejs/public/images/mobile-logo.svg", "Apache-2.0"),
    ("collabora", "Collabora Online", "CollaboraOnline/online.mirror, browser/branding/themes/collabora-online-brand/images/toolbar-bg-logo.svg", "Apache-2.0"),
    ("eurooffice", "Euro Office", "euro-office/web-apps, theme/euro-office/assets/img/header/eo_logo_light.svg, the linked O of the logo", "AGPL-3.0"),
]

HEAD = """// The marks of the office suites, as markup for BrandMark, each with the
// colour its tile lights up in and the ink that holds on it ("Brand tiles").
// Written by scripts/gen_office_marks.py; packages/core/office-marks/ holds
// the sources and the README that records where each came from.
//
// Every mark is a trademark of its owner, used only to name the suite it
// refers to, on a tile that picks exactly that suite, reproduced unmodified
// apart from its colour, with no claim of endorsement by or affiliation with
// any of them.

import type { TileMark } from "./picker.ts";
"""

TILE_COLOUR = {
    # The orange of ONLYOFFICE's site, also the lowest of its three layers.
    "onlyoffice": ("#ff6f3d", None),
    # The violet of Collabora's chevron.
    "collabora": ("#5c2983", None),
    # Euro Office's own blue, the outer colour of the O.
    "eurooffice": ("#0082c9", None),
}

MARKS = MarkSet(ROOT / "packages" / "core" / "office-marks", {}, set(), TILE_COLOUR, set())

entries = {m[0]: local(*m, MARKS) for m in LOCAL}
ids = write(OUT, HEAD, entries, "OFFICE_MARKS", "OfficeMarkId")
print("%s: %d marks from office-marks/" % (OUT.name, len(ids)))
