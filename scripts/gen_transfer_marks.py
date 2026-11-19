"""Generate the transfer services' marks in packages/core/src/transferMarks.ts.

    npm pack simple-icons@16 somewhere and unpack it, then:
    python scripts/gen_transfer_marks.py <path to simple-icons/icons>

Two kinds of source, as for the storage providers' marks. The SIMPLE ones come
from Simple Icons, whose icons are CC0 unless the set names another licence for
one, which the generated comment then carries. The rest are whole SVG files in
packages/core/transfer-marks/, each with its source and licence recorded below
and in that folder's README. Every mark is a trademark of its owner, used only
to name the service it refers to, on a tile that picks exactly that service,
reproduced unmodified apart from its colour, with no claim of endorsement by or
affiliation with any of them.

The machinery is in brand_marks.py, which needs the svgelements package (pip
install svgelements).
"""
import sys
from pathlib import Path

from brand_marks import MarkSet, local, simple, simple_data, write

ROOT = Path(__file__).parent.parent
SRC = Path(sys.argv[1]) if len(sys.argv) > 1 else None
OUT = ROOT / "packages" / "core" / "src" / "transferMarks.ts"

DASHBOARD = "Apache-2.0"

# The id a catalog entry names its mark by -> the Simple Icons slug, with what it is.
SIMPLE = [
    ("wetransfer", "wetransfer", "WeTransfer"),
]

# The id -> the file in transfer-marks/, what it is, where it comes from, its licence.
LOCAL = [
    ("swisstransfer", "SwissTransfer",
     "homarr-labs/dashboard-icons, svg/infomaniak-swisstransfer.svg, without the words beside the mark", DASHBOARD),
]

HEAD = """// The marks of transfer services, as markup for BrandMark, each with the
// colour its tile lights up in and the ink that holds on it ("Brand tiles").
// Written by scripts/gen_transfer_marks.py; packages/core/transfer-marks/ holds
// the sources, their licences and the README that records where each came from.
//
// Every mark is a trademark of its owner, used only to name the service it
// refers to, on a tile that picks exactly that service, reproduced unmodified
// apart from its colour, with no claim of endorsement by or affiliation with
// any of them. The transfer catalog names the mark each service wears.

import type { TileMark } from "./picker.ts";
"""

TILE_COLOUR = {
    # The green of the front sheet rather than the paler ones behind it.
    "swisstransfer": ("#3bb471", None),
}

MARKS = MarkSet(ROOT / "packages" / "core" / "transfer-marks", {}, set(), TILE_COLOUR, set())

if SRC is None or not SRC.is_dir():
    raise SystemExit("pass the icons folder of simple-icons@16: python scripts/gen_transfer_marks.py <path>")

data = simple_data(SRC)
entries = {m[0]: simple(*m, SRC, data, MARKS) for m in SIMPLE}
entries.update({m[0]: local(*m, MARKS) for m in LOCAL})
ids = write(OUT, HEAD, entries, "TRANSFER_MARKS", "TransferMarkId")
print("%s: %d marks (%d from Simple Icons, %d from transfer-marks/)" % (OUT.name, len(ids), len(SIMPLE), len(LOCAL)))
