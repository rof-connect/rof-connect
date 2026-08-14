// Gabarits d'import Excel/CSV — repris du prototype (section 7.2d du cahier des charges).

export type ModeleImport = {
  colonnes: string[];
  gabarit: Record<string, string>[];
  mapper: (r: Record<string, unknown>) => Record<string, string>;
  valide: (o: Record<string, string>) => boolean;
  titreChamp: string;
};

function normDate(v: unknown): string {
  if (!v) return "";
  if (typeof v === "number") {
    const d = new Date(Math.round((v - 25569) * 86400 * 1000));
    return d.toISOString().slice(0, 10);
  }
  const s = String(v).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const m = s.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (m) return `${m[3]}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`;
  const d = new Date(s);
  return isNaN(d.getTime()) ? s : d.toISOString().slice(0, 10);
}

function champ(r: Record<string, unknown>, ...cles: string[]): string {
  for (const c of cles) {
    if (r[c] !== undefined && r[c] !== null && String(r[c]).trim()) return String(r[c]).trim();
  }
  return "";
}

export const MODELES_IMPORT: Record<string, ModeleImport> = {
  agenda: {
    colonnes: ["titre", "type", "date", "heure", "lieu", "note"],
    titreChamp: "titre",
    gabarit: [
      { titre: "Pratique frappe & lancer", type: "Pratique", date: "2026-09-15", heure: "18h30 - 20h00", lieu: "Terrain Lapointe, Repentigny", note: "Apporter casque et gants de frappe" },
      { titre: "Match vs Nord-Est 14U", type: "Match", date: "2026-09-19", heure: "19h00", lieu: "Parc Goyette, L'Épiphanie", note: "Arrivée 45 min avant" },
      { titre: "Tournoi FPN — fin de semaine", type: "Tournoi", date: "2026-09-26", heure: "Toute la journée", lieu: "Windsor, CT", note: "Départ vendredi 16h" },
    ],
    mapper: (r) => ({
      titre: champ(r, "titre", "Titre"),
      type: champ(r, "type", "Type") || "Pratique",
      date: normDate(r.date ?? r.Date),
      heure: champ(r, "heure", "Heure"),
      lieu: champ(r, "lieu", "Lieu"),
      note: champ(r, "note", "Note"),
    }),
    valide: (o) => !!(o.titre && o.date),
  },
  nouvelles: {
    colonnes: ["titre", "date", "texte", "photo", "video"],
    titreChamp: "titre",
    gabarit: [
      { titre: "Championnes du tournoi FPN ! 👑", date: "6 juillet 2026", texte: "Quelle fin de semaine ! Nos joueuses repartent avec la bague après 4 victoires consécutives.", photo: "", video: "" },
      { titre: "Match parfait de notre lanceuse", date: "31 mai 2026", texte: "6 manches, 0 coup sûr, 11 retraits au bâton.", photo: "", video: "https://youtube.com/watch?v=exemple" },
    ],
    mapper: (r) => ({
      titre: champ(r, "titre", "Titre"),
      date: champ(r, "date", "Date"),
      texte: champ(r, "texte", "Texte"),
      video_url: champ(r, "video", "Video", "vidéo", "Vidéo"),
    }),
    valide: (o) => !!(o.titre && (o.texte || o.video_url)),
  },
  relais: {
    colonnes: ["situation", "relayeur", "coupeur", "couvertures", "note"],
    titreChamp: "situation",
    gabarit: [
      { situation: "Simple au champ droit, coureur au 1er", relayeur: "Arrêt-court s'aligne CD → 3e but", coupeur: "1er but coupe vers le marbre", couvertures: "2e but couvre le 2e, lanceur derrière le 3e", note: "Écouter l'appel du receveur" },
      { situation: "Double au champ centre, coureur au 1er", relayeur: "2e but s'aligne CC → marbre", coupeur: "1er but en coupe au monticule", couvertures: "Arrêt-court couvre le 2e", note: "" },
    ],
    mapper: (r) => ({
      situation: champ(r, "situation", "Situation"),
      relayeur: champ(r, "relayeur", "Relayeur"),
      coupeur: champ(r, "coupeur", "Coupeur", "cut-off"),
      couvertures: champ(r, "couvertures", "Couvertures"),
      note: champ(r, "note", "Note"),
    }),
    valide: (o) => !!o.situation,
  },
};
