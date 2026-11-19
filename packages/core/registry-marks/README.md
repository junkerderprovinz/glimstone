# The container registries' marks, and where they come from

`scripts/gen_registry_marks.py` turns these files, and the marks it takes from
Simple Icons, into `src/registryMarks.ts`: each mark as markup for `BrandMark`,
with the colour its tile lights up in ("Brand tiles" in the design language).
The registry catalog in `src/registryProviders.ts` names the mark each registry
wears, and an app reaches them through `@glimstone/core/registryProviders`.

The generator treats these files the way it treats the storage providers'
marks (see `../storage-marks/README.md`). A logo of several colours that would
melt into one blot on its lit tile also brings a `hover` drawing, the brand's
single-colour version with its holes, which the lit tile shows instead.

## Sources and licences

**Simple Icons** (<https://simpleicons.org>) for `codeberg`, `docker`, `github`
and `googlecloud`, and for the lit tile's drawing of `gitea` and `gitlab`. The
set is **CC0 1.0** and asks for nothing.

**Dashboard Icons** (`homarr-labs/dashboard-icons`, <https://dashboardicons.com>),
under **Apache-2.0** (text in `LICENSE-apache-2.0.txt`), copyright the Homarr
Labs team and contributors: `aws.svg`, `azure.svg`, `forgejo.svg`, `gitea.svg`,
`gitlab.svg` and `quay.svg` are the files of those names in `svg/`.
`quay-hover.svg` is `quay.svg` in one colour: its darker half and its grey
chevrons take the red and the white of the rest, so the chevrons stand as holes
in the disc.

**The brand's own material**, used under the trademark position below rather
than under a licence:

- `harbor.svg` and `harbor-hover.svg`: `projects/harbor/icon/color/harbor-icon-color.svg`
  and `projects/harbor/icon/black/harbor-icon-black.svg` from the CNCF's
  artwork repository <https://github.com/cncf/artwork>, whose logos are used
  under the Linux Foundation's trademark policy. Each file's page-level
  `<style>` rule for `svg` is left out, which paints nothing.

Apache-2.0 may be carried into this project's AGPL-3.0, so the combined work
stays AGPL-3.0.

## Owners' marks for a narrower product

Amazon ECR wears the AWS logo, Azure Container Registry Azure's mark and Google
Artifact Registry Google Cloud's, as their storage siblings do. Codeberg wears
its own mark, not Forgejo's, though it runs on Forgejo.

## Trademarks

Every mark here is a trademark of its owner. It is used the one way a trademark
may be used without permission, to refer to the thing it names: a mark sits on
the tile that picks **that registry**, reproduced unmodified apart from its
colour, and nothing here claims endorsement by or affiliation with any of them.

## Adding one

For a mark Simple Icons carries, add a line to `SIMPLE` in the generator. For
any other, drop the SVG in here as its source has it, add a line to `LOCAL`
naming its source and licence, and record both in the section above. A logo
whose colours do not survive one ink gets its brand's single-colour version
under `HOVER`: a Simple Icons slug, or `<id>-hover.svg` beside the logo. Then
give the registry its `mark` in `src/registryProviders.ts` and run the
generator:

    npm pack simple-icons@16 && tar xzf simple-icons-*.tgz
    python scripts/gen_registry_marks.py package/icons

It needs `svgelements` (`pip install svgelements`) to measure where a mark
paints.
