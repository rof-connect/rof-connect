import { normaliserTaille } from "@/lib/taille";
import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { liensDe } from "@/lib/liens-sociaux";
import { presentationDe } from "@/lib/presentation";

export type FicheRecrutement = {
  apropos: string;
  faits: [string, string][]; // taille, poids, moyenne
  video: string; // identifiant YouTube
  mesures: { label: string; valeur: string }[];
  realisations: string[];
  etudes: [string, string][];
  evenements: { date: string; nom: string; lieu: string; passe: boolean }[];
  liens: [string, string][]; // FieldLevel, Instagram, YouTube, X
  reference?: { nom: string; role: string; contact: string };
};

/**
 * Fiche de recrutement détaillée d'une joueuse, intégrée à sa page du site.
 * Elle n'existe que si la joueuse (ou son parent) a activé sa page de présentation dans ROF Connect : c'est son consentement.
 * Jamais publiés ici : coordonnées du parent / tuteur, courriel, téléphone, date de naissance.
 */
export async function chargerFiche(profileId: string): Promise<FicheRecrutement | null> {
  const reglages = await presentationDe(profileId);
  if (!reglages?.actif) return null;
  const profil = reglages.profil ?? {};
  const admin = createAdminClient();

  const [{ data: details }, { data: bilan }, liens] = await Promise.all([
    admin.from("athlete_details").select("fieldlevel_url").eq("profile_id", profileId).maybeSingle(),
    admin.from("parcours_demandes").select("reponses").eq("profile_id", profileId).order("created_at", { ascending: false }).limit(1).maybeSingle(),
    liensDe(profileId),
  ]);
  const reponses = (bilan?.reponses ?? {}) as { domaine?: string; anglais?: string; divisions?: string[] };

  const aujourdhui = new Date().toISOString().slice(0, 10);
  const evenements = [...(profil.evenements ?? [])]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((e) => ({ date: e.date, nom: e.nom, lieu: e.lieu, passe: e.date < aujourdhui }));
  const aVenir = evenements.filter((e) => !e.passe);
  const passes = evenements.filter((e) => e.passe).reverse().slice(0, 4);

  const lienExterne = (u: string | null | undefined) => (u && /^https:\/\//i.test(u) ? u : "");
  const boutons: [string, string][] = [
    ["FieldLevel", lienExterne(details?.fieldlevel_url)],
    ["Instagram", lienExterne(liens.instagram)],
    ["YouTube", lienExterne(liens.youtube)],
    ["X", lienExterne(liens.x)],
  ].filter(([, u]) => u) as [string, string][];

  return {
    apropos: (reglages.apropos ?? "").trim(),
    faits: ([
      ["Taille", normaliserTaille(profil.taille)],
      ["Poids", profil.poids],
      ["Moyenne", profil.moyenne],
    ] as [string, string | undefined][]).filter(([, v]) => v) as [string, string][],
    video: profil.video ?? "",
    mesures: [
      { label: "Exit Velo", valeur: profil.exitVelo ?? "" },
      { label: "Pitching Velo", valeur: profil.pitchingVelo ?? "" },
      { label: "Course 60'", valeur: profil.course60 ?? "" },
      { label: "Pop Time", valeur: profil.popTime ?? "" },
      ...(profil.mesures ?? []),
    ].filter((m) => m.valeur),
    realisations: profil.realisations ?? [],
    etudes: ([
      ["Domaine d'études visé", profil.domaine || reponses.domaine],
      ["Langue", profil.anglais || reponses.anglais],
      ["Divisions visées", (reponses.divisions ?? []).join(", ")],
    ] as [string, string | undefined][]).filter(([, v]) => v) as [string, string][],
    evenements: [...aVenir, ...passes],
    liens: boutons,
    reference: profil.reference?.nom ? profil.reference : undefined,
  };
}
