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
