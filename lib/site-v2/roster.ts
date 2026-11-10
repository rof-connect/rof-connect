import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { chargerArchivees } from "@/lib/joueuses-archivees";
import { presentationsActives, toutesPresentations } from "@/lib/presentation";
import { urlPhotoProfil } from "@/lib/photo-profil";
import { chargerNumeros } from "@/lib/numeros-chandail";
import { chargerInfosRoster } from "@/lib/infos-roster";
import { STATUTS, chargerStatutsJoueuses, statutEffectif } from "@/lib/statuts";
import { nomAffiche, nomPublicParDefaut } from "./equipes";
import { NIVEAU_COMPETITION_PROVISOIRE, GAMECHANGER_LIEN_PROVISOIRE, GAMECHANGER_PROVISOIRE, ROSTER_PROVISOIRE, idGameChanger, lienGameChanger, profilFieldLevel, type Sport } from "./donnees";

/** Le site est en français : les positions saisies en anglais sont traduites à l'affichage (les données ne sont pas modifiées). */
const POSITIONS_FR: Record<string, string> = {
  outfield: "Champ extérieur",
  outfielder: "Champ extérieur",
  "1st base": "1er but",
  "first base": "1er but",
  "2nd base": "2e but",
  "second base": "2e but",
  "3rd base": "3e but",
  "third base": "3e but",
  "1b": "1er but",
  "2b": "2e but",
  "3b": "3e but",
  ss: "Arrêt-court",
  shortstop: "Arrêt-court",
  pitcher: "Lanceur·euse",
  catcher: "Receveur·euse",
};
const positionFr = (p: string) => POSITIONS_FR[p.toLowerCase()] ?? p;

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
  statut: string; // âge de la saison (statut), ex. « 15U »
  fieldlevel: string; // profil FieldLevel intégré à sa page (vide si aucun)
  grad: string; // année de graduation (« grad year »), vide si non saisie
  photo: string | null;
  lien: string; // sa page sur le site (fiche de recrutement incluse si elle l'a activée)
};

export type RosterEquipe = {
  id: string;
  nom: string;
  sport: Sport;
  saison: number;
  description: string;
  total: number;
  joueuses: JoueuseRoster[];
  categorie: string;
  gamechangerLien: string; // page de l'équipe sur GameChanger (bouton)
  gamechanger: string; // identifiant du widget calendrier GameChanger (vide = aucun)
  afficher: boolean; // la Direction autorise l'affichage du roster (par défaut : oui)
  provisoire: boolean;
};

/**
 * Roster public d'une équipe. La Direction décide de l'afficher, équipe par équipe ; par défaut il est masqué.
 * Sont listées les joueuses de l'équipe dont le statut n'est plus Prospect, sans les archivées.
 * Données publiées : nom, positions, lance/frappe. Taille et grad year si saisis. École et ville seulement si la famille a coché
 * « Afficher mon école et ma ville sur le site public ». La photo seulement avec l'autorisation de photo de l'inscription. Jamais : date de naissance,
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
    niveau_competition?: string | null;
  };
  let provisoire = false;
  let equipe: Ligne | null = null;

  const complet = await admin
    .from("teams")
    .select("id, name, sport, season_year, nom_public, description_publique, roster_public, gamechanger_widget_id, gamechanger_url, niveau_competition")
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

  const afficher = provisoire ? ROSTER_PROVISOIRE.includes(nomPublicParDefaut(equipe.name)) : equipe.roster_public === true; // par défaut : masqué (la Direction l'active équipe par équipe)

  const base = {
    id: equipe.id,
    nom: nomAffiche(equipe),
    sport: equipe.sport,
    saison: equipe.season_year,
    description: (equipe.description_publique ?? "").trim(),
    categorie: ((equipe.niveau_competition ?? "").trim() || NIVEAU_COMPETITION_PROVISOIRE[nomPublicParDefaut(equipe.name)] || "").slice(0, 30),
    gamechangerLien: lienGameChanger(equipe.gamechanger_url) || lienGameChanger(GAMECHANGER_LIEN_PROVISOIRE[nomPublicParDefaut(equipe.name)]),
    gamechanger: idGameChanger(equipe.gamechanger_widget_id) || idGameChanger(GAMECHANGER_PROVISOIRE[nomPublicParDefaut(equipe.name)]),
    afficher,
    provisoire,
  };
  if (!afficher) return { ...base, total: 0, joueuses: [] };

  const [{ data: membres }, archivees, statuts, actives, numeros, infos, fichesPres] = await Promise.all([
    admin.from("team_members").select("profile_id, status_id").eq("team_id", teamId).eq("role_in_team", "athlete"),
    chargerArchivees(),
    chargerStatutsJoueuses(),
    presentationsActives(),
    chargerNumeros(),
    chargerInfosRoster(),
    toutesPresentations(),
  ]);
  const statutsParJoueuse = new Map<string, number[]>();
  (membres ?? []).forEach((m) => statutsParJoueuse.set(m.profile_id, [...(statutsParJoueuse.get(m.profile_id) ?? []), m.status_id]));
  const nomStatut = (id: string) => STATUTS.find((x) => x.id === statutEffectif(id, statuts, statutsParJoueuse.get(id) ?? []))?.nom ?? "";
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
      admin.from("athlete_details").select("profile_id, position, throws, bats, fieldlevel_url").in("profile_id", ids),
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
          statut: nomStatut(id),
          positions: (fiche?.position ?? "").split(",").map((x: string) => positionFr(x.trim())).filter(Boolean),
          lance: fiche?.throws ?? "",
          frappe: fiche?.bats ?? "",
          taille: fichesPres[id]?.profil?.taille || infos[id]?.taille || "",
          // École et ville : seulement si la famille a coché « Afficher mon école et ma ville sur le site public ».
          ecole: fichesPres[id]?.profil?.ecoleVillePublic ? fichesPres[id]?.profil?.ecole || infos[id]?.ecole || "" : "",
          ville: fichesPres[id]?.profil?.ecoleVillePublic ? fichesPres[id]?.profil?.ville || infos[id]?.ville || "" : "",
          grad: fichesPres[id]?.profil?.grad || infos[id]?.grad || "",
          fieldlevel: profilFieldLevel(fiche?.fieldlevel_url),
          photo: await urlPhotoProfil(id), // l'organisation décide d'afficher les photos : pas d'autorisation individuelle requise
          lien: `/site-v2/joueuses/${id}`,
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
      statut: ["18U", "17U", "16U", "16U", "15U", "18U"][i],
      positions: [pos[i], ...(i % 2 ? ["Champ extérieur"] : [])],
      lance: i % 4 === 0 ? "Gauche" : "Droite",
      frappe: i % 3 === 0 ? "Gauche" : "Droite",
      taille: `5'${4 + (i % 5)}"`,
      ecole: ["Collège L'Assomption", "École Le Prélude", "Collège L'Assomption", "Polyvalente Lionel-Groulx", "Collège L'Assomption", "École Le Prélude"][i],
      ville: ["Repentigny", "L'Assomption", "Repentigny", "Terrebonne", "Charlemagne", "Repentigny"][i],
      grad: String(2026 + (i % 3)),
      fieldlevel: "",
      photo: null,
      lien: "#",
    }));
  }

  return { ...base, total: joueuses.length, joueuses };
}

/**
 * Profil public d'une joueuse : seulement si elle figure dans le roster affiché d'une équipe visible (mêmes règles que le roster).
 */
export async function chargerJoueusePublique(profileId: string): Promise<{ joueuse: JoueuseRoster; equipe: RosterEquipe } | null> {
  if (!/^[0-9a-f-]{36}$/i.test(profileId)) return null;
  const { data } = await createAdminClient().from("team_members").select("team_id").eq("profile_id", profileId).eq("role_in_team", "athlete");
  for (const m of data ?? []) {
    const equipe = await chargerRoster(m.team_id);
    const joueuse = equipe?.joueuses.find((j) => j.id === profileId);
    if (equipe && joueuse) return { joueuse, equipe };
  }
  return null;
}
