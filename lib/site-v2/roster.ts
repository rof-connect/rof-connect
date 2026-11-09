import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { chargerArchivees } from "@/lib/joueuses-archivees";
import { presentationsActives } from "@/lib/presentation";
import { urlPhotoProfil } from "@/lib/photo-profil";
import { chargerNumeros } from "@/lib/numeros-chandail";
import { chargerStatutsJoueuses, statutEffectif } from "@/lib/statuts";
import { nomAffiche, nomPublicParDefaut } from "./equipes";
import { GAMECHANGER_LIEN_PROVISOIRE, GAMECHANGER_PROVISOIRE, ROSTER_PROVISOIRE, idGameChanger, lienGameChanger, type Sport } from "./donnees";

export type JoueuseRoster = {
  id: string;
  nom: string;
  numero: string; // numéro de chandail (vide si non saisi)
  positions: string[];
  lance: string;
  frappe: string;
  taille: string;
  ecole: string;
  ville: string;
  photo: string | null;
  lien: string; // sa fiche de recrutement si elle a activé sa page publique, sinon sa page de profil du site
};

export type RosterEquipe = {
  id: string;
  nom: string;
  sport: Sport;
  saison: number;
  description: string;
  total: number;
  joueuses: JoueuseRoster[];
  gamechangerLien: string; // page de l'équipe sur GameChanger (bouton)
  gamechanger: string; // identifiant du widget calendrier GameChanger (vide = aucun)
  afficher: boolean; // la Direction autorise l'affichage du roster (par défaut : oui)
  provisoire: boolean;
};

/**
 * Roster public d'une équipe. C'est l'organisation (la Direction) qui décide de l'afficher, équipe par équipe ; par défaut il l'est.
 * Sont listées les joueuses de l'équipe dont le statut n'est plus Prospect, sans les archivées.
 * Données publiées : nom, positions, lance/frappe. Taille, école et ville seulement si la joueuse les a saisies dans sa page
 * de présentation activée. La photo seulement avec l'autorisation de photo de l'inscription. Jamais : date de naissance,
 * coordonnées, courriel, notes médicales.
 */
export async function chargerRoster(teamId: string, apercu = false): Promise<RosterEquipe | null> {
  if (!/^[0-9a-f-]{36}$/i.test(teamId)) return null;
  const admin = createAdminClient();

  type Ligne = {
    id: string;
    name: string;
    sport: Sport;
    season_year: number;
    nom_public?: string | null;
    description_publique?: string | null;
    roster_public?: boolean | null;
    gamechanger_widget_id?: string | null;
    gamechanger_url?: string | null;
  };
  let provisoire = false;
  let equipe: Ligne | null = null;

  const complet = await admin
    .from("teams")
    .select("id, name, sport, season_year, nom_public, description_publique, roster_public, gamechanger_widget_id, gamechanger_url")
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

  const afficher = provisoire ? ROSTER_PROVISOIRE.includes(nomPublicParDefaut(equipe.name)) : equipe.roster_public !== false; // par défaut : affiché

  const base = {
    id: equipe.id,
    nom: nomAffiche(equipe),
    sport: equipe.sport,
    saison: equipe.season_year,
    description: (equipe.description_publique ?? "").trim(),
    gamechangerLien: lienGameChanger(equipe.gamechanger_url) || lienGameChanger(GAMECHANGER_LIEN_PROVISOIRE[nomPublicParDefaut(equipe.name)]),
    gamechanger: idGameChanger(equipe.gamechanger_widget_id) || idGameChanger(GAMECHANGER_PROVISOIRE[nomPublicParDefaut(equipe.name)]),
    afficher,
    provisoire,
  };
  if (!afficher) return { ...base, total: 0, joueuses: [] };

  const [{ data: membres }, archivees, statuts, actives, numeros] = await Promise.all([
    admin.from("team_members").select("profile_id, status_id").eq("team_id", teamId).eq("role_in_team", "athlete"),
    chargerArchivees(),
    chargerStatutsJoueuses(),
    presentationsActives(),
    chargerNumeros(),
  ]);
  const ids = [
    ...new Set(
      (membres ?? [])
        .filter((m) => !archivees.has(m.profile_id) && statutEffectif(m.profile_id, statuts, [m.status_id]) > 1)
        .map((m) => m.profile_id),
    ),
  ];

  let joueuses: JoueuseRoster[] = [];
  if (ids.length) {
    const [{ data: profils }, { data: fiches }] = await Promise.all([
      admin.from("profiles").select("id, full_name").in("id", ids),
      admin.from("athlete_details").select("profile_id, position, throws, bats").in("profile_id", ids),
    ]);
    const nomDe = new Map((profils ?? []).map((p) => [p.id, (p.full_name ?? "").trim()]));
    const ficheDe = new Map((fiches ?? []).map((f) => [f.profile_id, f]));
    joueuses = await Promise.all(
      ids.map(async (id) => {
        const reglages = actives[id]; // présent seulement si la joueuse a activé sa page publique
        const fiche = ficheDe.get(id);
        const profil = reglages?.profil ?? {};
        return {
          id,
          nom: nomDe.get(id) || "Joueuse",
          numero: numeros[id] ?? "",
          positions: (fiche?.position ?? "").split(",").map((x: string) => x.trim()).filter(Boolean),
          lance: fiche?.throws ?? "",
          frappe: fiche?.bats ?? "",
          taille: profil.taille ?? "",
          ecole: profil.ecole ?? "",
          ville: profil.ville ?? "",
          photo: await urlPhotoProfil(id), // l'organisation décide d'afficher les photos : pas d'autorisation individuelle requise
          lien: reglages ? `/joueuse/${reglages.token}` : `/site-v2/joueuses/${id}`,
        };
      }),
    );
    const cle = (n: string) => n.split(/\s+/).slice(-1)[0] + " " + n;
    // Comme un alignement : numéros croissants, puis celles sans numéro par nom.
    joueuses.sort((a, b) => {
      const na = a.numero === "" ? 1000 : Number(a.numero);
      const nb = b.numero === "" ? 1000 : Number(b.numero);
      return na !== nb ? na - nb : cle(a.nom).localeCompare(cle(b.nom), "fr");
    });
  }

  // Aperçu du design (développement seulement, jamais en production) : joueuses fictives, aucune donnée réelle.
  if (apercu && process.env.NODE_ENV !== "production") {
    const noms = ["Alexia Tremblay", "Camille Roy", "Emma Gagnon", "Léa Bouchard", "Maya Lavoie", "Zoé Pelletier"];
    const pos = ["Lanceuse", "Receveuse", "Arrêt-court", "1re base", "Champ extérieur", "2e base"];
    joueuses = noms.map((nom, i) => ({
      id: `exemple-${i}`,
      nom,
      numero: String([7, 12, 18, 24, 27, 67][i]),
      positions: [pos[i], ...(i % 2 ? ["Champ extérieur"] : [])],
      lance: i % 4 === 0 ? "Gauche" : "Droite",
      frappe: i % 3 === 0 ? "Gauche" : "Droite",
      taille: `5'${4 + (i % 5)}"`,
      ecole: ["Collège L'Assomption", "École Le Prélude", "Collège L'Assomption", "Polyvalente Lionel-Groulx", "Collège L'Assomption", "École Le Prélude"][i],
      ville: ["Repentigny", "L'Assomption", "Repentigny", "Terrebonne", "Charlemagne", "Repentigny"][i],
      photo: null,
      lien: "#",
    }));
  }

  return { ...base, total: joueuses.length, joueuses };
}

/**
 * Profil public d'une joueuse : seulement si elle figure dans le roster affiché d'une équipe visible (mêmes règles que le roster).
 */
export async function chargerJoueusePublique(profileId: string): Promise<{ joueuse: JoueuseRoster; equipe: RosterEquipe; fiche: boolean } | null> {
  if (!/^[0-9a-f-]{36}$/i.test(profileId)) return null;
  const { data } = await createAdminClient().from("team_members").select("team_id").eq("profile_id", profileId).eq("role_in_team", "athlete");
  for (const m of data ?? []) {
    const equipe = await chargerRoster(m.team_id);
    const joueuse = equipe?.joueuses.find((j) => j.id === profileId);
    if (equipe && joueuse) return { joueuse, equipe, fiche: joueuse.lien.startsWith("/joueuse/") };
  }
  return null;
}
