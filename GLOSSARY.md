# GlimStone

The design language and components that a family of apps shares. This glossary names what its pickers and catalogs deal in, so that every catalog and every app adopting one uses the same words.

## Pickers and catalogs

**Provider**:
A kind of thing an app can connect to, as one tile names it: a storage protocol such as WebDAV, one particular cloud, a notification service.
_Avoid_: backend, remote type, service (for storage)

**Target**:
A provider that an app has set up, with its own address and access. Each app may call it by its own word in its interface.
_Avoid_: remote, location, destination

**Catalog**:
The shared list of one kind of provider, each with its mark, its group and the words a search finds it by. An app offers the providers it can reach and leaves out the rest.
_Avoid_: registry, directory

**Group**:
A heading in a picker that gathers providers of one sort. Groups stand in a fixed order, and the providers in a group stand in alphabetical order.
_Avoid_: category, section

**Mark**:
A brand's logo as a tile draws it, with the colour the tile lights up in and the ink that holds on it.
_Avoid_: icon, logo

**Glyph**:
One of the app's own drawings, for a provider that has no brand of its own.
_Avoid_: icon
