"""Generate the storage providers' marks in packages/core/src/storageMarks.ts.

    npm pack simple-icons@16 somewhere and unpack it, then:
    python scripts/gen_storage_marks.py <path to simple-icons/icons>

Two kinds of source, as for the notification services' marks. The SIMPLE ones
come from Simple Icons, whose icons are CC0 unless the set names another licence
for one, which the generated comment then carries. The rest are whole SVG files
in packages/core/storage-marks/, each with its source and licence recorded below
and in that folder's README. Every mark is a trademark of its owner, used only
to name the provider it refers to, on a tile that picks exactly that provider,
reproduced unmodified apart from its colour, with no claim of endorsement by or
affiliation with any of them.

The machinery is in brand_marks.py, which needs the svgelements package (pip
install svgelements).
"""
import sys
from pathlib import Path

from brand_marks import BRAND, MarkSet, local, simple, simple_data, write

ROOT = Path(__file__).parent.parent
SRC = Path(sys.argv[1]) if len(sys.argv) > 1 else None
OUT = ROOT / "packages" / "core" / "src" / "storageMarks.ts"

DASHBOARD = "Apache-2.0"
SELFHST = "CC-BY-4.0"

# The id a catalog entry names its mark by -> the Simple Icons slug, with what it is.
SIMPLE = [
    ("akamai", "akamai", "Akamai"),
    ("backblaze", "backblaze", "Backblaze"),
    ("box", "box", "Box"),
    ("ceph", "ceph", "Ceph"),
    ("citrix", "citrix", "Citrix, which ShareFile is filed under"),
    ("cloudflare", "cloudflare", "Cloudflare"),
    ("cloudinary", "cloudinary", "Cloudinary"),
    ("digitalocean", "digitalocean", "DigitalOcean"),
    ("doi", "doi", "DOI"),
    ("dropbox", "dropbox", "Dropbox"),
    ("googlecloud", "googlecloud", "Google Cloud"),
    ("googlephotos", "googlephotos", "Google Photos"),
    ("hadoop", "apachehadoop", "Apache Hadoop, for HDFS"),
    ("hetzner", "hetzner", "Hetzner"),
    ("huawei", "huawei", "Huawei"),
    ("internetarchive", "internetarchive", "Internet Archive"),
    ("ionos", "ionos", "IONOS"),
    ("mailru", "maildotru", "Mail.ru"),
    ("minio", "minio", "MinIO"),
    ("nextcloud", "nextcloud", "Nextcloud"),
    ("openstack", "openstack", "OpenStack"),
    ("ovh", "ovh", "OVHcloud"),
    ("owncloud", "owncloud", "ownCloud"),
    ("protondrive", "protondrive", "Proton Drive"),
    ("scaleway", "scaleway", "Scaleway"),
    ("seafile", "seafile", "Seafile"),
    ("wasabi", "wasabi", "Wasabi"),
    ("yandexcloud", "yandexcloud", "Yandex Cloud"),
    ("zoho", "zoho", "Zoho"),
]

# The id -> the file in storage-marks/, what it is, where it comes from, its licence.
LOCAL = [
    ("aws", "Amazon Web Services", "homarr-labs/dashboard-icons, svg/aws.svg", DASHBOARD),
    ("azure", "Microsoft Azure", "homarr-labs/dashboard-icons, svg/azure.svg", DASHBOARD),
    ("filen", "Filen", "homarr-labs/dashboard-icons, svg/filen.svg", DASHBOARD),
    ("filescom", "Files.com", "homarr-labs/dashboard-icons, svg/filescom.svg", DASHBOARD),
    ("garage", "Garage", "homarr-labs/dashboard-icons, svg/garage.svg", DASHBOARD),
    ("googledrive", "Google Drive", "homarr-labs/dashboard-icons, svg/google-drive.svg", DASHBOARD),
    ("icloud", "iCloud", "homarr-labs/dashboard-icons, svg/icloud.svg", DASHBOARD),
    ("idrive", "IDrive", "homarr-labs/dashboard-icons, svg/idrive.svg", DASHBOARD),
    ("kdrive", "kDrive", "homarr-labs/dashboard-icons, svg/infomaniak-kdrive.svg, the mark without the word",
     DASHBOARD),
    ("linode", "Linode", "homarr-labs/dashboard-icons, svg/linode.svg", DASHBOARD),
    ("mega", "MEGA", "homarr-labs/dashboard-icons, svg/mega-nz.svg", DASHBOARD),
    ("onedrive", "OneDrive", "homarr-labs/dashboard-icons, svg/microsoft-onedrive.svg", DASHBOARD),
    ("oraclecloud", "Oracle Cloud", "homarr-labs/dashboard-icons, svg/oracle-cloud.svg", DASHBOARD),
    ("pcloud", "pCloud", "homarr-labs/dashboard-icons, svg/pcloud.svg", DASHBOARD),
    ("premiumize", "premiumize.me", "homarr-labs/dashboard-icons, svg/premiumize.svg", DASHBOARD),
    ("storj", "Storj", "homarr-labs/dashboard-icons, svg/storj.svg", DASHBOARD),
    ("versity", "Versity", "homarr-labs/dashboard-icons, svg/versitygw.svg, the mark without the word",
     DASHBOARD),

    ("internxt", "Internxt", "internxt/drive-web, src/assets/icons/small-logo.svg", "AGPL-3.0"),
    ("juicefs", "JuiceFS",
     "juicedata/juicefs, docs/en/images/juicefs-logo-new.svg, the mark without the word", "Apache-2.0"),
    ("opencloud", "OpenCloud", "opencloud-eu/opencloud, services/idp/src/images/icon-lilac.svg", "Apache-2.0"),
    ("rustfs", "RustFS", "rustfs/console, assets/logo-symbol.svg", "Apache-2.0"),
    ("pixeldrain", "Pixeldrain", "Fornaxian/pixeldrain_web, res/static/img/pixeldrain.svg", "AGPL-3.0"),
    ("seaweedfs", "SeaweedFS", "seaweedfs/seaweedfs, note/icon.svg", "Apache-2.0"),
    ("silo", "Silo", "pgsty/silo, .github/silo.svg", "AGPL-3.0"),

    ("dosya", "dosya.dev", "dosya.dev/favicon.svg, in its light colours", BRAND),
    ("drime", "Drime", "drime.cloud, the brand mark in the page footer", BRAND),
    ("fichier", "1Fichier", "traced from img.1fichier.com/logo.png, which has no vector", BRAND),
    ("filelu", "FileLu", "traced from filelu.com/images/logo/white_logo.png, which has no vector", BRAND),
    ("imagekit", "ImageKit", "imagekit-developer/n8n-nodes-imagekit, nodes/Imagekit/imagekit.light.svg", BRAND),
    ("jottacloud", "Jottacloud", "jottacloud.com/cms_uploads/logos/Logo-1.svg, the mark without the word", BRAND),
    ("putio", "put.io", "put.io, the site's favicon, which put.io/brand hands out as the app icon", BRAND),
    ("qingcloud", "QingCloud",
     "qingcloud.com, wp-content/themes/public/assets/images/ai-chat/qingcloud_logo.svg", BRAND),
    ("quatrix", "Quatrix", "quatrix.it/assets/img/quatrix-logo.svg, the mark without the word", BRAND),
    ("shade", "Shade", "shade.inc, the logo in the page header", BRAND),
    ("sugarsync", "SugarSync", "sugarsync.com, assets/img/logo-adfca65fa4.svg, the mark without the word", BRAND),
    ("ulozto", "Ulož.to", "ulozto.net, the logo in the page header, the mark without the word", BRAND),
    ("koofr", "Koofr", "koofr.eu, static/gen/a89ebffb2dead3f76e64.svg, the logo its stylesheet draws", BRAND),
    ("pikpak", "PikPak", "mypikpak.com, the mark of the LogoSVG component in the site's script", BRAND),
    ("sia", "Sia", "sia.tech, _astro/sia_logo_dark.CszkgMV_.svg", BRAND),

    ("oxicloud", "OxiCloud", "selfhst/icons, svg/oxicloud.svg", SELFHST),
]

HEAD = """// The marks of storage providers, as markup for BrandMark, each with the
// colour its tile lights up in and the ink that holds on it ("Brand tiles").
// Written by scripts/gen_storage_marks.py; packages/core/storage-marks/ holds
// the sources, their licences and the README that records where each came from.
//
// Every mark is a trademark of its owner, used only to name the provider it
// refers to, on a tile that picks exactly that provider, reproduced unmodified
// apart from its colour, with no claim of endorsement by or affiliation with
// any of them. The storage catalog names the mark each provider wears; a
// provider whose brand has no clean source wears the app's glyph instead.

import type { TileMark } from "./picker.ts";
"""

FORCE_THEMED = {
    # dosya.dev's own dark colours, which its favicon switches to by a media
    # query this generator does not carry.
    "dosya": {"#18181b": ("#fafafa", "#18181b"), "#16a34a": ("#22c55e", "#16a34a")},
    # OpenCloud's lilac on the dark ground and its petrol on the light one, the
    # pair its own light and dark logos use.
    "opencloud": {"#e2baff": ("#e2baff", "#20434f")},
    # Sia's near-black letters, which its coloured squares keep from being
    # lifted, in white on the dark ground.
    "sia": {"#1D2609": ("#ffffff", "#1D2609")},
}

TILE_COLOUR = {
    # Koofr's green from its own stylesheet, for a mark drawn in white.
    "koofr": ("#71ba05", None),
    # Sia's green square rather than the near-black of its letters.
    "sia": ("#36d955", None),
    # OpenCloud's lilac on its petrol, the brand's own pair.
    "opencloud": ("#20434f", "#e2baff"),
    # A white drawing with no colour of its own, lit on black as the brand's
    # dark site shows it.
    "pixeldrain": ("#000000", None),
    # The Azure blue rather than the light cyan the gradient covers most with.
    "azure": ("#0072c6", None),
    # OneDrive's blue, which none of its four cloud tones is on its own.
    "onedrive": ("#0078d4", None),
    # Garage's orange rather than the yellow of the parcel's lid.
    "garage": ("#ff9329", None),
    # SeaweedFS blue rather than the pale cyan it covers most with, so its
    # bubbles stay white.
    "seaweedfs": ("#0162bf", None),
    # The navy AWS sets its logo on, rather than the black of the letters.
    "aws": ("#232f3e", None),
}

# JuiceFS's two loops cross rather than one lying in the other, so both turn
# ink and the lit mark keeps its outline.
ONE_INK = {"juicefs"}

MARKS = MarkSet(ROOT / "packages" / "core" / "storage-marks", FORCE_THEMED, set(), TILE_COLOUR, ONE_INK)

if SRC is None or not SRC.is_dir():
    raise SystemExit("pass the icons folder of simple-icons@16: python scripts/gen_storage_marks.py <path>")

data = simple_data(SRC)
entries = {m[0]: simple(*m, SRC, data, MARKS) for m in SIMPLE}
entries.update({m[0]: local(*m, MARKS) for m in LOCAL})
ids = write(OUT, HEAD, entries, "STORAGE_MARKS", "StorageMarkId")
print("%s: %d marks (%d from Simple Icons, %d from storage-marks/)" % (OUT.name, len(ids), len(SIMPLE), len(LOCAL)))
