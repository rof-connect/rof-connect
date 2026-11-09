import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { chargerArchivees } from "@/lib/joueuses-archivees";
import { presentationsActives } from "@/lib/presentation";
import { urlPhotoProfil } from "@/lib/photo-profil";
import { nomAffiche } from "./equipes";
import type { Sport } from "./donnees";

export type JoueuseRoster = {
  id: string;
  nom: string;
  positions: string[];
  lance: string;
  frappe: string;
  taille: string;
  ecole: string;
  ville: string;
  photo: string | null;
  lien: string; // page de présentation personnelle (déjà approuvée par la joueuse)
};

export type RosterEquipe = {
  id: string;
  nom: string;
  sport: Sport;
  saison: number;
  description: string;
  total: number; // joueuses actives dans l'équipe (dans ROF Connect)
  joueuses: JoueuseRoster[]; // seulement celles qui ont autorisé leur page publique
  provisoire: boolean;
};

/**
 * Roster public d'une équipe. Règles de confidentialité :
 *  - l'équipe doit être visible sur le site (ou, en mode provisoire avant la migration 0009, active) ;
 *  - une joueuse n'apparaît que si elle (ou son parent) a activé sa page de présentation, donc donné son consentement ;
 *  - jamais de date de naissance, de coordonnées, de notes médicales ni de courriel.
 */
export async function chargerRoster(teamId: string, apercu = false): Promise<RosterEquipe | null> {
  if (!/^[0-9a-f-]{36}$/i.test(teamId)) return null;
  const admin = createAdminClient();

  type Ligne = { id: string; name: string; sport: Sport; season_year: number; nom_public?: string | null; description_publique?: string | null };
  let provisoire = false;
  let equipe: Ligne | null = null;

  const complet = await admin
    .from("teams")
    .select("id, name, sport, season_year, nom_public, description_publique")
    .eq("id", teamId)
    .eq("archived", false)
    .eq("visible_public", true)
    .maybeSingle();
  if (complet.error) {
    provisoire = true; // colonnes absentes : migration 0009 pas encore appliquée
    const simple = await admin.from("teams").select("id, name, sport, season_year").eq("id", teamId).eq("archived", false).maybeSingle();
    equipe = simple.data as Ligne | null;
  } else {
    equipe = complet.data as Ligne | null;
  }
  if (!equipe) return null;

  const { data: memeSport } = await admin.from("teams").select("name").eq("sport", equipe.sport).eq("archived", false);

  const [{ data: membres }, archivees, actives] = await Promise.all([
    admin.from("team_members").select("profile_id").eq("team_id", teamId).eq("role_in_team", "athlete"),
    chargerArchivees(),
    presentationsActives(),
  ]);
  const ids = [...new Set((membres ?? []).map((m) => m.profile_id).filter((id) => !archivees.has(id)))];
  const consentantes = ids.filter((id) => actives[id]);

  let joueuses: JoueuseRoster[] = [];
  if (consentantes.length) {
    const [{ data: profils }, { data: fiches }] = await Promise.all([
      admin.from("profiles").select("id, full_name").in("id", consentantes),
      admin.from("athlete_details").select("profile_id, position, throws, bats").in("profile_id", consentantes),
    ]);
    const nomDe = new Map((profils ?? []).map((p) => [p.id, (p.full_name ?? "").trim()]));
    const ficheDe = new Map((fiches ?? []).map((f) => [f.profile_id, f]));
    joueuses = await Promise.all(
      consentantes.map(async (id) => {
        const reglages = actives[id];
        const fiche = ficheDe.get(id);
        const profil = reglages.profil ?? {};
        return {
          id,
          nom: nomDe.get(id) || "Joueuse",
          positions: (fiche?.position ?? "").split(",").map((x: string) => x.trim()).filter(Boolean),
          lance: fiche?.throws ?? "",
          frappe: fiche?.bats ?? "",
          taille: profil.taille ?? "",
          ecole: profil.ecole ?? "",
          ville: profil.ville ?? "",
          photo: reglages.photo ? await urlPhotoProfil(id) : null,
          lien: `/joueuse/${reglages.token}`,
        };
      }),
    );
    const cle = (n: string) => n.split(/\s+/).slice(-1)[0] + " " + n;
    joueuses.sort((a, b) => cle(a.nom).localeCompare(cle(b.nom), "fr"));
  }

  // Aperçu du design (développement seulement, jamais en production) : joueuses fictives, aucune donnée réelle.
  if (apercu && process.env.NODE_ENV !== "production") {
    const noms = ["Alexia Tremblay", "Camille Roy", "Emma Gagnon", "Léa Bouchard", "Maya Lavoie", "Zoé Pelletier"];
    const pos = ["Lanceuse", "Receveuse", "Arrêt-court", "1re base", "Champ extérieur", "2e base"];
    joueuses = noms.map((nom, i) => ({
      id: `exemple-${i}`,
      nom,
      positions: [pos[i], ...(i % 2 ? ["Champ extérieur"] : [])],
      lance: i % 4 === 0 ? "Gauche" : "Droite",
      frappe: i % 3 === 0 ? "Gauche" : "Droite",
      taille: `5'${4 + (i % 5)}"`,
      ecole: ["Collège L'Assomption", "École Le Prélude", "Collège L'Assomption", "Polyvalente Lionel-Groulx", "Collège L'Assomption", "École Le Prélude"][i],
      ville: ["Repentigny", "L'Assomption", "Repentigny", "Terrebonne", "Charlemagne", "Repentigny"][i],
      photo: null,
      lien: "/site-v2",
    }));
  }

  return {
    id: equipe.id,
    nom: nomAffiche(equipe, memeSport ?? []),
    sport: equipe.sport,
    saison: equipe.season_year,
    description: (equipe.description_publique ?? "").trim(),
    total: apercu && joueuses.length && process.env.NODE_ENV !== "production" ? Math.max(ids.length, joueuses.length) : ids.length,
    joueuses,
    provisoire,
  };
}
