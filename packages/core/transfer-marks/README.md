# The transfer services' marks, and where they come from

`scripts/gen_transfer_marks.py` turns these files, and the marks it takes from
Simple Icons, into `src/transferMarks.ts`: each mark as markup for `BrandMark`,
with the colour its tile lights up in ("Brand tiles" in the design language).
The transfer catalog in `src/transferProviders.ts` names the mark each service
wears, and an app reaches them through `@glimstone/core/transferProviders`.

The generator treats these files the way it treats the storage providers' marks
(see `../storage-marks/README.md`): gradients and groups stay as drawn, every
`id` gets a `glim-<id>-` prefix, the viewBox is tightened onto the ink, and
every colour is wrapped in `var(--mark-ink, ...)` or `var(--mark-cut, ...)`.

## Sources and licences

**Simple Icons** (<https://simpleicons.org>) for `wetransfer`. The set is
**CC0 1.0** and asks for nothing, and the icon names no licence of its own.
Dashboard Icons has WeTransfer only as a picture wrapped in an SVG.

**Dashboard Icons** (`homarr-labs/dashboard-icons`, <https://dashboardicons.com>),
under **Apache-2.0** (text in `LICENSE-apache-2.0.txt`), copyright the Homarr
Labs team and contributors: `swisstransfer.svg` is the mark of
`svg/infomaniak-swisstransfer.svg`, its three stacked sheets and the arrow on
the front one, without the words "infomaniak" and "SwissTransfer" beside it and
the drawing program's page settings, which paint nothing. Its tile lights in
the green of the front sheet, `#3bb471`, rather than the paler ones behind it.

Apache-2.0 may be carried into this project's AGPL-3.0, so the combined work
stays AGPL-3.0.

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
for one, then give the service its `mark` in `src/transferProviders.ts` and run
the generator:

    npm pack simple-icons@16 && tar xzf simple-icons-*.tgz
    python scripts/gen_transfer_marks.py package/icons

It needs `svgelements` (`pip install svgelements`) to measure where a mark
paints.
