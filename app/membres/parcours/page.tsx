import { createClient } from "@/lib/supabase/server";
import { QuestionnaireParcours } from "@/components/parcours/QuestionnaireParcours";

export default async function ParcoursMembrePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase.from("profiles").select("full_name, email").eq("id", user!.id).single();
  const { data: fiche } = await supabase
    .from("athlete_details")
    .select("birth_date, position, guardian_name, guardian_phone, guardian_email")
    .eq("profile_id", user!.id)
    .maybeSingle();
  const { data: equipes } = await supabase
    .from("team_members")
    .select("teams!inner (name)")
    .eq("profile_id", user!.id)
    .eq("role_in_team", "athlete")
    .eq("teams.archived", false);

  const nomComplet = (profile?.full_name ?? "").trim();
  const [prenom = "", ...reste] = nomComplet.split(/\s+/);
  const emailReel = (e?: string | null) => (e && !e.endsWith(".rofconnect.test") ? e : "");
  const POSITIONS = ["Lanceuse", "Receveuse", "Avant-champ", "Voltigeuse", "Polyvalente"];

  const { data: precedentes } = await supabase
    .from("parcours_demandes")
    .select("id, created_at, courriel_envoye_le")
    .eq("profile_id", user!.id)
    .order("created_at", { ascending: false });

  return (
    <div className="flex-1">
      {(precedentes ?? []).length > 0 && (
        <p className="mx-auto max-w-3xl px-4 pt-4 text-sm text-rof-gris">
          Déjà envoyé le {new Date(precedentes![0].created_at).toLocaleDateString("fr-CA")}
          {precedentes![0].courriel_envoye_le ? " (bilan reçu par courriel)" : ""}. Tu peux le refaire si la situation a changé.
        </p>
      )}
      <QuestionnaireParcours
        membre
        initial={{
          prenom,
          nom: reste.join(" "),
          dob: fiche?.birth_date ?? "",
          position: POSITIONS.includes(fiche?.position ?? "") ? fiche!.position! : "",
          equipe: (equipes ?? [])
            .map((e) => (Array.isArray(e.teams) ? e.teams[0]?.name : (e.teams as { name: string } | null)?.name))
            .filter(Boolean)
            .join(", "),
          parent: fiche?.guardian_name ?? "",
          courrielParent: emailReel(fiche?.guardian_email) || emailReel(profile?.email),
          telephone: fiche?.guardian_phone ?? "",
        }}
      />
    </div>
  );
}
