# The storage providers' marks, and where they come from

`scripts/gen_storage_marks.py` turns these files, and the marks it takes from
Simple Icons, into `src/storageMarks.ts`: each mark as markup for `BrandMark`,
with the colour its tile lights up in ("Brand tiles" in the design language).
The storage catalog in `src/storageProviders.ts` names the mark each provider
wears, and an app reaches them through `@glimstone/core/storageProviders`.

The generator treats these files the way it treats the notification services'
marks (see `../service-marks/README.md`): gradients and groups stay as drawn,
every `id` gets a `glim-<id>-` prefix, an Illustrator `<style>` block is folded
into the elements it paints, a plate the mark sits on is dropped, the viewBox
is tightened onto the ink, and every colour is wrapped in `var(--mark-ink, ...)`
or `var(--mark-cut, ...)`.

## Sources and licences

**Simple Icons** (<https://simpleicons.org>) for `akamai`, `backblaze`, `box`,
`ceph`, `citrix`, `cloudflare`, `cloudinary`, `digitalocean`, `doi`, `dropbox`,
`googlecloud`, `googlephotos`, `hadoop`, `hetzner`, `huawei`,
`internetarchive`, `ionos`, `mailru`, `minio`, `nextcloud`, `openstack`, `ovh`,
`owncloud`, `protondrive`, `scaleway`, `seafile`, `wasabi`, `yandexcloud` and
`zoho`. The set is **CC0 1.0** and asks for nothing. Simple Icons records a
licence of its own for some icons, and the generator copies it into the comment
above the mark: of these, only `hadoop`, Apache Hadoop's elephant, has one, the
**Apache-2.0** licence, whose text is beside this file as
`LICENSE-apache-2.0.txt`.

**Dashboard Icons** (`homarr-labs/dashboard-icons`, <https://dashboardicons.com>),
under **Apache-2.0** (text in `LICENSE-apache-2.0.txt`), copyright the Homarr
Labs team and contributors:

- `aws.svg` is `svg/aws.svg`, `azure.svg` is `svg/azure.svg`, `filen.svg`,
  `filescom.svg`, `garage.svg`, `icloud.svg`, `idrive.svg`, `linode.svg`,
  `pcloud.svg`, `premiumize.svg` and `storj.svg` are the files of those names,
  `googledrive.svg` is `svg/google-drive.svg`, `mega.svg` is
  `svg/mega-nz.svg`, `onedrive.svg` is `svg/microsoft-onedrive.svg` and
  `oraclecloud.svg` is `svg/oracle-cloud.svg`.
- `kdrive.svg` is `svg/infomaniak-kdrive.svg` and `versity.svg` is
  `svg/versitygw.svg`, each with the word beside the mark left out, since the
  provider's name stands beside it on the tile.

**The projects' own repositories**, each under the licence of its repository:

- `juicefs.svg`: `docs/en/images/juicefs-logo-new.svg` from
  <https://github.com/juicedata/juicefs>, **Apache-2.0**, the two-tone mark
  without the word, the hidden layer and Inkscape's metadata. Its two loops
  cross, so a lit tile turns both into ink rather than one into a cut-out.
- `opencloud.svg`: `services/idp/src/images/icon-lilac.svg` from
  <https://github.com/opencloud-eu/opencloud>, **Apache-2.0**. The light theme
  draws it in the petrol of the project's own light logo,
  `src/resources/theme/light-systray/ocl-ui_logo-petrol.svg` in
  <https://github.com/opencloud-eu/desktop>.
- `seaweedfs.svg`: `note/icon.svg` from
  <https://github.com/seaweedfs/seaweedfs>, **Apache-2.0**, unmodified.
- `internxt.svg`: `src/assets/icons/small-logo.svg` from
  <https://github.com/internxt/drive-web>, **AGPL-3.0**, unmodified.
- `pixeldrain.svg`: `res/static/img/pixeldrain.svg` from
  <https://github.com/Fornaxian/pixeldrain_web>, **AGPL-3.0**, unmodified.
- `silo.svg`: `.github/silo.svg` from <https://github.com/pgsty/silo>,
  **AGPL-3.0**, the emblem on its own.

**The brands' own websites and material**, for the providers no icon set
carries. Each is its owner's, used under the trademark position below rather
than under a licence.

- `dosya.svg`: <https://dosya.dev/favicon.svg>, with the colours its light theme
  gives the two classes written onto the parts. The generator brings back the
  dark theme's own `#fafafa` and `#22c55e`.
- `drime.svg`: the brand mark in the footer of <https://drime.cloud>, where the
  page carries it as an inline SVG.
- `fichier.svg`: 1Fichier has its logo only as PNG, `logo.png` on
  <https://img.1fichier.com>. The cube was traced from it, with the soft shadow
  under it left out, in six tones, each the average of one area: the three
  faces, the heart, and the black and grey of the small cubes.
- `filelu.svg`: FileLu publishes its logo only as PNG, in the gallery at
  <https://filelu.com/images/logo/>. The circle and its four straight-edged
  shapes were traced from `white_logo.png`, the largest there, with the two
  blues sampled from the top and the bottom of the circle.
- `imagekit.svg`: `nodes/Imagekit/imagekit.light.svg` from ImageKit's own
  repository <https://github.com/imagekit-developer/n8n-nodes-imagekit>.
- `jottacloud.svg`: <https://jottacloud.com/cms_uploads/logos/Logo-1.svg>, the
  logo in the site's header, without the word.
- `putio.svg`: <https://put.io/_astro/favicon.BBPAv1GZ.svg>, the app icon the
  home page offers to copy. put.io's brand page asks for its SVGs to be used as
  they are, and the file is, apart from the plate the generator drops.
- `qingcloud.svg`: `wp-content/themes/public/assets/images/ai-chat/qingcloud_logo.svg`
  from <https://www.qingcloud.com>.
- `quatrix.svg`: <https://www.quatrix.it/assets/img/quatrix-logo.svg>, the logo
  in the site's header, without the word.
- `shade.svg`: the logo in the header of <https://shade.inc>, an inline SVG
  symbol given its own `svg` element with the namespace and nothing else
  changed.
- `sugarsync.svg`: <https://www1.sugarsync.com/assets/img/logo-adfca65fa4.svg>,
  the logo in the site's header, without the word.
- `ulozto.svg`: the first inline SVG in the header of <https://ulozto.net>, the
  three-colour mark without the word.

Apache-2.0 may be carried into this project's AGPL-3.0, and the AGPL-3.0 files
are under this project's own licence, so the combined work stays AGPL-3.0.

## Owners' marks for a narrower product

A few providers wear the mark of the company that runs them, because the
product has none of its own that could be sourced cleanly. The mark names the
right owner, if a broader thing than the tile does:

- Amazon S3 wears the AWS logo.
- Azure Blob Storage and Azure Files wear Azure's mark.
- Google Cloud Storage wears Google Cloud's.
- Huawei Drive and Huawei Cloud OBS wear Huawei's.
- IONOS HiDrive and IONOS Object Storage wear the IONOS logo.
- Linode Object Storage wears Linode's, and Akamai NetStorage Akamai's.
- Oracle Object Storage wears Oracle Cloud's.
- QingStor wears QingCloud's, and ShareFile the Citrix mark it is filed under.
- Yandex Disk wears Yandex Cloud's.
- Hetzner Object Storage and the Storage Box wear Hetzner's.

A mark naming a different company's product is worse than none. A provider
whose own mark has no clean source wears the glyph of its kind instead: Gofile,
Koofr, Linkbox, OpenDrive and Synology C2 publish their logos only as PNG, the
PikPak logo lives only inside the site's script bundle, and the trademark
policy that Simple Icons points to for RustFS's icon is no longer online. Sia's
favicon is a checkerboard whose dark squares vanish on the dark tile and which
turns into a blank square once lit.

## Trademarks

Every mark here is a trademark of its owner. It is used the one way a trademark
may be used without permission, to refer to the thing it names: a mark sits on
the tile that picks **that provider**, reproduced unmodified apart from its
colour, and nothing here claims endorsement by or affiliation with any of them.

## Adding one

For a mark Simple Icons carries, add a line to `SIMPLE` in the generator. For
any other, drop the SVG in here as its source has it, leaving out at most the
word beside the mark, add a line to `LOCAL` naming its source and licence, add
both to the section above and the licence's text beside this file when it asks
for one, then give the provider its `mark` in `src/storageProviders.ts` and run
the generator:

    npm pack simple-icons@16 && tar xzf simple-icons-*.tgz
    python scripts/gen_storage_marks.py package/icons

It needs `svgelements` (`pip install svgelements`) to measure where a mark
paints.
