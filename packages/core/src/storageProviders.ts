// The storage catalog: the clouds, bucket stores and protocols an app can keep
// files in, each with its mark. An app passes the ids it can reach to
// catalogPicker and keeps what it needs to connect (a backend, a preset, how
// to sign in) beside them by id.
//
// A service that hands out buckets is storage, whoever runs the machine. Of the
// rest, a service somebody looks for by name is a cloud and something they
// point at by address is a protocol, even where it is a product. A target
// built on another target names no product and stands last.
//
// A provider wears its own mark or its owner's, never a neighbour's: a mark
// naming the wrong service is worse than the glyph of its kind.

import type { Catalog, CatalogEntry } from "./catalog.ts";
import { STORAGE_MARKS as M } from "./storageMarks.ts";

export type StorageGroup = "cloud" | "storage" | "protocol" | "layered";

const S3 = ["s3"];

const ENTRIES = [
  { id: "box", name: "Box", group: "cloud", mark: M.box },
  { id: "dosya", name: "dosya.dev", group: "cloud", mark: M.dosya },
  { id: "drime", name: "Drime", group: "cloud", mark: M.drime },
  { id: "dropbox", name: "Dropbox", group: "cloud", mark: M.dropbox },
  { id: "filefabric", name: "Enterprise File Fabric", group: "cloud", terms: ["Storage Made Easy"], glyph: "IconCloud" },
  { id: "filelu", name: "FileLu", group: "cloud", mark: M.filelu },
  { id: "filen", name: "Filen", group: "cloud", mark: M.filen },
  { id: "filescom", name: "Files.com", group: "cloud", mark: M.filescom },
  { id: "fichier", name: "1Fichier", group: "cloud", mark: M.fichier },
  { id: "gdrive", name: "Google Drive", group: "cloud", mark: M.googledrive },
  { id: "googlephotos", name: "Google Photos", group: "cloud", mark: M.googlephotos },
  { id: "gofile", name: "Gofile", group: "cloud", glyph: "IconCloud" },
  { id: "hidrive", name: "IONOS HiDrive", group: "cloud", mark: M.ionos },
  { id: "huaweidrive", name: "Huawei Drive", group: "cloud", mark: M.huawei },
  { id: "icloud", name: "iCloud Drive", group: "cloud", terms: ["Apple"], mark: M.icloud },
  { id: "internxt", name: "Internxt", group: "cloud", mark: M.internxt },
  { id: "jottacloud", name: "Jottacloud", group: "cloud", mark: M.jottacloud },
  { id: "kdrive", name: "kDrive", kind: "Infomaniak", group: "cloud", mark: M.kdrive },
  { id: "koofr", name: "Koofr", group: "cloud", mark: M.koofr },
  { id: "linkbox", name: "Linkbox", group: "cloud", glyph: "IconCloud" },
  { id: "mailru", name: "Mail.ru Cloud", group: "cloud", mark: M.mailru },
  { id: "mega", name: "MEGA", group: "cloud", mark: M.mega },
  { id: "nextcloud", name: "Nextcloud", group: "cloud", terms: ["WebDAV"], mark: M.nextcloud },
  { id: "onedrive", name: "OneDrive", group: "cloud", terms: ["Microsoft", "SharePoint"], mark: M.onedrive },
  { id: "opencloud", name: "OpenCloud", group: "cloud", terms: ["WebDAV", "Infinite Scale"], mark: M.opencloud },
  { id: "opendrive", name: "OpenDrive", group: "cloud", glyph: "IconCloud" },
  { id: "owncloud", name: "ownCloud", group: "cloud", terms: ["WebDAV"], mark: M.owncloud },
  { id: "oxicloud", name: "OxiCloud", group: "cloud", terms: ["WebDAV"], mark: M.oxicloud },
  { id: "pcloud", name: "pCloud", group: "cloud", mark: M.pcloud },
  { id: "pikpak", name: "PikPak", group: "cloud", mark: M.pikpak },
  { id: "pixeldrain", name: "Pixeldrain", group: "cloud", mark: M.pixeldrain },
  { id: "premiumize", name: "premiumize.me", group: "cloud", mark: M.premiumize },
  { id: "protondrive", name: "Proton Drive", group: "cloud", mark: M.protondrive },
  { id: "putio", name: "put.io", group: "cloud", mark: M.putio },
  { id: "quatrix", name: "Quatrix", group: "cloud", terms: ["Maytech"], mark: M.quatrix },
  { id: "seafile", name: "Seafile", group: "cloud", mark: M.seafile },
  { id: "shade", name: "Shade", group: "cloud", mark: M.shade },
  { id: "sharefile", name: "ShareFile", group: "cloud", terms: ["Citrix"], mark: M.citrix },
  { id: "sugarsync", name: "SugarSync", group: "cloud", mark: M.sugarsync },
  { id: "ulozto", name: "Ulož.to", group: "cloud", mark: M.ulozto },
  { id: "yandex", name: "Yandex Disk", group: "cloud", mark: M.yandexcloud },
  { id: "zoho", name: "Zoho WorkDrive", group: "cloud", mark: M.zoho },

  { id: "aws", name: "Amazon S3", group: "storage", mark: M.aws },
  { id: "azureblob", name: "Azure Blob Storage", group: "storage", terms: ["Microsoft"], mark: M.azure },
  { id: "azurefiles", name: "Azure Files", group: "storage", terms: ["Microsoft"], mark: M.azure },
  { id: "b2", name: "Backblaze B2", group: "storage", terms: S3, mark: M.backblaze },
  { id: "ceph", name: "Ceph", group: "storage", terms: [...S3, "RADOS"], mark: M.ceph },
  { id: "cloudinary", name: "Cloudinary", group: "storage", mark: M.cloudinary },
  { id: "gcs", name: "Google Cloud Storage", group: "storage", mark: M.googlecloud },
  { id: "garage", name: "Garage", group: "storage", terms: S3, mark: M.garage },
  { id: "hetznerobj", name: "Hetzner Object Storage", group: "storage", terms: S3, mark: M.hetzner },
  { id: "huaweiobs", name: "Huawei Cloud OBS", group: "storage", terms: S3, mark: M.huawei },
  { id: "idrivee2", name: "IDrive e2", group: "storage", terms: S3, mark: M.idrive },
  { id: "imagekit", name: "ImageKit", group: "storage", mark: M.imagekit },
  { id: "internetarchive", name: "Internet Archive", group: "storage", terms: ["archive.org"], mark: M.internetarchive },
  { id: "ionosobj", name: "IONOS Object Storage", group: "storage", terms: S3, mark: M.ionos },
  { id: "juicefs", name: "JuiceFS", group: "storage", terms: S3, mark: M.juicefs },
  { id: "linode", name: "Linode Object Storage", group: "storage", terms: [...S3, "Akamai"], mark: M.linode },
  { id: "minio", name: "MinIO", group: "storage", terms: S3, mark: M.minio },
  { id: "netstorage", name: "Akamai NetStorage", group: "storage", mark: M.akamai },
  { id: "oracle", name: "Oracle Object Storage", group: "storage", terms: ["OCI"], mark: M.oraclecloud },
  { id: "ovh", name: "OVHcloud Object Storage", group: "storage", terms: S3, mark: M.ovh },
  { id: "qingstor", name: "QingStor", group: "storage", terms: ["QingCloud"], mark: M.qingcloud },
  { id: "r2", name: "Cloudflare R2", group: "storage", terms: S3, mark: M.cloudflare },
  { id: "rustfs", name: "RustFS", group: "storage", terms: S3, mark: M.rustfs },
  { id: "s3", name: "S3 compatible", group: "storage", glyph: "IconDatabase", word: true },
  { id: "scaleway", name: "Scaleway Object Storage", group: "storage", terms: S3, mark: M.scaleway },
  { id: "seaweedfs", name: "SeaweedFS", group: "storage", terms: S3, mark: M.seaweedfs },
  { id: "sia", name: "Sia", group: "storage", mark: M.sia },
  { id: "silo", name: "Silo", group: "storage", terms: [...S3, "MinIO"], mark: M.silo },
  { id: "spaces", name: "DigitalOcean Spaces", group: "storage", terms: S3, mark: M.digitalocean },
  { id: "storj", name: "Storj", group: "storage", mark: M.storj },
  { id: "swift", name: "OpenStack Swift", group: "storage", mark: M.openstack },
  { id: "synologyc2", name: "Synology C2", group: "storage", terms: S3, glyph: "IconDatabase" },
  { id: "versity", name: "Versity S3 Gateway", group: "storage", mark: M.versity },
  { id: "wasabi", name: "Wasabi", group: "storage", terms: S3, mark: M.wasabi },

  { id: "doi", name: "DOI", group: "protocol", terms: ["Zenodo", "Dataverse", "Figshare"], mark: M.doi },
  { id: "ftp", name: "FTP", group: "protocol", terms: ["FTPS"], glyph: "IconUpload" },
  { id: "hdfs", name: "HDFS", group: "protocol", terms: ["Hadoop"], mark: M.hadoop },
  { id: "http", name: "HTTP", group: "protocol", terms: ["HTTPS"], glyph: "IconNetwork" },
  { id: "path", name: "Mounted path", group: "protocol", glyph: "IconLocal", word: true },
  { id: "rest", name: "rest-server", group: "protocol", terms: ["restic"], glyph: "IconShieldOn" },
  { id: "sftp", name: "SFTP", group: "protocol", terms: ["SSH"], glyph: "IconServer" },
  { id: "smb", name: "SMB", kind: "Windows share", group: "protocol", terms: ["CIFS", "Samba"], glyph: "IconFolder", word: true },
  { id: "storagebox", name: "Hetzner Storage Box", group: "protocol", terms: ["SFTP"], mark: M.hetzner },
  { id: "webdav", name: "WebDAV", group: "protocol", glyph: "IconLink" },

  { id: "alias", name: "Alias", group: "layered", glyph: "IconLink", word: true },
  { id: "archive", name: "Archive files", group: "layered", glyph: "IconArchive", word: true },
  { id: "cache", name: "Cache", group: "layered", glyph: "IconLocal", word: true },
  { id: "chunker", name: "Split into pieces", group: "layered", glyph: "IconFiles", word: true },
  { id: "combine", name: "Combined targets", group: "layered", glyph: "IconAdd", word: true },
  { id: "compress", name: "Compressed", group: "layered", glyph: "IconCompact", word: true },
  { id: "crypt", name: "Encrypted", group: "layered", glyph: "IconShieldOn", word: true },
  { id: "hasher", name: "Checksums", group: "layered", glyph: "IconHash", word: true },
  { id: "memory", name: "In memory", group: "layered", glyph: "IconDisc", word: true },
  { id: "union", name: "Merged targets", group: "layered", glyph: "IconMerge", word: true },
] as const satisfies readonly CatalogEntry<StorageGroup>[];

export type StorageProviderId = (typeof ENTRIES)[number]["id"];

/** Every storage provider, with its group's place in the picker. */
export const STORAGE_PROVIDERS: Catalog<StorageGroup, StorageProviderId> = {
  groups: ["cloud", "storage", "protocol", "layered"],
  entries: ENTRIES,
};
