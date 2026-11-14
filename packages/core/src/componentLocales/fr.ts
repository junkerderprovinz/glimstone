import type { ComponentWords } from "../componentWords.ts";

export const fr: ComponentWords = {
  pagination: { label: "Pages", previous: "Page précédente", next: "Page suivante", page: "Page {page} sur {pages}" },
  pinInput: { cell: "Caractère {index} sur {length}" },
  tagsInput: {
    remove: "Retirer {tag}",
    added: "{tag} ajouté",
    selected: "{tag} choisi. Retour arrière ou Suppr le retire",
    removed: "{tag} retiré",
  },
  steps: { back: "Retour", next: "Suivant", finish: "Terminer" },
  splitter: { resize: "Redimensionner" },
  fileUpload: {
    drop: "Déposez les fichiers ici ou choisissez-les",
    remove: "Retirer {name}",
    refused: {
      TOO_MANY_FILES: "{name} est un fichier de trop",
      FILE_INVALID_TYPE: "{name} n'est pas un type de fichier accepté ici",
      FILE_TOO_LARGE: "{name} est trop volumineux",
      FILE_TOO_SMALL: "{name} est trop petit",
      FILE_INVALID: "{name} ne peut pas être lu",
      FILE_EXISTS: "{name} est déjà dans la liste",
    },
  },
  datePicker: {
    placeholder: "Aucune date",
    calendar: "Calendrier",
    previous: { day: "Mois précédent", month: "Année précédente", year: "Années précédentes" },
    next: { day: "Mois suivant", month: "Année suivante", year: "Années suivantes" },
    zoomOut: "Choisir un mois ou une année",
  },
  rating: {
    star: {
      one: "{value} sur {count} étoile",
      many: "{value} sur {count} d'étoiles",
      other: "{value} sur {count} étoiles",
    },
  },
  timer: {
    start: "Démarrer",
    pause: "Pause",
    resume: "Reprendre",
    reset: "Réinitialiser",
    hours: { one: "{count} heure", many: "{count} d'heures", other: "{count} heures" },
    minutes: { one: "{count} minute", many: "{count} de minutes", other: "{count} minutes" },
    seconds: { one: "{count} seconde", many: "{count} de secondes", other: "{count} secondes" },
  },
  carousel: {
    previous: "Diapositive précédente",
    next: "Diapositive suivante",
    slide: "{index} sur {count}",
    goTo: "Diapositive {index}",
  },
  marquee: { pause: "Pause", resume: "Reprendre" },
  tour: { back: "Retour", next: "Suivant", close: "Fermer", progress: "{step} sur {steps}" },
  floatingPanel: { minimize: "Réduire", maximize: "Agrandir", restore: "Restaurer", close: "Fermer" },
  signaturePad: { area: "Signature", clear: "Effacer" },
};
