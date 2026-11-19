"""Generate the captcha solvers' marks in packages/core/src/captchaMarks.ts.

    python scripts/gen_captcha_marks.py

Every mark is a whole SVG file in packages/core/captcha-marks/, with its source
and licence recorded below and in that folder's README, since Simple Icons
carries none of these brands. Every mark is a trademark of its owner, used only
to name the solver it refers to, on a tile that picks exactly that solver,
reproduced unmodified apart from its colour, with no claim of endorsement by or
affiliation with any of them.

The machinery is in brand_marks.py, which needs the svgelements package (pip
install svgelements).
"""
from pathlib import Path

from brand_marks import BRAND, MarkSet, local, local_hover, write

ROOT = Path(__file__).parent.parent
OUT = ROOT / "packages" / "core" / "src" / "captchaMarks.ts"

# The id a catalog entry names its mark by -> the file in captcha-marks/, what
# it is, where it comes from, its licence.
LOCAL = [
    ("capmonster", "CapMonster Cloud", "ZennoLab/capmonster-captcha-solver-docs, static/img/logoNoText.svg", "MIT"),

    ("capsolver", "CapSolver", "capsolver.com, favicon.svg", BRAND),
    ("solvecha", "Solvecha", "solvecha.com, site/static/favicon.svg", BRAND),
    ("twocaptcha", "2Captcha", "2captcha.com, twocaptcha-logo.svg without the word", BRAND),
    ("anticaptcha", "Anti-Captcha", "anti-captcha.com, _nuxt/logo.108c78f7.svg", BRAND),
    ("deathbycaptcha", "DeathByCaptcha", "the boxed name of DeathByCaptcha's logo as an SVG", BRAND),
]

# The marks that are the brand's name written out.
WORDMARK = {"deathbycaptcha"}

HEAD = """// The marks of captcha solvers, as markup for BrandMark, each with the colour
// its tile lights up in and the ink that holds on it ("Brand tiles"). Written
// by scripts/gen_captcha_marks.py; packages/core/captcha-marks/ holds the
// sources, their licences and the README that records where each came from.
//
// Every mark is a trademark of its owner, used only to name the solver it
// refers to, on a tile that picks exactly that solver, reproduced unmodified
// apart from its colour, with no claim of endorsement by or affiliation with
// any of them. The captcha catalog names the mark each solver wears; a solver
// whose brand has no clean source wears the app's glyph instead.

import type { TileMark } from "./picker.ts";
"""

# The marks with a drawing of their own for the lit tile, `<id>-hover.svg`.
HOVER = ["capsolver"]

TILE_COLOUR = {
    # The teal square Solvecha's icon stands on, which the generator lifts off.
    "solvecha": ("#0e7c66", None),
    # A white logo, lit in the navy of Anti-Captcha's own site.
    "anticaptcha": ("#111d35", None),
}

FORCE_THEMED = {
    # The white letters in that navy on the light ground.
    "anticaptcha": {"white": ("#ffffff", "#111d35")},
}

MARKS = MarkSet(ROOT / "packages" / "core" / "captcha-marks", FORCE_THEMED, set(), TILE_COLOUR, set())

hovers = {slug: local_hover(slug, MARKS) for slug in HOVER}
entries = {m[0]: local(*m, MARKS, hover=hovers.get(m[0]), wordmark=m[0] in WORDMARK) for m in LOCAL}
ids = write(OUT, HEAD, entries, "CAPTCHA_MARKS", "CaptchaMarkId")
print("%s: %d marks from captcha-marks/" % (OUT.name, len(ids)))
