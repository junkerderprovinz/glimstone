# The office suites' marks, and where they come from

`scripts/gen_office_marks.py` turns these files into `src/officeMarks.ts`:
each mark as markup for `BrandMark`, with the colour its tile lights up in
("Brand tiles" in the design language). An app reaches them through
`@glimstone/core/officeMarks`, for a row that names an office server, such as
a found OnlyOffice, Euro Office or Collabora container.

The generator treats these files the way it treats the storage providers' marks
(see `../storage-marks/README.md`): gradients and groups stay as drawn, every
`id` gets a `glim-<id>-` prefix, the viewBox is tightened onto the ink, and
every colour is wrapped in `var(--mark-ink, ...)` or `var(--mark-cut, ...)`.

## Sources and licences

- `onlyoffice.svg`: `web/documentserver-example/nodejs/public/images/mobile-logo.svg`
  from <https://github.com/ONLYOFFICE/document-server-integration>, the
  example app of the ONLYOFFICE Document Server, **Apache-2.0**, unmodified:
  the three stacked layers without the name. The tile lights in `#ff6f3d`, the
  orange of <https://www.onlyoffice.com/> and of the lowest layer.
- `collabora.svg`: `browser/branding/themes/collabora-online-brand/images/toolbar-bg-logo.svg`
  from <https://github.com/CollaboraOnline/online.mirror>, the read-only mirror
  of Collabora Online, **Apache-2.0** for `browser/branding/`, without the
  editor data Inkscape kept in it: the chevron of the toolbar without the
  name. The tile lights in the chevron's
  violet, `#5c2983`.
- `eurooffice.svg`: the linked O of `theme/euro-office/assets/img/header/eo_logo_light.svg`
  from <https://github.com/euro-office/web-apps>, the editor of Euro Office,
  **AGPL-3.0** like this project. The name around it is live text in a font
  of its own, so only the O, the one drawn part, is kept, with its gradient.
  The tile lights in `#0082c9`, the outer colour of the O and the blue of
  Euro Office's theme.

Apache-2.0 may be carried into this project's AGPL-3.0, so the combined work
stays AGPL-3.0. None of the licences grants trademark rights. The names and
marks stay with their owners (Ascensio System SIA for ONLYOFFICE, Collabora
Productivity for Collabora Online, the Euro Office project), and Collabora's
README points to <https://www.collaboraonline.com/trademark-policy/>: each mark
here only names the suite it belongs to.

## Regenerating

    pip install svgelements
    python scripts/gen_office_marks.py
