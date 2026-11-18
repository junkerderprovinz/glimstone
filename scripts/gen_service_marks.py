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

Needs the svgelements package (pip install svgelements), which measures where a
mark paints.
"""
import colorsys
import io
import json
import os
import re
import sys
import tempfile
import xml.etree.ElementTree as ET
from pathlib import Path

try:
    import svgelements
except ImportError:  # pragma: no cover
    svgelements = None

ROOT = Path(__file__).parent.parent
SRC = Path(sys.argv[1]) if len(sys.argv) > 1 else None
OUT = ROOT / "packages" / "core" / "src" / "serviceMarks.ts"
MARK_DIR = ROOT / "packages" / "core" / "service-marks"

# The id an app addresses a mark by -> the Simple Icons slug, with what it is.
SIMPLE = [
    ("discord", "discord", "Discord"),
    ("ntfy", "ntfy", "ntfy"),
    ("matrix", "matrix", "Matrix"),
]

BRAND = "the brand's own mark"

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

# A mark drawn in its brand colours vanishes on one of the grounds: navy or
# black on the dark tile, near-white on the light one. Which colours need a
# second value is measured, not listed.
SURFACE_DARK = "#393939"   # --carbon-surface2 on the dark ramp, a tile's ground
SURFACE_LIGHT = "#e8e8e8"  # --carbon-surface2 on the light ramp

# A deepened light value lands on the white card, a tile's #e8e8e8 and the
# light ramp's surface3 at #d1d1d1.
GROUNDS_LIGHT = ("#ffffff", SURFACE_LIGHT, "#d1d1d1")

# The dark theme lifts a mark whose colours all stay under this on the dark
# tile, the 3:1 a graphic needs, and no further, so the colour stays as close
# to the brand's as it can.
DARK_FLOOR = 3.0
# The least a deepened light value keeps on every light ground.
SHIFTED_FLOOR = 2.0
# The light theme keeps a brand's own colour down to this: an orange still
# reads as orange on light grey, and only white and near-white parts vanish.
LIGHT_FLOOR = 1.35
# What a deepened light colour has to reach. Only near-white parts are
# deepened, and they carry no brand colour to stay close to.
TARGET = 4.5

KEYWORDS = {"white": "#ffffff", "black": "#000000"}


def _rgb(colour):
    """`#a00`, `#aa0000`, `rgb(170, 0, 0)` or a known keyword, as 0-255."""
    text = KEYWORDS.get(colour.strip().lower(), colour).strip()
    if text.startswith("rgb"):
        parts = re.findall(r"[\d.]+%?", text)[:3]
        if len(parts) < 3:
            return None
        return tuple(
            int(round(float(p[:-1]) * 255 / 100)) if p.endswith("%") else int(float(p))
            for p in parts
        )
    text = text.lstrip("#")
    if len(text) == 3:
        text = "".join(c * 2 for c in text)
    if len(text) != 6:
        return None
    return tuple(int(text[i:i + 2], 16) for i in (0, 2, 4))


def _luminance(rgb):
    def channel(value):
        value /= 255.0
        return value / 12.92 if value <= 0.03928 else ((value + 0.055) / 1.055) ** 2.4
    r, g, b = (channel(v) for v in rgb)
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def contrast(one_colour, other):
    a, b = sorted((_luminance(_rgb(one_colour)), _luminance(_rgb(other))), reverse=True)
    return (a + 0.05) / (b + 0.05)


def on_light_grounds(colour):
    """The worst contrast this colour reaches on any light ground it lands on."""
    return min(contrast(colour, ground) for ground in GROUNDS_LIGHT)


def shift(colour, surface, upward, target, also=(), step=0.02):
    """The same colour moved along lightness until it reaches `target` on
    `surface`, and every (ground, minimum) in `also`. Hue and saturation stay."""
    rgb = _rgb(colour)
    hue, light, sat = colorsys.rgb_to_hls(*(v / 255.0 for v in rgb))
    step = step if upward else -step
    limit = 0.94 if upward else 0.10
    while (light < limit) if upward else (light > limit):
        light += step
        candidate = "#%02x%02x%02x" % tuple(
            round(v * 255) for v in colorsys.hls_to_rgb(hue, min(max(light, 0.0), 1.0), sat)
        )
        if contrast(candidate, surface) >= target and all(
            contrast(candidate, ground) >= minimum for ground, minimum in also
        ):
            return candidate
    return "#%02x%02x%02x" % tuple(
        round(v * 255) for v in colorsys.hls_to_rgb(hue, min(max(light, 0.0), 1.0), sat)
    )


def _hex(colour):
    return KEYWORDS.get(str(colour).strip().lower()) or colour


def both(on_light, on_dark):
    return "light-dark(%s, %s)" % (_hex(on_light), _hex(on_dark))


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


def themed(colours, slug, ground=None):
    """The colours of a mark that need a second value, as a map from the
    colour as written to its light-dark() pair. The dark theme is judged per
    mark, so a two-tone logo is not half lifted; the light theme per colour,
    and only for the colours in `ground`, those painting straight onto the page.
    """
    usable = [c for c in colours if _rgb(c)]
    if not usable:
        return {}

    swap = {}
    for colour, (on_dark, on_light) in FORCE_THEMED.get(slug, {}).items():
        if colour not in usable:
            raise SystemExit("FORCE_THEMED names %s in %s, which does not paint with it" % (colour, slug))
        if contrast(on_dark, SURFACE_DARK) < DARK_FLOOR or on_light_grounds(on_light) < SHIFTED_FLOOR:
            raise SystemExit(
                "FORCE_THEMED %s/%s is too faint: %.2f on the dark ground, %.2f on the worst light one"
                % (slug, colour, contrast(on_dark, SURFACE_DARK), on_light_grounds(on_light))
            )
        swap[colour] = both(on_light, on_dark)

    rest = [c for c in usable if c not in swap]
    if not rest:
        return swap

    lift = max(contrast(c, SURFACE_DARK) for c in rest) < DARK_FLOOR
    fade = set() if slug in OUTLINED else {
        _rgb(c) for c in rest
        if (ground is None or _rgb(c) in ground) and contrast(c, SURFACE_LIGHT) < LIGHT_FLOOR
    }
    if not lift and not fade:
        return swap
    if lift and len(fade) == len({_rgb(c) for c in rest}):
        raise SystemExit("%s cannot be read on either ground: it needs a different source file" % slug)
    minted = {}
    for colour in rest:
        key = _rgb(colour)
        if key not in minted:
            on_dark = shift(colour, SURFACE_DARK, upward=True, target=DARK_FLOOR, step=0.002) if lift else colour
            on_light = (
                shift(colour, SURFACE_LIGHT, upward=False, target=TARGET,
                      also=[(g, SHIFTED_FLOOR) for g in GROUNDS_LIGHT])
                if key in fade else colour
            )
            minted[key] = None if (on_dark == colour and on_light == colour) else both(on_light, on_dark)
        if minted[key]:
            swap[colour] = minted[key]
    return swap


def apply_swap(source, swap):
    """Put each pair where its literal colour was, except inside a `<mask>`,
    where white means "show all of this"."""
    masks = []

    def park(match):
        masks.append(match.group(0))
        return "\0mask%d\0" % (len(masks) - 1)

    source = re.sub(r"<mask\b.*?</mask>", park, source, flags=re.S)
    for colour, pair in swap.items():
        source = source.replace('"%s"' % colour, '"%s"' % pair)
        source = source.replace(":%s;" % colour, ":%s;" % pair)
        source = source.replace(':%s"' % colour, ':%s"' % pair)
        source = source.replace(", %s)" % colour, ", %s)" % pair)
    for index, block in enumerate(masks):
        source = source.replace("\0mask%d\0" % index, block)
    return source


# Brands whose tile colour the mark does not say. None takes the measured ink.
TILE_COLOUR = {
    # Slack's aubergine rather than the cyan of one of its four bars, which
    # holds white ink no better than 2:1.
    "slack": ("#4a154b", None),
}


def tile(slug, colour):
    """The colour a mark's tile lights up in, and the ink on it: white wherever
    white reaches 2:1, near-black below that."""
    colour, ink = TILE_COLOUR.get(slug, (colour, None))
    if not colour:
        raise SystemExit("%s paints no colour its tile could take; add it to TILE_COLOUR" % slug)
    colour = _hex(colour).lower()
    if len(colour) == 4:
        colour = "#" + "".join(c * 2 for c in colour[1:])
    return colour, ink or ("#ffffff" if contrast(colour, "#ffffff") >= 2 else "#161616")


SVG_NS = "{http://www.w3.org/2000/svg}"
XLINK = "{http://www.w3.org/1999/xlink}"
ET.register_namespace("", "http://www.w3.org/2000/svg")
ET.register_namespace("xlink", "http://www.w3.org/1999/xlink")


def _attr(value):
    return value.replace("&", "&amp;").replace('"', "&quot;").replace("<", "&lt;")


def _markup(node, ids, slug):
    """One SVG element and its children as markup, or None to skip it."""
    tag = node.tag.split("}")[-1]
    # The designer's asset name; the mark is aria-hidden beside the service's name.
    if tag in ("title", "desc", "metadata"):
        return None
    attrs = []
    for raw, value in node.attrib.items():
        if raw == XLINK + "href":
            key = "href"
        elif raw.startswith("{"):
            continue
        else:
            key = raw
        if key in ("xmlns", "version"):
            continue
        # `url(#a)` resolves to the first match in the document, so two marks on
        # one page would swap gradients without the prefix.
        if key == "id":
            value = ids[value]
        else:
            for old, new in ids.items():
                value = value.replace("url(#%s)" % old, "url(#%s)" % new)
                if value == "#" + old:
                    value = "#" + new
        if key == "style":
            value = ";".join(
                "%s:%s" % (k.strip(), v.strip())
                for k, _, v in (chunk.partition(":") for chunk in value.split(";"))
                if k.strip() and v.strip()
            )
            if not value:
                continue
        attrs.append('%s="%s"' % (key, _attr(value)))
    if (node.text or "").strip():
        raise SystemExit("service-marks/%s.svg: <%s> carries text this generator drops" % (slug, tag))
    head = "<%s%s" % (tag, "".join(" " + a for a in attrs))
    kids = [c for c in (_markup(k, ids, slug) for k in node) if c]
    return "%s/>" % head if not kids else "%s>%s</%s>" % (head, "".join(kids), tag)


def _local_name(el):
    return el.tag.split("}")[-1]


def _declared(el, prop):
    """A paint property as the element itself declares it, style over attribute."""
    style = el.get("style") or ""
    found = re.search(r"(?:^|;)\s*%s\s*:\s*([^;]+)" % prop, style)
    return found.group(1).strip() if found else el.get(prop)


def _parse(markup):
    if svgelements is None:
        raise SystemExit("this needs the svgelements package (pip install svgelements)")
    handle, path = tempfile.mkstemp(suffix=".svg")
    os.close(handle)
    try:
        io.open(path, "w", encoding="utf-8").write(markup)
        return svgelements.SVG.parse(path)
    finally:
        os.unlink(path)


def _drop_plate(root, slug):
    """Remove the rectangle the rest of the mark sits on: the first thing
    drawn, a rectangle with everything else inside it. Returns its colour."""
    boxes = []
    for element in _parse(ET.tostring(root, encoding="unicode")).elements():
        if not isinstance(element, svgelements.Shape):
            continue
        try:
            bounds = element.bbox()
        except Exception:
            continue
        if bounds:
            boxes.append((type(element).__name__, bounds))
    if len(boxes) < 2 or boxes[0][0] != "Rect":
        return None
    plate, rest = boxes[0][1], boxes[1:]
    # Half a unit of tolerance for drawing-program rounding.
    if not (plate[0] <= min(b[0] for _, b in rest) + 0.5 and plate[1] <= min(b[1] for _, b in rest) + 0.5
            and plate[2] >= max(b[2] for _, b in rest) - 0.5 and plate[3] >= max(b[3] for _, b in rest) - 0.5):
        return None
    parents = {child: parent for parent in root.iter() for child in parent}
    for el in root.iter():
        if el.tag == SVG_NS + "rect":
            parents[el].remove(el)
            print("  %s: dropped the plate it was sitting on" % slug)
            return _declared(el, "fill")
    return None


# A part at most this far from the colour under it is the same surface drawn
# twice, not a detail on it (Euclidean distance in 0-255 RGB).
SAME_SURFACE = 60
# How much of a part's box has to lie on another part for it to count as lying on it.
ON_TOP = 0.8
NOT_PAINT = ("defs", "mask", "clipPath", "pattern", "symbol", "linearGradient", "radialGradient", "marker")
SHAPES = ("path", "circle", "rect", "ellipse", "polygon", "polyline", "line", "use")


def _gradient_colour(root, ref):
    """The colour in the middle of a gradient, following `href` to the one whose stops it borrows."""
    by_id = {el.get("id"): el for el in root.iter() if el.get("id")}
    grad = by_id.get(ref)
    while grad is not None:
        stops = [s for s in grad if _local_name(s) == "stop"]
        if stops:
            def offset(stop):
                text = stop.get("offset", "0").strip()
                return float(text[:-1]) / 100 if text.endswith("%") else float(text)
            return _declared(min(stops, key=lambda s: abs(offset(s) - 0.5)), "stop-color")
        href = grad.get("href") or grad.get(XLINK + "href")
        grad = by_id.get(href[1:]) if href else None
    return None


def roles(root):
    """Mark every painted part as ink or cut-out for a lit tile: a part lying
    on a part of another colour becomes a cut-out in the tile colour, like the
    eyes on a face, and every other part turns the tile's ink. Returns the
    colours painting straight onto the page and the colour covering most of
    the mark, which its tile lights up in."""
    parents = {child: parent for parent in root.iter() for child in parent}

    def hidden(el):
        while el in parents:
            el = parents[el]
            if _local_name(el) in NOT_PAINT:
                return True
        return False

    def inherited(el, prop):
        while el is not None:
            value = _declared(el, prop)
            if value:
                return value
            el = parents.get(el)
        return "#000000" if prop == "fill" else None

    def colour_of(value):
        if not value or value in ("none", "transparent"):
            return None
        ref = re.match(r"url\(#([^)]+)\)", value)
        if ref:
            value = _gradient_colour(root, ref.group(1))
            return _rgb(value) if value else None
        return _rgb(value)

    parts = []
    for index, el in enumerate(el for el in root.iter() if _local_name(el) in SHAPES and not hidden(el)):
        el.set("data-part", str(index))
        fill, stroke = inherited(el, "fill"), inherited(el, "stroke")
        paint = colour_of(fill) or colour_of(stroke)
        if paint:
            parts.append({"el": el, "fill": fill, "stroke": stroke, "rgb": paint})

    boxes = {}
    for element in _parse(ET.tostring(root, encoding="unicode")).elements():
        key = element.values.get("data-part") if hasattr(element, "values") else None
        if key is None or not isinstance(element, svgelements.Shape):
            continue
        try:
            bounds = element.bbox(with_stroke=True)
        except Exception:
            bounds = None
        if bounds:
            boxes[key] = bounds
    for part in parts:
        part["box"] = boxes.get(part["el"].get("data-part"))
    parts = [p for p in parts if p["box"] and (p["box"][2] - p["box"][0]) * (p["box"][3] - p["box"][1]) > 0]
    for el in root.iter():
        el.attrib.pop("data-part", None)

    def area(box):
        return (box[2] - box[0]) * (box[3] - box[1])

    def lies_on(a, b):
        w = min(a[2], b[2]) - max(a[0], b[0])
        h = min(a[3], b[3]) - max(a[1], b[1])
        return w > 0 and h > 0 and w * h / area(a) >= ON_TOP

    def apart(a, b):
        return sum((x - y) ** 2 for x, y in zip(a, b)) ** 0.5 > SAME_SURFACE

    # An outline has no surface, so nothing drawn inside it lies on it.
    def surface(part):
        return part["fill"] not in (None, "none", "transparent")

    for i, part in enumerate(parts):
        part["depth"] = 0
        for below in reversed(parts[:i]):
            if surface(below) and lies_on(part["box"], below["box"]):
                part["depth"] = below["depth"] + (1 if apart(part["rgb"], below["rgb"]) else 0)
                break
    # A part under a larger one of another colour shows only through its holes.
    for i, part in enumerate(parts):
        for above in parts[i + 1:]:
            if surface(above) and lies_on(part["box"], above["box"]) and apart(part["rgb"], above["rgb"]):
                if above["depth"] % 2 == part["depth"] % 2:
                    part["depth"] = above["depth"] + 1
                break

    for part in parts:
        role = "--mark-cut" if part["depth"] % 2 else "--mark-ink"
        el = part["el"]
        for prop in ("fill", "stroke"):
            value = part[prop]
            if not value or value in ("none", "transparent"):
                continue
            wrapped = "var(%s, %s)" % (role, value)
            style = el.get("style") or ""
            if re.search(r"(?:^|;)\s*%s\s*:" % prop, style):
                el.set("style", re.sub(r"((?:^|;)\s*%s\s*:\s*)[^;]+" % prop, lambda m: m.group(1) + wrapped, style))
            else:
                el.set(prop, wrapped)

    ground = {p["rgb"] for p in parts if p["depth"] == 0}
    cover = {}
    for p in parts:
        if p["depth"] % 2 == 0 and min(p["rgb"]) <= 216:
            cover[p["rgb"]] = cover.get(p["rgb"], 0) + area(p["box"])
    if not cover:
        for p in parts:
            if min(p["rgb"]) <= 216:
                cover[p["rgb"]] = cover.get(p["rgb"], 0) + area(p["box"])
    return ground, ("#%02x%02x%02x" % max(cover, key=cover.get) if cover else None)


# How much of its box a mark may waste before it is cropped: above the rounding
# in these files and below what the eye resolves.
SLACK = 1.02


def crop_to_ink(svg, slug):
    """Tighten a mark's viewBox onto its drawing, since a tile scales the box
    and a drawing in a box twice its height arrives at half its neighbours' size."""
    measured = re.sub(r"<(defs|mask|clipPath)\b.*?</\1>", "", svg, flags=re.S)
    box = [float(v) for v in re.search(r'viewBox="([^"]+)"', measured).group(1).replace(",", " ").split()]
    # The viewBox's own size makes the viewport transform the identity.
    measured = measured.replace("<svg ", '<svg width="%g" height="%g" ' % (box[2], box[3]), 1)
    left = top = float("inf")
    right = bottom = float("-inf")
    for element in _parse(measured).elements():
        if not isinstance(element, svgelements.Shape):
            continue
        try:
            # With the stroke, or a mark drawn as an outline loses half of it at every edge.
            bounds = element.bbox(with_stroke=True)
        except Exception:
            continue
        if not bounds:
            continue
        left, top = min(left, bounds[0]), min(top, bounds[1])
        right, bottom = max(right, bounds[2]), max(bottom, bounds[3])
    if right <= left or bottom <= top:
        raise SystemExit("%s paints nothing this can measure" % slug)
    ink = (left + box[0], top + box[1], right - left, bottom - top)
    if box[2] / ink[2] <= SLACK and box[3] / ink[3] <= SLACK:
        return svg
    tight = " ".join((("%.2f" % (round(v, 2) or 0.0)).rstrip("0").rstrip(".") or "0") for v in ink)
    print("  %s: cropped to its ink (%.2fx wide, %.2fx tall)" % (slug, box[2] / ink[2], box[3] / ink[3]))
    return re.sub(r'viewBox="[^"]*"', 'viewBox="%s"' % tight, svg, count=1)


def _inline_css(root, slug):
    """Fold an Illustrator `<style>` block into the elements it paints, since
    class names are global to the document and two marks defining `.st0`
    would share one fill."""
    parents = {child: parent for parent in root.iter() for child in parent}
    rules = {}
    for style in [e for e in root.iter() if e.tag == SVG_NS + "style"]:
        text = re.sub(r"/\*.*?\*/", "", style.text or "", flags=re.S)
        for selector, body in re.findall(r"([^{}]+)\{([^{}]*)\}", text):
            for one_selector in selector.split(","):
                one_selector = one_selector.strip()
                if not re.fullmatch(r"\.[-\w]+", one_selector):
                    raise SystemExit("service-marks/%s: <style> carries the selector %r, which this "
                                     "generator only handles as a plain class" % (slug, one_selector))
                rules.setdefault(one_selector[1:], []).append(body.strip().strip(";"))
        parents[style].remove(style)
    for el in root.iter():
        names = (el.get("class") or "").split()
        if not names:
            continue
        del el.attrib["class"]
        declarations = [d for n in names for d in rules.get(n, [])]
        if el.get("style"):
            declarations.append(el.get("style").strip().strip(";"))
        if declarations:
            el.set("style", "; ".join(declarations))
    return root


def _unwrap_switch(root):
    """Turn an Illustrator `<switch>` into the group a browser draws: its first
    choice is a `<foreignObject>` only Illustrator understands, which the
    measuring here would not skip."""
    for switch in [e for e in root.iter() if e.tag == SVG_NS + "switch"]:
        for choice in list(switch):
            if choice.tag == SVG_NS + "foreignObject" and choice.get("requiredExtensions"):
                switch.remove(choice)
        if len(switch) != 1:
            raise SystemExit("a <switch> with %d choices left; pick one by hand" % len(switch))
        switch.tag = SVG_NS + "g"
    return root


def _quote(text):
    return "'%s'" % text.replace("\\", "\\\\").replace("'", "\\'")


def entry(slug, note, svg, colour, ink):
    return "/** %s */\nconst %s: TileMark = {\n  svg: %s,\n  tile: '%s',\n  ink: '%s',\n};\n" % (
        note, slug, _quote(svg), colour, ink)


def simple(slug, si_slug, name, colours):
    svg = io.open(SRC / (si_slug + ".svg"), encoding="utf-8").read()
    box = re.search(r'viewBox="([^"]+)"', svg)
    paths = re.findall(r'<path d="([^"]+)"', svg)
    if not box or not paths:
        raise SystemExit("cannot read %s.svg" % si_slug)
    colour = colours.get(si_slug)
    if not colour:
        raise SystemExit("no brand colour for %s: the data file did not carry it" % si_slug)
    # The brand's own colour rather than currentColor, which would make a
    # silhouette of the logo. `fill` sits on the svg, so one value paints it all.
    swap = themed([colour], si_slug)
    painted = swap.get(colour, colour)
    aside = "" if not swap else ", lifted on the ground it cannot be read on"
    markup = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="%s" fill="var(--mark-ink, %s)">%s</svg>' % (
        box.group(1), painted, "".join('<path d="%s"/>' % d for d in paths))
    return entry(slug, "%s. Simple Icons: %s (CC0), in its own %s%s." % (name, si_slug, colour, aside),
                 crop_to_ink(markup, slug), *tile(si_slug, colour))


def local(slug, name, source, licence):
    path = MARK_DIR / (slug + ".svg")
    root = _unwrap_switch(_inline_css(ET.fromstring(io.open(path, encoding="utf-8").read()), slug))
    box = root.get("viewBox")
    if not box:
        w, h = root.get("width"), root.get("height")
        if not w or not h:
            raise SystemExit("service-marks/%s.svg has neither viewBox nor size" % slug)
        box = "0 0 %s %s" % (w, h)

    plate = _drop_plate(root, slug)
    ground, largest = roles(root)
    colour, ink = tile(slug, largest or plate)

    ids = {el.get("id"): "glim-%s-%s" % (slug, el.get("id")) for el in root.iter() if el.get("id")}
    body = "".join(c for c in (_markup(k, ids, slug) for k in root) if c)
    if not body:
        raise SystemExit("service-marks/%s.svg is empty" % slug)

    # The root's painting attributes come along with the drawing.
    skip = {"viewBox", "width", "height", "id", "class", "role", "style", "x", "y", "version"}
    root_attrs = ['%s="%s"' % (raw, _attr(value)) for raw, value in root.attrib.items()
                  if not raw.startswith("{") and raw not in skip]

    painted_text = re.sub(r"<mask\b.*?</mask>", " ", body, flags=re.S) + " " + " ".join(root_attrs)
    found = re.findall(r'"(#[0-9a-fA-F]{3,8}|rgb\([^"]*\)|%s)"' % "|".join(KEYWORDS), painted_text) \
        + re.findall(r'--mark-(?:ink|cut), (#[0-9a-fA-F]{3,8}|rgb\([^)]*\)|%s)\)' % "|".join(KEYWORDS), painted_text) \
        + re.findall(r':(#[0-9a-fA-F]{3,8})(?=[;"])', painted_text)
    for attribute in ("fill", "stroke"):
        for value in re.findall(r'%s="([^"]*)"' % attribute, painted_text):
            if value in ("none", "currentColor", "transparent") or value.startswith(("var(", "url(", "#", "rgb")) \
                    or value.lower() in KEYWORDS:
                continue
            raise SystemExit('%s paints with %s="%s", which nothing here can measure' % (slug, attribute, value))
    if not found:
        root_attrs.append('fill="#000000"')
        found = ["#000000"]

    swap = themed(found, slug, ground)
    body = apply_swap(body, swap)
    root_attrs = [apply_swap(a, swap) for a in root_attrs]
    markup = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="%s"%s>%s</svg>' % (
        box, "".join(" " + a for a in root_attrs), body)
    return entry(slug, "%s. Source: %s (%s)." % (name, source, licence), crop_to_ink(markup, slug), colour, ink)


if SRC is None or not SRC.is_dir():
    raise SystemExit("pass the icons folder of simple-icons@16: python scripts/gen_service_marks.py <path>")

colours = {}
data = SRC.parent / "data" / "simple-icons.json"
raw = json.loads(io.open(data, encoding="utf-8").read())
for item in (raw["icons"] if isinstance(raw, dict) else raw):
    colours[item.get("slug") or re.sub(r"[^a-z0-9]", "", item.get("title", "").lower())] = "#" + item["hex"]

entries = {m[0]: simple(*m, colours) for m in SIMPLE}
entries.update({m[0]: local(*m) for m in LOCAL})
ids = sorted(entries)
parts = [HEAD] + [entries[i] for i in ids] + [
    "/** Every mark, by the id an app addresses it with. */\n"
    "export const SERVICE_MARKS = { %s } as const;\n\n"
    "export type ServiceMarkId = keyof typeof SERVICE_MARKS;\n" % ", ".join(ids)
]
io.open(OUT, "w", encoding="utf-8", newline="\n").write("\n".join(parts))
print("%s: %d marks (%d from Simple Icons, %d from service-marks/)" % (OUT.name, len(ids), len(SIMPLE), len(LOCAL)))
