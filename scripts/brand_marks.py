"""The machinery that turns brand marks into markup for BrandMark, shared by
the generators of every set of marks.

Each mark comes out as a whole SVG with the colour its tile lights up in and the
ink that holds on it ("Brand tiles" in the design language). A colour that one
theme's tile would swallow becomes a light-dark() pair, so the marks need no
stylesheet of their own. A mark comes either from Simple Icons, whose icons are
CC0 unless one names a licence of its own, or from a whole SVG file in the set's
folder, reproduced as drawn apart from its colour.

Needs the svgelements package (pip install svgelements), which measures where a
mark paints.
"""
import colorsys
import io
import json
import os
import re
import tempfile
import xml.etree.ElementTree as ET
from dataclasses import dataclass, field
from pathlib import Path

try:
    import svgelements
except ImportError:  # pragma: no cover
    raise SystemExit("this needs the svgelements package (pip install svgelements)")

# The licence column for a mark that is its owner's, used under the trademark
# position each set's README records rather than under a licence.
BRAND = "the brand's own mark"


@dataclass
class MarkSet:
    """One set of marks: the folder its files lie in, and what its marks need
    beyond what can be measured."""
    folder: Path
    # Colours that follow the theme although the mark as a whole reads fine,
    # by slug: {colour as written: (on dark, on light)}. White in a logo is
    # mostly a knockout on the brand's own shape and must stay white, and no
    # measurement here tells it from white on the page.
    force_themed: dict = field(default_factory=dict)
    # Marks with a dark outline round every part, which keeps a pale part
    # apart from a light ground by itself.
    outlined: set = field(default_factory=set)
    # Brands whose tile colour the mark does not say, by slug: (tile, ink).
    # None takes the measured ink.
    tile_colour: dict = field(default_factory=dict)
    # Marks whose parts all turn ink on a lit tile, where a part lying on
    # another is a stroke crossing it rather than a hole in it.
    one_ink: set = field(default_factory=set)


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


def _rgb(colour: str):
    """`#a00`, `#aa0000`, `rgb(170, 0, 0)` or a known keyword, as 0-255."""
    text = colour.strip()
    text = KEYWORDS.get(text.lower(), text)
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
    if rgb is None:
        raise SystemExit("cannot shift %s, which is not a colour this reads" % colour)
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


def themed(colours, slug, marks, ground=None):
    """The colours of a mark that need a second value, as a map from the
    colour as written to its light-dark() pair. The dark theme is judged per
    mark, so a two-tone logo is not half lifted; the light theme per colour,
    and only for the colours in `ground`, those painting straight onto the page.
    """
    usable = [c for c in colours if _rgb(c)]
    if not usable:
        return {}

    swap = {}
    for colour, (on_dark, on_light) in marks.force_themed.get(slug, {}).items():
        if colour not in usable:
            raise SystemExit("force_themed names %s in %s, which does not paint with it" % (colour, slug))
        if contrast(on_dark, SURFACE_DARK) < DARK_FLOOR or on_light_grounds(on_light) < SHIFTED_FLOOR:
            raise SystemExit(
                "force_themed %s/%s is too faint: %.2f on the dark ground, %.2f on the worst light one"
                % (slug, colour, contrast(on_dark, SURFACE_DARK), on_light_grounds(on_light))
            )
        swap[colour] = both(on_light, on_dark)

    rest = [c for c in usable if c not in swap]
    if not rest:
        return swap

    lift = max(contrast(c, SURFACE_DARK) for c in rest) < DARK_FLOOR
    fade = set() if slug in marks.outlined else {
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
            on_dark = white_or_lifted(colour) if lift else colour
            on_light = (
                shift(colour, SURFACE_LIGHT, upward=False, target=TARGET,
                      also=[(g, SHIFTED_FLOOR) for g in GROUNDS_LIGHT])
                if key in fade else colour
            )
            minted[key] = None if (on_dark == colour and on_light == colour) else both(on_light, on_dark)
        if minted[key]:
            swap[colour] = minted[key]
    return swap


# Below this spread between its channels a colour shows no hue, only a tint of
# a few units the eye does not resolve, and lifting it would invent one.
NEUTRAL_SPREAD = 8


def white_or_lifted(colour):
    """A black or grey part turns white on the dark ground, since grey carries
    no brand colour to stay close to; a coloured one is lifted just to the floor."""
    rgb = _rgb(colour)
    if max(rgb) - min(rgb) <= NEUTRAL_SPREAD:
        return "#ffffff"
    return shift(colour, SURFACE_DARK, upward=True, target=DARK_FLOOR, step=0.002)


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


def tile(slug, colour, marks):
    """The colour a mark's tile lights up in, and the ink on it: white wherever
    white reaches 2:1, near-black below that."""
    colour, ink = marks.tile_colour.get(slug, (colour, None))
    if not colour:
        raise SystemExit("%s paints no colour its tile could take; add it to tile_colour" % slug)
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


def _markup(node, ids, slug, folder):
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
        raise SystemExit("%s/%s.svg: <%s> carries text this generator drops" % (folder, slug, tag))
    head = "<%s%s" % (tag, "".join(" " + a for a in attrs))
    kids = [c for c in (_markup(k, ids, slug, folder) for k in node) if c]
    return "%s/>" % head if not kids else "%s>%s</%s>" % (head, "".join(kids), tag)


def _local_name(el):
    return el.tag.split("}")[-1]


def _declared(el, prop):
    """A paint property as the element itself declares it, style over attribute."""
    style = el.get("style") or ""
    found = re.search(r"(?:^|;)\s*%s\s*:\s*([^;]+)" % prop, style)
    return found.group(1).strip() if found else el.get(prop)


def _parse(markup):
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


def roles(root, one_ink=False):
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

    for part in parts:
        part["depth"] = 0
    if not one_ink:
        for i, part in enumerate(parts):
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

    # A group's own paint is a default its parts override, wrapped all the
    # same so that no bare colour is left for a lit tile to miss.
    for el in root.iter():
        if _local_name(el) == "g":
            for prop in ("fill", "stroke"):
                value = el.get(prop)
                if value and value not in ("none", "transparent", "currentColor") and not value.startswith(("var(", "url(")):
                    el.set(prop, "var(--mark-ink, %s)" % value)

    ground = {p["rgb"] for p in parts if p["depth"] == 0}
    cover = {}
    for p in parts:
        if p["depth"] % 2 == 0 and min(p["rgb"]) <= 216:
            cover[p["rgb"]] = cover.get(p["rgb"], 0) + area(p["box"])
    if not cover:
        for p in parts:
            if min(p["rgb"]) <= 216:
                cover[p["rgb"]] = cover.get(p["rgb"], 0) + area(p["box"])
    return ground, ("#%02x%02x%02x" % max(cover, key=lambda c: cover[c]) if cover else None)


# How much of its box a mark may waste before it is cropped: above the rounding
# in these files and below what the eye resolves.
SLACK = 1.02


def crop_to_ink(svg, slug):
    """Tighten a mark's viewBox onto its drawing, since a tile scales the box
    and a drawing in a box twice its height arrives at half its neighbours' size."""
    measured = re.sub(r"<(defs|mask|clipPath)\b.*?</\1>", "", svg, flags=re.S)
    box = [float(v) for v in re.findall(r'viewBox="([^"]+)"', measured)[0].replace(",", " ").split()]
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
                    raise SystemExit("%s: <style> carries the selector %r, which this "
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


def entry(slug, note, svg, colour, ink, hover=None):
    lit = "" if hover is None else "  hover: %s,\n" % _quote(hover)
    return "/** %s */\nconst %s: TileMark = {\n  svg: %s,\n  tile: '%s',\n  ink: '%s',\n%s};\n" % (
        note, slug, _quote(svg), colour, ink, lit)


def _simple_source(si_slug, icons, data):
    svg = io.open(icons / (si_slug + ".svg"), encoding="utf-8").read()
    box = re.search(r'viewBox="([^"]+)"', svg)
    paths = re.findall(r'<path d="([^"]+)"', svg)
    if not box or not paths:
        raise SystemExit("cannot read %s.svg" % si_slug)
    if si_slug not in data:
        raise SystemExit("no brand colour for %s: the data file did not carry it" % si_slug)
    return box.group(1), paths, data[si_slug]


def simple_hover(slug, si_slug, icons, data):
    """The Simple Icons drawing of a brand as the lit tile's drawing, for a
    mark whose colours do not survive one ink: one shape with its own holes."""
    box, paths, (colour, _) = _simple_source(si_slug, icons, data)
    markup = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="%s" fill="var(--mark-ink, %s)">%s</svg>' % (
        box, colour, "".join('<path d="%s"/>' % d for d in paths))
    return crop_to_ink(markup, slug + " hover")


def simple(slug, si_slug, name, icons, data, marks, hover=None):
    box, paths, (colour, licence) = _simple_source(si_slug, icons, data)
    # The brand's own colour rather than currentColor, which would make a
    # silhouette of the logo. `fill` sits on the svg, so one value paints it all.
    swap = themed([colour], si_slug, marks)
    painted = swap.get(colour, colour)
    aside = "" if not swap else ", lifted on the ground it cannot be read on"
    markup = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="%s" fill="var(--mark-ink, %s)">%s</svg>' % (
        box, painted, "".join('<path d="%s"/>' % d for d in paths))
    return entry(slug, "%s. Simple Icons: %s (%s), in its own %s%s." % (name, si_slug, licence, colour, aside),
                 crop_to_ink(markup, slug), *tile(si_slug, colour, marks), hover=hover)


def _drawing(slug, file, marks, prefix):
    """A file of the set as markup whose parts a lit tile can repaint: its
    viewBox, its body, the root's painting attributes, the colours it paints
    with, those painting straight onto the page, and the colour it says its
    tile lights up in."""
    path = marks.folder / (file + ".svg")
    root = _unwrap_switch(_inline_css(ET.fromstring(io.open(path, encoding="utf-8").read()), slug))
    box = root.get("viewBox")
    if not box:
        w, h = root.get("width"), root.get("height")
        if not w or not h:
            raise SystemExit("%s/%s.svg has neither viewBox nor size" % (marks.folder.name, file))
        box = "0 0 %s %s" % (w, h)

    plate = _drop_plate(root, slug)
    ground, largest = roles(root, slug in marks.one_ink)

    ids = {el.get("id"): "%s-%s" % (prefix, el.get("id")) for el in root.iter() if el.get("id")}
    body = "".join(c for c in (_markup(k, ids, file, marks.folder.name) for k in root) if c)
    if not body:
        raise SystemExit("%s/%s.svg is empty" % (marks.folder.name, file))

    # The root's painting attributes come along with the drawing.
    skip = {"viewBox", "width", "height", "id", "class", "role", "style", "x", "y", "version"}
    root_attrs = ['%s="%s"' % (raw, _attr(value)) for raw, value in root.attrib.items()
                  if not raw.startswith("{") and raw not in skip]

    # A mask or a clip path only says which parts show, and its white is no colour.
    painted_text = re.sub(r"<(mask|clipPath)\b.*?</\1>", " ", body, flags=re.S) + " " + " ".join(root_attrs)
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
        root_attrs.append('fill="var(--mark-ink, #000000)"')
        found = ["#000000"]
    return box, body, root_attrs, found, ground, largest or plate


def _svg(box, root_attrs, body):
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="%s"%s>%s</svg>' % (
        box, "".join(" " + a for a in root_attrs), body)


def local_hover(slug, marks):
    """`<slug>-hover.svg`, the brand's single-colour version, as the lit tile's
    drawing: its parts turn the tile's ink and a part lying on another becomes
    a cut-out. Its own colours never show, so none needs a second value."""
    box, body, root_attrs, _, _, _ = _drawing(slug, slug + "-hover", marks, "glim-%s-hover" % slug)
    return crop_to_ink(_svg(box, root_attrs, body), slug + " hover")


def local(slug, name, source, licence, marks, hover=None):
    box, body, root_attrs, found, ground, largest = _drawing(slug, slug, marks, "glim-" + slug)
    colour, ink = tile(slug, largest, marks)
    swap = themed(found, slug, marks, ground)
    body = apply_swap(body, swap)
    root_attrs = [apply_swap(a, swap) for a in root_attrs]
    return entry(slug, "%s. Source: %s (%s)." % (name, source, licence),
                 crop_to_ink(_svg(box, root_attrs, body), slug), colour, ink, hover=hover)


def simple_data(icons):
    """Each brand's own colour and the licence of its icon, from Simple Icons'
    data file, by slug. An icon that names no licence of its own is CC0, as
    the set is."""
    path = icons.parent / "data" / "simple-icons.json"
    raw = json.loads(io.open(path, encoding="utf-8").read())
    return {
        item.get("slug") or re.sub(r"[^a-z0-9]", "", item.get("title", "").lower()):
            ("#" + item["hex"], (item.get("license") or {}).get("type", "CC0"))
        for item in (raw["icons"] if isinstance(raw, dict) else raw)
    }


def write(out, head, entries, const, type_name):
    """The module: the marks in the order of their ids, then the map of them all."""
    ids = sorted(entries)
    parts = [head] + [entries[i] for i in ids] + [
        "/** Every mark, by the id an app addresses it with. */\n"
        "export const %s = { %s } as const;\n\n"
        "export type %s = keyof typeof %s;\n" % (const, ", ".join(ids), type_name, const)
    ]
    io.open(out, "w", encoding="utf-8", newline="\n").write("\n".join(parts))
    return ids
