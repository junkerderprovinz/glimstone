"""Generate the notification services' marks in packages/core/src/serviceMarks.ts.

    npm pack simple-icons@16 somewhere and unpack it, then:
    python scripts/gen_service_marks.py <path to simple-icons/icons>

Two kinds of source. Discord, ntfy and Matrix come from Simple Icons, which is
CC0 and carries no attribution duty. The rest are whole SVG files in
packages/core/service-marks/, each with its source and licence recorded below
and in that folder's README. Every mark is a trademark of its owner, used only
to name the service it refers to, on a tile that picks exactly that service,
reproduced unmodified apart from its colour, with no claim of endorsement by or
affiliation with any of them.

Each mark comes out as markup for BrandMark, with the colour its tile lights up
in and the ink that holds on it ("Brand tiles" in the design language). A
colour that one theme's tile would swallow becomes a light-dark() pair, so the
marks need no stylesheet of their own.

The machinery is in brand_marks.py, which needs the svgelements package (pip
install svgelements).
"""
import sys
from pathlib import Path

from brand_marks import BRAND, MarkSet, local, simple, simple_data, write

ROOT = Path(__file__).parent.parent
SRC = Path(sys.argv[1]) if len(sys.argv) > 1 else None
OUT = ROOT / "packages" / "core" / "src" / "serviceMarks.ts"

# The id an app addresses a mark by -> the Simple Icons slug, with what it is.
SIMPLE = [
    ("discord", "discord", "Discord"),
    ("ntfy", "ntfy", "ntfy"),
    ("matrix", "matrix", "Matrix"),
]

# The id -> the file in service-marks/, what it is, where it comes from, its licence.
LOCAL = [
    ("slack", "Slack", "homarr-labs/dashboard-icons, svg/slack.svg", "Apache-2.0"),
    ("gotify", "Gotify", "homarr-labs/dashboard-icons, svg/gotify.svg, after gotify/logo (CC BY 4.0)", "Apache-2.0"),
    ("healthchecks", "Healthchecks.io", "healthchecks/healthchecks, static/img/favicon.svg", BRAND),
    ("apprise", "Apprise",
     "traced from caronc/apprise, apprise/assets/themes/default/apprise-logo.png, which has no vector", BRAND),
    ("shoutrrr", "Shoutrrr", "nicholas-fedor/shoutrrr, docs/assets/media/shoutrrr-logotype.svg", "MIT"),
]

HEAD = """// The marks of notification services, as markup for BrandMark, each with the
// colour its tile lights up in and the ink that holds on it ("Brand tiles").
// Written by scripts/gen_service_marks.py; packages/core/service-marks/ holds
// the sources, their licences and the README that records where each came from.
//
// Every mark is a trademark of its owner, used only to name the service it
// refers to, on a tile that picks exactly that service, reproduced unmodified
// apart from its colour, with no claim of endorsement by or affiliation with
// any of them. The app passes the mark it means by id; the picker never looks
// one up by a service's name.

import type { TileMark } from "./picker.ts";
"""

# Colours that follow the theme although the mark as a whole reads fine. White
# in a logo is mostly a knockout on the brand's own shape and must stay white,
# and no measurement here tells it from white on the page. (on dark, on light).
FORCE_THEMED = {
    # The dark half of the pulse, white on the dark ground as the brand's own
    # dark-mode mark draws it.
    "healthchecks": {"#33333f": ("#ffffff", "#33333f")},
    # A megaphone in two dark teals and a pale arc: the teals lighten on the
    # dark ground and the arc deepens on the light one, each to the floor its
    # ground needs and no further.
    "apprise": {
        "#237171": ("#3fa9a6", "#237171"),
        "#185858": ("#319491", "#185858"),
        "#a6e8de": ("#a6e8de", "#169e8d"),
    },
}

# Marks with a dark outline round every part, which keeps a pale part apart
# from a light ground by itself. Deepening Gotify's white eyes would grey them.
OUTLINED = {"gotify"}

# Brands whose tile colour the mark does not say. None takes the measured ink.
TILE_COLOUR = {
    # Slack's aubergine rather than the cyan of one of its four bars, which
    # holds white ink no better than 2:1.
    "slack": ("#4a154b", None),
    # Healthchecks.io's green rather than the dark grey that covers more of
    # the mark, with the near-black ink at 8:1, as the plugins draw it.
    "healthchecks": ("#5cb85f", "#161616"),
}

MARKS = MarkSet(ROOT / "packages" / "core" / "service-marks", FORCE_THEMED, OUTLINED, TILE_COLOUR)

if SRC is None or not SRC.is_dir():
    raise SystemExit("pass the icons folder of simple-icons@16: python scripts/gen_service_marks.py <path>")

data = simple_data(SRC)
entries = {m[0]: simple(*m, SRC, data, MARKS) for m in SIMPLE}
entries.update({m[0]: local(*m, MARKS) for m in LOCAL})
ids = write(OUT, HEAD, entries, "SERVICE_MARKS", "ServiceMarkId")
print("%s: %d marks (%d from Simple Icons, %d from service-marks/)" % (OUT.name, len(ids), len(SIMPLE), len(LOCAL)))
