// Every element of GlimStone under the names it goes by: English, German, the
// short form and how the code spells it. site/test/glossary.test.ts holds this
// list to the components the packages export, so a new component without an
// entry, or an entry for a removed one, fails the suite.

export interface Words {
  en: string;
  de: string;
}

export interface GlossaryEntry {
  id: string;
  en: string;
  de: string;
  abbr?: string;
  /** How the code spells it: a component, a prop, a class or a token. */
  code: string[];
  /** The exported components this entry stands for, in React or Vue. */
  components: string[];
  rules?: number[];
  /** The German name is a proposal until the owner of the language confirms it. */
  proposal?: boolean;
  text: Words;
  /** Further names that lead here in the index without an entry of their own. */
  also?: (Words & { abbr?: string; code: string; proposal?: boolean })[];
}

export interface GlossarySection extends Words {
  id: string;
  entries: GlossaryEntry[];
}

export const GLOSSARY: GlossarySection[] = [
  {
    id: "surfaces",
    en: "Surfaces",
    de: "Flächen",
    entries: [
      {
        id: "card",
        en: "Card",
        de: "Karte",
        code: ["Card", ".glim-panel"],
        components: ["Card"],
        rules: [1, 20],
        text: {
          en: "The one raised surface of a page. Its section badge sits in the notch on the top edge, and stacked cards keep 40px between them.",
          de: "Die eine erhobene Fläche einer Seite. Ihr AB sitzt in der Kerbe auf der Oberkante, gestapelte Karten halten 40 px Abstand.",
        },
      },
      {
        id: "sub-card",
        en: "Sub-card",
        de: "Sub-Card",
        abbr: "SC",
        code: ["SubCard", "SubCard title end", ".glim-subcard"],
        components: ["SubCard"],
        rules: [1, 11],
        text: {
          en: "A group inside a card or a window, filled one surface higher, with no border and no shadow. Its title is a section badge in the notch, and end holds what belongs to the whole group, such as a switch, at the end of that row.",
          de: "Eine Gruppe in einer Karte oder einem Fenster, eine Fläche höher gefüllt, ohne Rand und ohne Schatten. Ihr Titel ist ein AB in der Kerbe, und end hält, was zur ganzen Gruppe gehört, etwa einen Schalter, am Ende dieser Zeile.",
        },
      },
      {
        id: "well",
        en: "Well",
        de: "Mulde",
        code: [".glim-well"],
        components: [],
        text: {
          en: "A sunken surface for things that belong together, such as a tree or a row with a value display and a state badge. Fields and value displays inside it step up one surface.",
          de: "Eine eingelassene Fläche für etwas, das zusammengehört, etwa einen Baum oder eine Zeile mit Wertanzeige und Plakette. Felder und Wertanzeigen steigen darin eine Stufe auf.",
        },
      },
      {
        id: "empty-state",
        en: "Empty state",
        de: "Leerzustand",
        code: ["EmptyState", ".glim-empty"],
        components: ["EmptyState"],
        text: {
          en: "Stands where a list has nothing yet or a filter finds nothing. Each case gets a sentence of its own, so nobody looks for a filter that is not there.",
          de: "Steht dort, wo eine Liste noch nichts hat oder ein Filter nichts findet. Beide Fälle bekommen ihren eigenen Satz, damit niemand einen Filter sucht, den es nicht gibt.",
        },
      },
    ],
  },
  {
    id: "badges",
    en: "Headings and badges",
    de: "Überschriften und Badges",
    entries: [
      {
        id: "section-badge",
        en: "Section badge",
        de: "Abschnittsbadge",
        abbr: "AB, ABB",
        code: ['Badge tone="heading" size="heading"', ".glim-badge--notch"],
        components: [],
        rules: [11, 12],
        text: {
          en: "Every heading is a filled badge in the accent, never bare text. Its place is the notch: half over the top edge of its card, sub-card or window, flush with the content edge. The notch is that place, not an element of its own.",
          de: "Jede Überschrift ist ein gefülltes Badge in der Akzentfarbe, nie nackter Text. Sein Platz ist die Kerbe: halb über der Oberkante seiner Karte, Sub-Card oder seines Fensters, bündig mit der Inhaltskante. Die Kerbe ist dieser Platz, kein eigenes Element.",
        },
        also: [
          { en: "Notch", de: "Kerbe", code: ".glim-badge--notch" },
        ],
      },
      {
        id: "eyebrow",
        en: "Eyebrow",
        de: "Eyebrow",
        code: [".glim-eyebrow"],
        components: [],
        text: {
          en: "The small muted caption in tracked capitals, such as above a figure. It is not a heading. It shares its 11px with the plain caption and the bubble's text and differs only in treatment.",
          de: "Die kleine gedämpfte Beschriftung in Versalien mit Laufweite, etwa über einer Zahl. Sie ist keine Überschrift. Gleich groß wie die schlichte Beschriftung und der Text der Infoblase, nur anders behandelt.",
        },
      },
      {
        id: "badge",
        en: "Badge",
        de: "Badge",
        code: ["Badge", ".glim-badge"],
        components: ["Badge"],
        rules: [13],
        text: {
          en: 'The filled base form of everything clickable and every small fact. A link is a badge too. As as="button" or as="a" it keeps the same box.',
          de: 'Die gefüllte Grundform für alles Anklickbare und jede kleine Angabe. Auch ein Link ist ein Badge. Mit as="button" oder as="a" bleibt die Box gleich.',
        },
      },
      {
        id: "state-badge",
        en: "State badge",
        de: "Plakette",
        code: ['Badge tone="ok | warn | fail | neutral"'],
        components: [],
        rules: [4],
        text: {
          en: "A small badge in its state colour: green done, orange partial, red error, neutral unknown. A state that belongs to a name stands as an icon badge right before the name badge and keeps its colour in every colour mode.",
          de: "Ein kleines Zustandsbadge in seiner Zustandsfarbe: Grün fertig, Orange teilweise, Rot Fehler, neutral unbekannt. Gehört der Zustand zu einem Namen, steht er als eigenes Symbol-Badge direkt vor dem Namensbadge und behält seine Farbe in jedem Farbmodus.",
        },
      },
      {
        id: "badge-forms",
        en: "Badge forms",
        de: "Badge-Formen",
        code: ['Badge form="rounded | square | pill | circle"'],
        components: [],
        text: {
          en: "Four forms: rounded, square, pill and circle. Without a form a badge follows the shape setting. With one it keeps that form under every setting, and a pill's radius is half its height. Buttons and controls are rounded, never pills, and the circle is the form of a badge that holds one glyph.",
          de: "Vier Formen: abgerundet, eckig, Pille und Kreis. Ohne form folgt ein Badge der Formeinstellung, mit form behält es seine Form in jeder Einstellung, und der Radius einer Pille ist ihre halbe Höhe. Knöpfe und Bedienelemente sind abgerundet, nie Pillen, und der Kreis ist die Form für ein Badge mit nur einer Glyphe.",
        },
        also: [
          { en: "Rounded", de: "Abgerundet", code: 'Badge form="rounded"' },
          { en: "Square", de: "Eckig", code: 'Badge form="square"' },
          { en: "Pill", de: "Pille", code: 'Badge form="pill"' },
          { en: "Circle", de: "Kreis", code: 'Badge form="circle"' },
        ],
      },
      {
        id: "size-stage",
        en: "Size stage",
        de: "Größenstufe",
        code: ['Badge size="small | medium | large | icon"'],
        components: [],
        text: {
          en: "Named stages with one source for type size, padding and height. The same stage is the same pixels whatever element sits underneath. An icon badge is 32px everywhere.",
          de: "Benannte Stufen mit einer Quelle für Schrift, Innenabstand und Höhe. Gleiche Stufe heißt pixelgleich, egal welches Element darunter liegt. Ein Symbol-Badge ist überall 32 px groß.",
        },
      },
      {
        id: "value-display",
        en: "Value display",
        de: "Wertanzeige",
        proposal: true,
        code: ["Pill", ".glim-pill", "FieldRow value"],
        components: ["Pill"],
        rules: [33],
        text: {
          en: "One read-only value, such as a size or when something last ran. A field row with a single value shows it this way. The code calls it Pill, but it is neither a state badge nor the pill form.",
          de: "Ein einzelner Wert nur zum Lesen, etwa eine Größe oder wann etwas zuletzt lief. Eine Feldzeile mit nur einem Wert zeigt ihn so. Im Code heißt sie Pill, ist aber weder Plakette noch die Badge-Form Pille.",
        },
      },
    ],
  },
  {
    id: "buttons",
    en: "Buttons",
    de: "Knöpfe",
    entries: [
      {
        id: "button",
        en: "Button",
        de: "Knopf",
        code: ["Button", ".glim-btn"],
        components: ["Button"],
        rules: [3, 13, 38, 40],
        text: {
          en: "Everything clickable is a badge, links included. At most one full accent button per view, and under rainbow every button lights up in a colour of its own.",
          de: "Alles Anklickbare ist ein Badge, auch ein Link. Höchstens ein voller Akzent-Knopf pro Ansicht, im Regenbogen leuchtet jeder Knopf in seiner eigenen Farbe.",
        },
      },
      {
        id: "key-button",
        en: "Key button",
        de: "Schlüsselknopf",
        proposal: true,
        code: ['Button size="key"', ".glim-btn-key", "--btn-h-key"],
        components: [],
        rules: [19],
        text: {
          en: "The second button height, 40px instead of 32px, for the button a surface exists for, such as the one that creates what the page lists.",
          de: "Die zweite Knopfhöhe, 40 statt 32 px, für den Knopf, für den die Fläche da ist. Etwa der, der anlegt, was die Seite auflistet.",
        },
      },
      {
        id: "compact-button",
        en: "Compact button",
        de: "Kompaktknopf",
        proposal: true,
        code: ["Button compact", "compactBelow"],
        components: [],
        text: {
          en: "Shows its glyph alone in a square where the words have no room. The word stays its name and its bubble, and a count makes it grow.",
          de: "Zeigt nur seine Glyphe im Quadrat, wo die Worte keinen Platz haben. Das Wort bleibt Name und Blase, ein Zähler wächst mit.",
        },
      },
      {
        id: "chip-button",
        en: "Chip button",
        de: "Chip-Knopf",
        proposal: true,
        code: ['Button variant="chip"', ".glim-btn-chip"],
        components: [],
        text: {
          en: "The small remove button inside a value display, such as on a chosen path. It shows its glyph in every label mode.",
          de: "Der kleine Entfernen-Knopf in einer Wertanzeige, etwa an einem gewählten Pfad. Er zeigt in jedem Modus seine Glyphe.",
        },
      },
      {
        id: "icon-button",
        en: "Icon button",
        de: "Symbolknopf",
        proposal: true,
        code: ["IconButton", ".glim-icon-btn"],
        components: ["IconButton"],
        rules: [13],
        text: {
          en: "One glyph in a square in every label mode, for list rows and dense toolbars only. absent keeps the place of a button that is missing.",
          de: "Eine Glyphe im Quadrat, in jedem Beschriftungsmodus. Nur für Listenzeilen und dichte Werkzeugleisten, absent hält den Platz eines fehlenden Knopfs.",
        },
      },
      {
        id: "tip-button",
        en: "Tip button",
        de: "Blasenknopf",
        proposal: true,
        code: ["IconTipButton"],
        components: ["IconTipButton"],
        rules: [8],
        text: {
          en: "A bare trigger that brings only its bubble and its name. The app gives it its look, such as for row buttons of its own.",
          de: "Ein blanker Auslöser, der nur Blase und Namen mitbringt. Das Aussehen gibt die App, etwa für eigene Zeilenknöpfe.",
        },
      },
      {
        id: "readme-button",
        en: "README button",
        de: "README-Knopf",
        code: ["ReadmeButton", "BrandMark", ".glim-readme-btn"],
        components: ["ReadmeButton", "BrandMark"],
        text: {
          en: "Logo on the left, words on the right, and under the pointer it fills in its brand's colour. Every choice made by logo takes this form.",
          de: "Logo links, Text rechts, und beim Überfahren füllt er sich in der Farbe seiner Marke. Jede Auswahl nach Logo nimmt diese Form.",
        },
      },
      {
        id: "brand-tile",
        en: "Brand tile",
        de: "Markenkachel",
        code: [".glim-tile-<brand>", "--tile", "--tile-ink"],
        components: [],
        text: {
          en: "The fill a README button or a coin takes under the pointer: the brand's own colour with an ink measured against it. An app's own brand tile takes the accent and its computed ink.",
          de: "Die Füllung, die ein README-Knopf oder eine Münze beim Überfahren annimmt: die Farbe der Marke mit einer daran gemessenen Tinte. Die eigene Markenkachel einer App nimmt den Akzent und seine berechnete Tinte.",
        },
      },
    ],
  },
  {
    id: "pickers",
    en: "Pickers",
    de: "Wähler",
    entries: [
      {
        id: "selector-well",
        en: "Horizontal selector in the well",
        de: "Horizontaler Selektor in der Mulde",
        abbr: "HS",
        code: ['Selector variant="well" equalWidth', ".glim-sel--well"],
        components: ["Selector"],
        text: {
          en: "The groove form of the one horizontal selector: segments of equal width flush in one track, only the picked one filled. For a small fixed set such as Light, Dark, System. This is the default.",
          de: "Die Rillenform des einen waagerechten Wählers: gleich breite Segmente bündig in einer Bahn, nur das gewählte ist gefüllt. Für einen kleinen festen Satz wie Hell, Dunkel, System. Das ist die Vorgabe.",
        },
      },
      {
        id: "selector-chips",
        en: "Selector as a badge row",
        de: "HS als Badge-Reihe",
        abbr: "HS",
        code: ['Selector variant="chip"', ".glim-sel--chip"],
        components: [],
        text: {
          en: "Each segment is a quiet badge of its own, the picked one filled. For targets of equal weight, such as a filter.",
          de: "Jedes Segment ist ein eigenes leises Badge, das gewählte gefüllt. Für gleichrangige Ziele, etwa einen Filter.",
        },
      },
      {
        id: "selector-small",
        en: "Small well",
        de: "Kleine Mulde",
        abbr: "HS",
        code: ['Selector size="sm" inline'],
        components: [],
        text: {
          en: "The same well without the width binding, so each segment hugs its words. For a selector that recurs down a page or stands in a narrow panel.",
          de: "Dieselbe Mulde ohne Breitenbindung, die Segmente umschließen ihren Text. Für einen Wähler, der oft wiederkehrt oder in einem schmalen Feld steht.",
        },
      },
      {
        id: "selector-many",
        en: "Multiple choice",
        de: "Mehrfachauswahl",
        abbr: "HS",
        code: ['Selector select="many"'],
        components: [],
        text: {
          en: "The same selector, but each segment switches on its own. It always hands back the whole list.",
          de: "Derselbe Wähler, aber jedes Segment schaltet für sich. Er liefert immer die ganze Liste zurück.",
        },
      },
      {
        id: "tabs",
        en: "Tabs",
        de: "Reiter",
        code: ['Selector size="lg" variant="chip" panelId'],
        components: [],
        text: {
          en: "The pages of a settings area, along the top and each with a glyph. The row wraps and never scrolls, and each tab keeps a colour of its own.",
          de: "Die Seiten einer Einstellung, oben und jede mit Glyphe. Die Reihe bricht um und scrollt nie, jeder Reiter behält seine eigene Farbe.",
        },
      },
      {
        id: "row-tiles",
        en: "Row tiles",
        de: "Zeilenkacheln",
        abbr: "ZK",
        code: ['Selector orientation="vertical"', ".glim-sel-tile"],
        components: [],
        rules: [5, 21],
        text: {
          en: "The vertical selector: rows one below the other with no dot and no box, picked means filled, in multiple choice too. With glyphs it is the column beside the pages of a settings area, where a page with nothing on it yet is dimmed, not hidden. On a sub-card or in a well the resting tiles step up one surface.",
          de: "Der senkrechte Selektor: Zeilen untereinander ohne Punkt und Kästchen, gewählt heißt gefüllt, auch bei Mehrfachauswahl. Mit Glyphen ist er die Spalte neben den Seiten eines Einstellungsbereichs, dort ist eine Seite ohne Inhalt gedimmt, nicht versteckt. Auf einer Sub-Card oder in einer Mulde steigen die ruhenden Kacheln eine Fläche auf.",
        },
        also: [{ en: "Row tile", de: "Zeilenkachel", abbr: "ZK", code: ".glim-sel-tile" }],
      },
      {
        id: "select",
        en: "Select",
        de: "Auswahlfeld",
        abbr: "DDL",
        code: ["Select", ".glim-select"],
        components: ["Select"],
        rules: [14, 18, 35],
        text: {
          en: "The one choice from a short list. Open, it is never the browser's own list, and the mouse wheel changes the value while it is closed.",
          de: "Die eine Auswahl aus einer kurzen Liste. Aufgeklappt ist es nie die Liste des Browsers, und das Mausrad wechselt den Wert auch geschlossen.",
        },
      },
      {
        id: "select-menu-rows",
        en: "Select with menu rows",
        de: "Auswahlfeld mit Menüzeilen",
        abbr: "DDL",
        code: ['Select rows="menu"'],
        components: [],
        text: {
          en: "Draws its open list with the rows of the context menu, so an app has one kind of menu row.",
          de: "Zeichnet die offene Liste mit den Zeilen des Rechtsklick-Menüs, damit eine App nur eine Sorte Menüzeile hat.",
        },
      },
      {
        id: "combobox",
        en: "Combobox",
        de: "Suchauswahl",
        proposal: true,
        code: ["Combobox", ".glim-combobox"],
        components: ["Combobox"],
        text: {
          en: "For a list longer than a screen. Typing filters it, and the button shows all of it.",
          de: "Für eine Liste, die länger als ein Bildschirm ist. Tippen filtert, der Knopf zeigt alles.",
        },
      },
      {
        id: "slider",
        en: "Slider",
        de: "Schieberegler",
        proposal: true,
        code: ["Slider", ".glim-slider"],
        components: ["Slider"],
        text: {
          en: "A value from a range, by pointer and arrow keys, with the value in words beside it.",
          de: "Ein Wert aus einem Bereich, mit Zeiger und Pfeiltasten, der Wert steht in Worten daneben.",
        },
      },
      {
        id: "color-picker",
        en: "Colour picker",
        de: "Farbwähler",
        code: ["ColorPicker", ".glim-picker"],
        components: ["ColorPicker"],
        rules: [45],
        text: {
          en: "The inline picker for a colour of one's own: area, hue, hex and a suggested name. With anchor it floats beside its trigger.",
          de: "Der eingebettete Wähler für eine eigene Farbe: Fläche, Farbton, Hex und ein Name als Vorschlag. Mit anchor schwebt er neben seinem Auslöser.",
        },
      },
      {
        id: "listbox",
        en: "Listbox, retiring",
        de: "Listbox, veraltet",
        proposal: true,
        code: ["DropdownListbox", ".glim-listbox"],
        components: ["DropdownListbox"],
        rules: [18],
        text: {
          en: "The older list whose trigger the app builds itself. It stays until every app has moved to the select.",
          de: "Die alte Auswahlliste, deren Auslöser die App selbst baut. Sie bleibt, bis jede App auf das Auswahlfeld umgestellt ist.",
        },
      },
    ],
  },
  {
    id: "fields",
    en: "Fields and rows",
    de: "Felder und Zeilen",
    entries: [
      {
        id: "text-field",
        en: "Text field",
        de: "Textfeld",
        code: ["TextField", ".glim-input"],
        components: ["TextField"],
        rules: [14],
        text: {
          en: "Filled and borderless, and focus is a step in brightness rather than a ring. Widths short, medium, wide, grow and fill.",
          de: "Randlos gefüllt, der Fokus ist eine Helligkeitsstufe statt eines Rings. Breiten short, medium, wide, grow und fill.",
        },
      },
      {
        id: "text-area",
        en: "Text area",
        de: "Textbereich",
        proposal: true,
        code: ["TextArea", ".glim-input--area"],
        components: ["TextArea"],
        rules: [14],
        text: {
          en: "The text field over several lines, with the same widths.",
          de: "Das mehrzeilige Textfeld, mit denselben Breiten.",
        },
      },
      {
        id: "password-field",
        en: "Password field",
        de: "Passwortfeld",
        code: ["PasswordField", ".glim-secret"],
        components: ["PasswordField"],
        rules: [14],
        text: {
          en: "Carries the reveal eye inside the field at its far edge: a bare, neutral glyph that does not change the field's width.",
          de: "Trägt das Verräter-Auge im Feld an der hinteren Kante: ein blankes Symbol, neutral, das die Breite des Feldes nicht ändert.",
        },
        also: [{ en: "Reveal eye", de: "Verräter-Auge", code: ".glim-secret-eye" }],
      },
      {
        id: "number-field",
        en: "Number field",
        de: "Zahlenfeld",
        code: ["NumberField", ".glim-num-field"],
        components: ["NumberField"],
        rules: [14],
        text: {
          en: "The two arrows sit inside the field as filled triangles. The mouse wheel changes the value only while the field has focus.",
          de: "Die zwei Pfeile sitzen im Feld, als gefüllte Dreiecke. Das Mausrad verstellt den Wert nur, solange das Feld den Fokus hat.",
        },
      },
      {
        id: "copy-field",
        en: "Copy field",
        de: "Kopierfeld",
        proposal: true,
        code: ["CopyField", ".glim-copy"],
        components: ["CopyField"],
        rules: [13],
        text: {
          en: "A value to take along, with a button that says Copied for a moment.",
          de: "Ein Wert zum Mitnehmen, mit einem Knopf, der kurz Kopiert sagt.",
        },
      },
      {
        id: "path-field",
        en: "Path field",
        de: "Pfadfeld",
        proposal: true,
        code: ["PathField", ".glim-path"],
        components: ["PathField"],
        rules: [25],
        text: {
          en: "A path with a button that asks the app for a folder. The app usually answers with a window holding a tree.",
          de: "Ein Pfad mit einem Knopf, der die App nach einem Ordner fragt. Die App zeigt dafür meist ein Fenster mit einem Baum.",
        },
      },
      {
        id: "glyph-field",
        en: "Glyph field",
        de: "Glyphenfeld",
        proposal: true,
        code: ["GlyphField", ".glim-glyph-field"],
        components: ["GlyphField"],
        rules: [14],
        text: {
          en: "A field with a glyph in its box, for filters and search. Buttons such as Clear stand inside the box too.",
          de: "Ein Feld mit Glyphe im Kasten, für Filter und Suche. Knöpfe wie Leeren stehen mit im Kasten.",
        },
      },
      {
        id: "toggle",
        en: "Switch",
        de: "Schalter",
        code: ["Toggle", ".glim-toggle"],
        components: ["Toggle"],
        rules: [3, 39],
        text: {
          en: "Every on and off is this switch, never a native checkbox, and its label always stands beside it. A refused switch keeps its state and says why in its bubble.",
          de: "Jedes An und Aus ist dieser Schalter, nie eine native Checkbox. Die Beschriftung steht immer sichtbar daneben. Ein abgelehnter Schalter behält seinen Zustand und sagt in der Blase, warum.",
        },
      },
      {
        id: "checkbox",
        en: "Checkbox",
        de: "Checkbox",
        code: ["Checkbox", "Checkbox slim", ".glim-checkbox"],
        components: ["Checkbox"],
        rules: [39],
        text: {
          en: "Only in three places: under a notice that can be switched off, in a menu row, and among choices that take effect together. slim is the bare box for dense lists.",
          de: "Nur an drei Stellen: unter einer abschaltbaren Meldung, in einer Menüzeile und bei Auswahlen, die erst gemeinsam wirken. slim ist das bloße Kästchen für dichte Listen.",
        },
      },
      {
        id: "row-mark",
        en: "Row mark",
        de: "Auswahlmerker",
        code: ["RowMark", ".glim-rowmark"],
        components: ["RowMark"],
        rules: [39],
        text: {
          en: "The round mark on a row that is picked for an action on many.",
          de: "Die runde Marke auf einer Zeile, die für eine Aktion auf vielen gewählt ist.",
        },
      },
      {
        id: "field-row",
        en: "Field row",
        de: "Feldzeile",
        proposal: true,
        code: ["FieldRow", ".glim-field-row"],
        components: ["FieldRow"],
        rules: [35],
        text: {
          en: "The name with its (i) at the start, the control at the end. A click on the name focuses the field or flips the switch. A row with one value shows it as a value display.",
          de: "Name mit (i) am Anfang, Bedienelement am Ende. Ein Klick auf den Namen fokussiert das Feld oder legt den Schalter um. Eine Zeile mit nur einem Wert zeigt ihn als Wertanzeige.",
        },
      },
      {
        id: "field-row-group",
        en: "Field row group",
        de: "Feldzeilengruppe",
        proposal: true,
        code: ["FieldRowGroup", ".glim-field-row-group"],
        components: ["FieldRowGroup"],
        rules: [35],
        text: {
          en: "Gives its rows one name column, as wide as the longest name. Below 600px each row wraps on its own again.",
          de: "Gibt ihren Zeilen eine gemeinsame Namensspalte, so breit wie der längste Name. Unter 600 px bricht jede Zeile wieder für sich um.",
        },
      },
    ],
  },
  {
    id: "lists",
    en: "Lists and trees",
    de: "Listen und Bäume",
    entries: [
      {
        id: "list-row",
        en: "List row",
        de: "Listenzeile",
        proposal: true,
        code: ["ListRow", ".glim-list-row"],
        components: ["ListRow"],
        rules: [6, 16],
        text: {
          en: "Glyph tile, name, value display and state badge at the end, and buttons that come in on hover and focus. With a click the whole row opens.",
          de: "Glyphenkachel, Name, Wertanzeige und Plakette am Ende und Knöpfe, die erst bei Hover und Fokus kommen. Mit Klick öffnet die ganze Zeile.",
        },
      },
      {
        id: "glyph-tile",
        en: "Glyph tile",
        de: "Glyphenkachel",
        code: ["GlyphTile", ".glim-tile"],
        components: ["GlyphTile"],
        text: {
          en: "Holds the glyph at the start of a row and fills with the accent while the row is reached. Also quiet, ground and active. Not a row tile, a brand tile or the info tile.",
          de: "Hält die Glyphe am Anfang einer Zeile und füllt sich mit dem Akzent, solange die Zeile erreicht ist. Dazu quiet, ground und active. Weder Zeilenkachel noch Markenkachel noch Infokachel.",
        },
      },
      {
        id: "tree",
        en: "Tree",
        de: "Baum",
        code: ["Tree", ".glim-tree"],
        components: ["Tree"],
        text: {
          en: "Folders and levels with the keys of the WAI-ARIA tree. It loads children the first time a branch opens.",
          de: "Ordner und Ebenen mit den Tasten des WAI-ARIA-Baums. Kinder lädt er beim ersten Öffnen.",
        },
      },
      {
        id: "table",
        en: "Table",
        de: "Tabelle",
        code: ["Table", ".glim-table"],
        components: ["Table"],
        rules: [7],
        text: {
          en: "A short list of facts in columns, with a quiet line for the rest.",
          de: "Eine kurze Liste von Fakten in Spalten, mit einer leisen Zeile für den Rest.",
        },
      },
      {
        id: "move-mode",
        en: "Move mode",
        de: "Verschiebemodus",
        code: [".glim-move-mode", ".glim-drag-armed", "useDragArmed"],
        components: [],
        text: {
          en: "While a list can be sorted, its rows wobble gently and out of step. The row under the pointer stands still.",
          de: "Solange eine Liste sortierbar ist, wackeln ihre Zeilen sanft und aus dem Takt. Die Zeile unter dem Zeiger steht still.",
        },
      },
    ],
  },
  {
    id: "windows",
    en: "Windows and menus",
    de: "Fenster und Menüs",
    entries: [
      {
        id: "window",
        en: "Window",
        de: "Fenster",
        code: ["Window", ".glim-window", ".glim-modal-card"],
        components: ["Window"],
        rules: [15],
        text: {
          en: "Same surface, same radius, the section badge in the notch and the buttons at the bottom, whoever draws it. Shown in place here with the component's classes, and the button opens the real one.",
          de: "Gleiche Fläche, gleicher Radius, AB in der Kerbe, Knopfzeile unten, egal wer es zeichnet. Hier steht es mit den Klassen des Bauteils an Ort und Stelle, der Knopf öffnet das echte.",
        },
      },
      {
        id: "window-foot",
        en: "Window foot",
        de: "Fenster-Fuß",
        code: ["Window actions", "Window start", ".glim-modal-foot"],
        components: [],
        rules: [15, 38],
        text: {
          en: "The row of buttons at the bottom. Cancel or Close joins by itself, and the forward action stands last, in the accent. The line at the start gives way first when room runs short.",
          de: "Die Knopfzeile unten. Abbrechen oder Schließen kommt von selbst dazu, die Aktion nach vorn steht zuletzt im Akzent. Der Starttext links gibt zuerst nach, wenn der Platz knapp wird.",
        },
      },
      {
        id: "confirm-dialog",
        en: "Confirm dialog",
        de: "Bestätigungsfenster",
        code: ["ConfirmDialog", "useConfirm"],
        components: ["ConfirmDialog"],
        rules: [15],
        text: {
          en: "Asks only before something that cannot be undone, and names what will be gone. A switch may stand under the question, as extra.",
          de: "Fragt nur vor etwas, das sich nicht rückgängig machen lässt, und nennt, was dann weg ist. Unter der Frage darf ein Schalter stehen, extra.",
        },
      },
      {
        id: "window-bar",
        en: "Window bar",
        de: "Fensterleiste",
        proposal: true,
        code: ["WindowBar", ".glim-window-bar"],
        components: ["WindowBar"],
        text: {
          en: "The title bar of a desktop app without a frame of its own: minimise, maximise, close. It shows no name.",
          de: "Die Titelleiste einer Desktop-App ohne eigenen Rahmen: Minimieren, Maximieren, Schließen. Sie zeigt keinen Namen.",
        },
      },
      {
        id: "context-menu",
        en: "Context menu",
        de: "Rechtsklick-Menü",
        code: ["ContextMenu", ".glim-menu"],
        components: ["ContextMenu"],
        rules: [42],
        text: {
          en: "A menu at a point. Opened with the pointer, it shows its focus only once a key is pressed. Drawn in place here, and the button opens the real one.",
          de: "Ein Menü an einem Punkt. Mit der Maus geöffnet zeigt es seinen Fokus erst, wenn eine Taste kommt. Hier an Ort und Stelle gezeichnet, der Knopf öffnet das echte.",
        },
        also: [{ en: "Menu row", de: "Menüzeile", code: ".glim-menu-item" }],
      },
      {
        id: "menu-bar",
        en: "Menu bar",
        de: "Menüleiste",
        proposal: true,
        code: ["MenuBar", ".glim-menubar"],
        components: ["MenuBar"],
        rules: [42],
        text: {
          en: "The bar with File, Edit and View. Each of its menus is a context menu at its entry.",
          de: "Die Leiste mit Datei, Bearbeiten und Ansicht. Jedes Menü daraus ist ein Rechtsklick-Menü an seinem Eintrag.",
        },
      },
      {
        id: "sidebar-row",
        en: "Sidebar row",
        de: "Schienenzeile",
        proposal: true,
        code: ["SidebarRow", ".glim-nav-row"],
        components: ["SidebarRow"],
        rules: [5],
        text: {
          en: "One destination in the rail, the navigation on the left. Active means filled, never a bar beside it. The rail itself is a card with a surface token of its own.",
          de: "Ein Ziel in der Schiene, der Navigation links. Aktiv heißt gefüllt, nie ein Balken daneben. Die Schiene selbst ist eine Karte mit eigenem Flächen-Token.",
        },
        also: [{ en: "Rail", de: "Schiene", code: "--carbon-sidebar" }],
      },
      {
        id: "sign-in-card",
        en: "Sign-in card",
        de: "Anmeldekarte",
        proposal: true,
        code: ["SignInCard", "SignInField", ".glim-signin-card"],
        components: ["SignInCard", "SignInField"],
        text: {
          en: "The first way in: logo, name, password, and on request a passkey and a reset by a code from the log.",
          de: "Der erste Weg hinein: Logo, Name, Passwort und auf Wunsch Passkey und Zurücksetzen über einen Code aus dem Log.",
        },
      },
    ],
  },
  {
    id: "feedback",
    en: "Feedback",
    de: "Rückmeldung",
    entries: [
      {
        id: "toast",
        en: "Toast",
        de: "Toast",
        code: ["ToastCard", "ToastViewport", ".glim-toast"],
        components: ["ToastCard", "ToastViewport"],
        text: {
          en: "The message in the corner: four seconds, stacked, each one dismissable. Every error arrives as a toast, and what caused it shakes.",
          de: "Die Meldung in der Ecke: vier Sekunden, gestapelt, einzeln wegklickbar. Jeder Fehler kommt als Toast, und was ihn ausgelöst hat, zittert.",
        },
      },
      {
        id: "shake",
        en: "Shake",
        de: "Zittern",
        code: [".glim-shake"],
        components: [],
        text: {
          en: "The control that refuses an action shakes once. Together with the toast that is the whole error message.",
          de: "Das Bedienelement, das eine Aktion verweigert, zittert einmal. Zusammen mit dem Toast ist das die ganze Fehlermeldung.",
        },
      },
      {
        id: "progress-bar",
        en: "Progress bar",
        de: "Fortschrittsbalken",
        code: ["ProgressBar", ".glim-progress"],
        components: ["ProgressBar"],
        rules: [41],
        text: {
          en: "Shows work under way and carries a sheen only while it runs. Paused it takes the waiting colour, and red on an error.",
          de: "Zeigt laufende Arbeit und glänzt nur, solange sie läuft. Pausiert nimmt er die Wartefarbe, bei einem Fehler Rot.",
        },
      },
      {
        id: "meter",
        en: "Meter",
        de: "Meter",
        code: ["Meter", ".glim-meter"],
        components: ["Meter"],
        rules: [37, 41],
        text: {
          en: "Shows a standing level, such as how full a disk is, and never moves. Past its threshold it turns red, and quiet is the slim grey form for footers.",
          de: "Zeigt einen stehenden Stand, etwa den Füllstand einer Platte, und bewegt sich nie. Ab der Schwelle wird er rot, quiet ist die schmale graue Form für Fußzeilen.",
        },
      },
      {
        id: "info-bubble",
        en: "Info bubble",
        de: "Infoblase",
        code: ["InfoBubble", ".glim-info-icon"],
        components: ["InfoBubble"],
        rules: [8],
        text: {
          en: "The (i) with its explanation. Every explaining text hangs here, never as a grey sentence on the page.",
          de: "Das (i) mit seiner Erklärung. Jeder erklärende Text hängt hier, nie als grauer Satz auf der Seite.",
        },
      },
      {
        id: "bubble",
        en: "Bubble",
        de: "Blase",
        code: [".glim-bubble", "useTipBubble"],
        components: [],
        rules: [8],
        text: {
          en: "The one bubble for the info bubble and for hover names, drawn into the body and measured against its trigger. A control has one mechanism for it.",
          de: "Die eine Blase für Infoblase und Hinweise beim Überfahren, ins body gezeichnet und am Auslöser gemessen. Ein Bedienelement hat nur einen Mechanismus dafür.",
        },
      },
      {
        id: "notice",
        en: "Unavailable notice",
        de: "Sperrhinweis",
        proposal: true,
        code: ["UnavailableNotice", ".glim-notice"],
        components: ["UnavailableNotice"],
        text: {
          en: "Says what cannot be done right now, why, and what one can do about it from here. Never with the button that has just refused.",
          de: "Sagt, was gerade nicht geht, warum, und was man von hier aus tun kann. Nie mit dem Knopf, der gerade abgelehnt hat.",
        },
      },
      {
        id: "live-dot",
        en: "Live dot",
        de: "Live-Punkt",
        code: [".glim-live"],
        components: [],
        rules: [10],
        text: {
          en: "The pulsing dot for something that is running. Without motion it stands still at full strength.",
          de: "Der pulsende Punkt für etwas, das gerade läuft. Ohne Bewegung bleibt er stehen, voll deckend.",
        },
      },
      {
        id: "spinner",
        en: "Spinner",
        de: "Ladekreis",
        proposal: true,
        code: ["Button busy", ".glim-spinner"],
        components: [],
        text: {
          en: "Stands in the button where its glyph was while the answer is pending, and tells the screen reader too.",
          de: "Steht im Knopf an der Stelle der Glyphe, solange die Antwort aussteht, und sagt es auch dem Screenreader.",
        },
      },
    ],
  },
  {
    id: "more",
    en: "Everything else",
    de: "Sonstiges",
    entries: [
      {
        id: "glyph",
        en: "Glyph",
        de: "Glyphe",
        code: ["glyphs.json", "setGlyphResolver"],
        components: [],
        text: {
          en: "Every icon is a filled shape, never an outline, and one verb wears one shape everywhere. The single exception is the (i) of the info bubble.",
          de: "Jedes Symbol ist eine gefüllte Form, nie ein Umriss, und dasselbe Verb trägt überall dieselbe Form. Die eine Ausnahme ist das (i) der Infoblase.",
        },
      },
      {
        id: "tabular-figures",
        en: "Tabular figures",
        de: "Tabellenziffern",
        code: [".glim-num"],
        components: [],
        rules: [7],
        text: {
          en: "Digits of equal width, so nothing jitters while counting and columns stay in line.",
          de: "Ziffern gleicher Breite, damit beim Zählen nichts zappelt und Spalten stehen.",
        },
      },
      {
        id: "kbd",
        en: "Key cap",
        de: "Tastenkappe",
        proposal: true,
        code: ["Kbd", ".glim-kbd"],
        components: ["Kbd"],
        text: {
          en: "A key or a shortcut in running text and at the end of a menu row.",
          de: "Eine Taste oder ein Kürzel im Text und am Ende einer Menüzeile.",
        },
      },
      {
        id: "info-tile",
        en: "Info tile",
        de: "Infokachel",
        code: ["InfoTile", "AboutCard"],
        components: ["InfoTile", "AboutCard", "InfoVersionCard", "InfoHelpCard", "InfoAboutCard"],
        text: {
          en: "The three cards of the Info tab in this order: the version card with each version as a row, the help card with GitHub, mail and manual, and the about card with its sentence on money and the donation buttons under it.",
          de: "Die drei Karten des Info-Reiters in dieser Reihenfolge: die Versionskarte mit jeder Version als Zeile, die Hilfe-Karte mit GitHub, E-Mail und Handbuch, und die Über-Karte mit dem Satz zum Geld und den Spendenknöpfen darunter.",
        },
        also: [
          { en: "Version card", de: "Versionskarte", code: "InfoVersionCard" },
          { en: "Help card", de: "Hilfe-Karte", code: "InfoHelpCard" },
          { en: "About card", de: "Über-Karte", code: "InfoAboutCard" },
        ],
      },
      {
        id: "donation-windows",
        en: "Donation windows",
        de: "Spendenfenster",
        proposal: true,
        code: ["CoffeeDialog", "PaypalDialog", "CryptoDonateDialog"],
        components: ["CoffeeDialog", "PaypalDialog", "CryptoDonateDialog"],
        text: {
          en: "The three windows behind the donation buttons: the coffee window with the Buy Me a Coffee widget, the PayPal window with selectors for how often and how much, and the crypto window with an address for each network. Listed only, since they load payment pages from outside.",
          de: "Die drei Fenster hinter den Spendenknöpfen: das Kaffee-Fenster mit dem Widget von Buy Me a Coffee, das PayPal-Fenster mit Selektoren für wie oft und wie viel, und das Krypto-Fenster mit einer eigenen Adresse je Netzwerk. Nur aufgeführt, weil sie Zahlseiten von außen laden.",
        },
        also: [
          { en: "Coffee window", de: "Kaffee-Fenster", code: "CoffeeDialog", proposal: true },
          { en: "PayPal window", de: "PayPal-Fenster", code: "PaypalDialog", proposal: true },
          { en: "Crypto window", de: "Krypto-Fenster", code: "CryptoDonateDialog", proposal: true },
        ],
      },
    ],
  },
];
