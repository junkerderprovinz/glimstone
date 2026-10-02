# Which glyph each app wears

[`glyphs.md`](glyphs.md) says which drawing means what. This file says where each app stands against it: one row per meaning, the GlimStone name, the component each app renders for it, and whether the two apps draw it the same way. An app that adds or swaps a glyph changes its row here in the same commit.

"Shared" means the same path data, whatever box an app renders it in. "Differs" means each app draws that meaning its own way. The row then names the drawing both should use once someone aligns them.

<br>

## 1. Actions

| Meaning | GlimStone | BombVault | KnightLoader | Drawing |
| --- | --- | --- | --- | --- |
| Show, reveal | `IconEye` | `IconEye` | `IconEye` | Shared: KnightLoader's lens with the pupil cut out |
| Hide again | `IconEyeOff` | `IconEyeOff` | `IconEyeOff` | Shared: the lens at 0.55 opacity under a diagonal bar |
| Refresh, retry | `IconRefresh` | `IconRefresh` | `IconRetry` | Differs; Streamline's wins |
| Upload, import | `IconUpload` | `IconUpload` | `IconUpload` | Differs; Streamline's wins |
| Download, export | `IconDownload` | `IconDownload` | `IconDownloads` | Differs; Streamline's wins. KnightLoader's also names its Downloads page |
| Search | `IconSearch` | `IconSearch` | `IconSearch` | Differs; Streamline's wins |
| Start, run now | `IconPlay` | `IconPlay` | `IconPlay` | Differs; Streamline's wins |
| Pause | none | none | `IconPause` | KnightLoader only |
| Stop, abort | `IconStop` | `IconStop` | `IconStop` | Differs; Streamline's wins |
| Power | `IconPower` | `IconPower` | `IconPower` | Differs; Streamline's wins |
| Delete | `IconTrash` | `IconTrash` | `IconTrash` | Differs; Streamline's wins |
| Add | `IconAdd` | `IconAdd` | `IconPlus` | Differs; the hand-drawn 10 by 2.8 plus wins |
| Close, cancel | `IconClose` | `IconClose`, `IconCancel` | `IconClose` | Differs; the plus turned 45° wins |
| Edit | `IconPencil` | `IconPencil` | `IconEdit` | Differs; Streamline's wins |
| Copy | `IconCopy` | `IconCopy` | `IconClipboard` | Differs; Tabler's wins |
| Verify, check | `IconCheckCircle` | `IconCheckCircle` | `IconCheck`, `IconCheckDrawn` | Differs. KnightLoader's drawn check animates, so it stays where the check is drawn in |
| Connect, pair | `IconLink` | `IconLink` | `IconLink` | Differs; Streamline's wins |
| Credentials | `IconKey` | `IconKey` | `IconKey` | Differs; Streamline's wins |
| Sign out | `IconSignOut` | `IconSignOut` | `IconSignOut` | Differs; Streamline's wins |
| Information | `IconInfo` | `IconInfo` | none | KnightLoader has `IconHelp`, a question mark, for Help |
| More | `IconEllipsis` | `IconEllipsis` | `IconMore` | Differs; three dots on the baseline win |
| Save | `IconSave` | `IconSave` | none | BombVault only |
| A protection is on | `IconShieldOn` | `IconShieldOn` | `IconShieldCheck` | Differs; Streamline's wins |
| Leave the app for a service's site | none | none | `IconExternalLink` | KnightLoader only |

<br>

## 2. Navigation and domain

| Meaning | GlimStone | BombVault | KnightLoader | Drawing |
| --- | --- | --- | --- | --- |
| Settings | `IconGear` | `IconGear` | `IconSettings` | Shared; KnightLoader pads the box so the cog matches its rail |
| Dashboard | `IconDashboard` | `IconDashboard` | `IconDashboard` | Differs; Streamline's wins |
| A folder | `IconFolder` | `IconFolder` | `IconFolder` | Differs; Streamline's wins |
| Docker containers | `IconContainers` | `IconContainers` | `IconContainer` | Shared: Simple Icons' whale |
| Fleet, other instances | `IconFleet` | `IconFleet` | `IconInstances` | Differs; Streamline's wins |
| Buy the author a coffee | `IconCoffee` | `IconCoffee` | `IconCoffee` | Differs; Streamline's wins |
| The GitHub repository | `IconGithub` | `IconGithub` | `IconGithub` | Differs; Simple Icons' mark wins |

<br>

## 3. Settings tabs

| Meaning | GlimStone | BombVault | KnightLoader | Drawing |
| --- | --- | --- | --- | --- |
| General | `IconTabGeneral` | `IconTabGeneral` | `IconTabGeneral` | Shared: Material's `tune`; BombVault crops to the ink |
| Look | `IconTabLook` | `IconTabLook` | `IconLook` | Shared: Streamline's palette |
| Security | `IconTabSecurity` | `IconShield` | `IconLock` | BombVault differs from the assortment, which gives Security the padlock |
| Pairing | `IconLink` | `IconLink` | `IconLink` | See Connect, pair |
| App, the other forms of the product | `IconTabApp` | none | `IconTabApp` | KnightLoader only |
| Apps, the companions | none | `IconApps` | none | BombVault only, drawn in `settingsPages.tsx` |
| Advanced | `IconTabAdvanced` | none | `IconTabAdvanced` | KnightLoader only |
| System | `IconTabSystem` | `IconTabSystem` | none | BombVault only |
| Schedules, automation | none | `IconSchedules` | `IconClock` | Each drawn in its own app; no assortment entry yet |
| Notifications | none | `IconNotifications` | none | BombVault only, drawn in `settingsPages.tsx` |

<br>

## 4. Where each app keeps its glyphs

- **BombVault:** `web/src/components/glyphs.tsx` and `navGlyphs.tsx`, both generated by `scripts/gen_glyphs.py`. `glyphFor.tsx` maps a translation key to a glyph when a button passes none; a button that passes one wins. Settings page glyphs that exist nowhere else are drawn in `pages/settings/settingsPages.tsx`.
- **KnightLoader:** `web/src/lib/icons.tsx`, written by hand on a 20-unit grid and rendered at 22px. Every call site passes its glyph, there is no pattern mapper. Settings page glyphs are mapped in `pages/settings/pageIcons.tsx`. The browser extension copies the eye in `extension/src/options.js`.
