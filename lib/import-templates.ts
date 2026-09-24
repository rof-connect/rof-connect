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
};
