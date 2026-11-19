"""Generate the container registries' marks in packages/core/src/registryMarks.ts.

    npm pack simple-icons@16 somewhere and unpack it, then:
    python scripts/gen_registry_marks.py <path to simple-icons/icons>

The same two kinds of source as the storage providers' marks: the SIMPLE ones
from Simple Icons, the rest whole SVG files in packages/core/registry-marks/,
each with its source and licence recorded below and in that folder's README.
A logo whose colours flatten into one blot on a lit tile brings its brand's
single-colour version as the drawing that tile shows: from Simple Icons, or as
`<id>-hover.svg` beside the logo. Every mark is a trademark of its owner, used
only to name the registry it refers to, on a tile that picks exactly that
registry, reproduced unmodified apart from its colour, with no claim of
endorsement by or affiliation with any of them.

The machinery is in brand_marks.py, which needs the svgelements package (pip
install svgelements).
"""
import sys
from pathlib import Path

from brand_marks import BRAND, MarkSet, local, local_hover, simple, simple_data, simple_hover, write

ROOT = Path(__file__).parent.parent
SRC = Path(sys.argv[1]) if len(sys.argv) > 1 else None
OUT = ROOT / "packages" / "core" / "src" / "registryMarks.ts"

DASHBOARD = "Apache-2.0"

# The id a catalog entry names its mark by -> the Simple Icons slug, with what it is.
SIMPLE = [
    ("codeberg", "codeberg", "Codeberg"),
    ("docker", "docker", "Docker"),
    ("github", "github", "GitHub"),
    ("googlecloud", "googlecloud", "Google Cloud, which Artifact Registry is part of"),
]

# The id -> the file in registry-marks/, what it is, where it comes from, its licence.
LOCAL = [
    ("aws", "Amazon Web Services, which ECR is part of", "homarr-labs/dashboard-icons, svg/aws.svg", DASHBOARD),
    ("azure", "Microsoft Azure, which Container Registry is part of", "homarr-labs/dashboard-icons, svg/azure.svg",
     DASHBOARD),
    ("forgejo", "Forgejo", "homarr-labs/dashboard-icons, svg/forgejo.svg", DASHBOARD),
    ("gitea", "Gitea", "homarr-labs/dashboard-icons, svg/gitea.svg", DASHBOARD),
    ("gitlab", "GitLab", "homarr-labs/dashboard-icons, svg/gitlab.svg", DASHBOARD),
    ("quay", "Quay", "homarr-labs/dashboard-icons, svg/quay.svg", DASHBOARD),
    ("harbor", "Harbor", "cncf/artwork, projects/harbor/icon/color/harbor-icon-color.svg", BRAND),
]

# The lit tile's drawing, by id: a Simple Icons slug, or None for <id>-hover.svg.
HOVER = {
    "gitea": "gitea",
    "gitlab": "gitlab",
    "harbor": None,
    "quay": None,
}

HEAD = """// The marks of container registries, as markup for BrandMark, each with the
// colour its tile lights up in and the ink that holds on it ("Brand tiles").
// Written by scripts/gen_registry_marks.py; packages/core/registry-marks/ holds
// the sources, their licences and the README that records where each came from.
//
// Every mark is a trademark of its owner, used only to name the registry it
// refers to, on a tile that picks exactly that registry, reproduced unmodified
// apart from its colour, with no claim of endorsement by or affiliation with
// any of them. The registry catalog names the mark each registry wears.

import type { TileMark } from "./picker.ts";
"""

TILE_COLOUR = {
    # Docker's blue as its own tile, rather than the lighter whale.
    "docker": ("#1d63ed", None),
    # The navy AWS sets its logo on, rather than the black of the letters.
    "aws": ("#232f3e", None),
    # The Azure blue rather than the light cyan the gradient covers most with.
    "azure": ("#0072c6", None),
    # GitLab's own orange rather than the lighter one of the tanuki's cheeks.
    "gitlab": ("#e24329", None),
    # Harbor's green rather than the blue of its lighthouse's lamp.
    "harbor": ("#4a9c2d", None),
}

MARKS = MarkSet(ROOT / "packages" / "core" / "registry-marks", {}, set(), TILE_COLOUR, set())

if SRC is None or not SRC.is_dir():
    raise SystemExit("pass the icons folder of simple-icons@16: python scripts/gen_registry_marks.py <path>")

data = simple_data(SRC)
hovers = {
    slug: simple_hover(slug, si_slug, SRC, data) if si_slug else local_hover(slug, MARKS)
    for slug, si_slug in HOVER.items()
}
entries = {m[0]: simple(*m, SRC, data, MARKS, hover=hovers.get(m[0])) for m in SIMPLE}
entries.update({m[0]: local(*m, MARKS, hover=hovers.get(m[0])) for m in LOCAL})
ids = write(OUT, HEAD, entries, "REGISTRY_MARKS", "RegistryMarkId")
print("%s: %d marks (%d from Simple Icons, %d from registry-marks/, %d with a drawing for the lit tile)"
      % (OUT.name, len(ids), len(SIMPLE), len(LOCAL), len(hovers)))
