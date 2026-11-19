"""Generate the sign-in services' marks in packages/core/src/identityMarks.ts.

    npm pack simple-icons@16 somewhere and unpack it, then:
    python scripts/gen_identity_marks.py <path to simple-icons/icons>

Two kinds of source, as for the storage providers' marks. The SIMPLE ones come
from Simple Icons, whose icons are CC0 unless the set names another licence for
one, which the generated comment then carries. The rest are whole SVG files in
packages/core/identity-marks/, each with its source and licence recorded below
and in that folder's README. A logo whose layers melt into one blot on a lit
tile brings `<id>-hover.svg`, its brand's single-colour version, as the drawing
that tile shows. Every mark is a trademark of its owner, used only to name the
service it refers to, on a tile that picks exactly that service, reproduced
unmodified apart from its colour, with no claim of endorsement by or
affiliation with any of them.

The machinery is in brand_marks.py, which needs the svgelements package (pip
install svgelements).
"""
import sys
from pathlib import Path

from brand_marks import BRAND, MarkSet, local, local_hover, simple, simple_data, write

ROOT = Path(__file__).parent.parent
SRC = Path(sys.argv[1]) if len(sys.argv) > 1 else None
OUT = ROOT / "packages" / "core" / "src" / "identityMarks.ts"

DASHBOARD = "Apache-2.0"

# The id a catalog entry names its mark by -> the Simple Icons slug, with what it is.
SIMPLE = [
    ("authelia", "authelia", "Authelia"),
    ("authentik", "authentik", "authentik"),
]

# The id -> the file in identity-marks/, what it is, where it comes from, its licence.
LOCAL = [
    ("keycloak", "Keycloak", "cncf/artwork, projects/keycloak/icon/color/keycloak-icon-color.svg", BRAND),
    ("pocketid", "Pocket ID", "pocket-id/pocket-id, backend/resources/default-images/logoLight.svg", "BSD-2-Clause"),
    ("zitadel", "ZITADEL", "homarr-labs/dashboard-icons, svg/zitadel.svg", DASHBOARD),
]

# The marks whose lit tile shows <id>-hover.svg.
HOVER = ["keycloak"]

HEAD = """// The marks of sign-in services, as markup for BrandMark, each with the colour
// its tile lights up in and the ink that holds on it ("Brand tiles"). Written
// by scripts/gen_identity_marks.py; packages/core/identity-marks/ holds the
// sources, their licences and the README that records where each came from.
//
// Every mark is a trademark of its owner, used only to name the service it
// refers to, on a tile that picks exactly that service, reproduced unmodified
// apart from its colour, with no claim of endorsement by or affiliation with
// any of them. The identity catalog names the mark each service wears; a
// service whose brand has no clean source wears the app's glyph instead.

import type { TileMark } from "./picker.ts";
"""

FORCE_THEMED = {
    # The outline, the dots and the strokes are near-black and vanish on the
    # dark tile, while the gradient keeps the mark as a whole above 3:1.
    "zitadel": {"#101010": ("#ffffff", "#101010")},
}

# The chevrons lie inside the outline's box but beside its lines, so on a lit
# tile they turn ink as the outline does instead of cut-outs that vanish.
ONE_INK = {"zitadel"}

MARKS = MarkSet(ROOT / "packages" / "core" / "identity-marks", FORCE_THEMED, set(), {}, ONE_INK)

if SRC is None or not SRC.is_dir():
    raise SystemExit("pass the icons folder of simple-icons@16: python scripts/gen_identity_marks.py <path>")

data = simple_data(SRC)
hovers = {slug: local_hover(slug, MARKS) for slug in HOVER}
entries = {m[0]: simple(*m, SRC, data, MARKS) for m in SIMPLE}
entries.update({m[0]: local(*m, MARKS, hover=hovers.get(m[0])) for m in LOCAL})
ids = write(OUT, HEAD, entries, "IDENTITY_MARKS", "IdentityMarkId")
print("%s: %d marks (%d from Simple Icons, %d from identity-marks/, %d with a drawing for the lit tile)"
      % (OUT.name, len(ids), len(SIMPLE), len(LOCAL), len(hovers)))
