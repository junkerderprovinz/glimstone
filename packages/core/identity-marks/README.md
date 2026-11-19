# The sign-in services' marks, and where they come from

`scripts/gen_identity_marks.py` turns these files, and the marks it takes from
Simple Icons, into `src/identityMarks.ts`: each mark as markup for `BrandMark`,
with the colour its tile lights up in ("Brand tiles" in the design language).
The identity catalog in `src/identityProviders.ts` names the mark each service
wears, and an app reaches them through `@glimstone/core/identityProviders`.

The generator treats these files the way it treats the storage providers' marks
(see `../storage-marks/README.md`): gradients and groups stay as drawn, every
`id` gets a `glim-<id>-` prefix, the viewBox is tightened onto the ink, and
every colour is wrapped in `var(--mark-ink, ...)` or `var(--mark-cut, ...)`.
A logo of several colours that would melt into one blot on its lit tile also
brings a `hover` drawing, the brand's single-colour version with its holes,
which the lit tile shows instead.

## Sources and licences

**Simple Icons** (<https://simpleicons.org>) for `authelia` and `authentik`.
The set is **CC0 1.0** and asks for nothing. Simple Icons records a licence of
its own for some icons, and the generator copies it into the comment above the
mark: Authelia's, taken from its own repository, is under the **Apache-2.0**
licence, whose text is beside this file as `LICENSE-apache-2.0.txt`.

**Dashboard Icons** (`homarr-labs/dashboard-icons`, <https://dashboardicons.com>),
under **Apache-2.0**, copyright the Homarr Labs team and contributors:
`zitadel.svg` is `svg/zitadel.svg`, unmodified. Its outline, dots and strokes
are near-black and turn white on the dark theme, where they would vanish into
the tile, and on the lit tile every part takes the ink, since the chevrons lie
beside the outline rather than on it.

**The service's own repository**: `pocketid.svg` is
`backend/resources/default-images/logoLight.svg` from
<https://github.com/pocket-id/pocket-id>, **BSD-2-Clause**, copyright Elias
Schneider (text in `LICENSE-pocket-id.txt`), unmodified.

**The brand's own material**, used under the trademark position below rather
than under a licence: `keycloak.svg` and `keycloak-hover.svg` are
`projects/keycloak/icon/color/keycloak-icon-color.svg` and
`projects/keycloak/icon/black/keycloak-icon-black.svg` from the CNCF's artwork
repository <https://github.com/cncf/artwork>, whose logos are used under the
Linux Foundation's trademark policy. The lit tile shows the black one, since
in a single ink the colour one's facets swallow its two blue brackets.

Apache-2.0 and BSD-2-Clause may be carried into this project's AGPL-3.0, so the
combined work stays AGPL-3.0.

## Left out

A service whose own mark has no clean source wears the sign-in glyph. Kanidm's
repository licenses its artwork CC-BY-NC-ND, which rules out a work that may be
sold and a recoloured copy. The Kanidm icon in Dashboard Icons is that same
artwork, so Kanidm wears the glyph.

## Trademarks

Every mark here is a trademark of its owner. It is used the one way a trademark
may be used without permission, to refer to the thing it names: a mark sits on
the tile that picks **that service**, reproduced unmodified apart from its
colour, and nothing here claims endorsement by or affiliation with any of them.

## Adding one

For a mark Simple Icons carries, add a line to `SIMPLE` in the generator. For
any other, drop the SVG in here as its source has it, leaving out at most the
word beside the mark, add a line to `LOCAL` naming its source and licence, add
both to the section above and the licence's text beside this file when it asks
for one. A logo whose colours do not survive one ink gets its brand's
single-colour version as `<id>-hover.svg` and its id under `HOVER`. Then give
the service its `mark` in `src/identityProviders.ts` and run the generator:

    npm pack simple-icons@16 && tar xzf simple-icons-*.tgz
    python scripts/gen_identity_marks.py package/icons

It needs `svgelements` (`pip install svgelements`) to measure where a mark
paints.
