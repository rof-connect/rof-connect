export type Champ = {
  name: string;
  label: string;
  type?: "text" | "date" | "textarea" | "url";
  placeholder?: string;
  required?: boolean;
};

export type SectionConfig = {
  slug: string;
  kind: "video" | "signal" | "gamechanger";
  titre: string;
  titreChamp: string; // quel champ du formulaire devient contents.title
  accesDefaut: number;
  champs: Champ[];
};

export const SECTIONS: Record<string, SectionConfig> = {
  videos: {
    slug: "videos",
    kind: "video",
    titre: "Vidéos à regarder",
    titreChamp: "titre",
    accesDefaut: 1,
    champs: [
      { name: "titre", label: "Titre", required: true, placeholder: "Ex. : Lecture de balle au champ extérieur" },
      { name: "url", label: "Lien (YouTube, Drive, HitTrax…)", type: "url", required: true, placeholder: "https://…" },
      { name: "categorie", label: "Catégorie", placeholder: "Ex. : Défensive / Frappe / Lancer" },
      { name: "note", label: "Note pour les joueurs", placeholder: "Quoi observer (optionnel)" },
    ],
  },
  signaux: {
    slug: "signaux",
    kind: "signal",
    titre: "Signaux de l'équipe",
    titreChamp: "nom",
    accesDefaut: 2,
    champs: [
      { name: "nom", label: "Nom du signal", required: true, placeholder: "Ex. : Vol de but" },
      { name: "sequence", label: "Séquence", type: "textarea", required: true, placeholder: "Ex. : Casquette → ceinture → oreille" },
      { name: "note", label: "Note", placeholder: "Optionnel" },
    ],
  },
  gc: {
    slug: "gc",
    kind: "gamechanger",
    titre: "GameChanger",
    titreChamp: "titre",
    accesDefaut: 1,
    champs: [
      { name: "titre", label: "Titre", required: true, placeholder: "Ex. : Royal 14U — saison 2026" },
      { name: "widgetId", label: "Code widget GameChanger", placeholder: "Optionnel" },
      { name: "url", label: "Lien d'équipe GameChanger", type: "url", placeholder: "https://web.gc.com/… (optionnel)" },
      { name: "note", label: "Note", placeholder: "Optionnel" },
    ],
  },
};
