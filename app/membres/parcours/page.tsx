import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { QuestionnaireParcours } from "@/components/parcours/QuestionnaireParcours";
import { parcoursOuvert } from "@/lib/statuts";

export default async function ParcoursMembrePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase.from("profiles").select("full_name, email, role").eq("id", user!.id).single();

  // Réservé aux joueuses dont le statut n'est plus Prospect (la Direction et les entraîneurs y accèdent toujours).
  if (profile?.role === "member" && !(await parcoursOuvert(user!.id))) {
    return (
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-5 py-10">
        <h1 className="font-condensed text-3xl font-bold uppercase text-rof-texte">Parcours NCAA</h1>
        <div className="rounded-xl border border-rof-or bg-rof-blanc p-5">
          <p className="text-rof-texte">
            Le parcours NCAA sera disponible dès que la Direction aura accepté la joueuse et que son statut ne sera plus Prospect.
          </p>
          <p className="mt-2 text-sm text-rof-gris">
            The NCAA pathway becomes available once the staff accepts the player and her status is no longer Prospect.
          </p>
          <Link href="/membres/moi" className="mt-4 inline-block text-sm text-rof-poudre underline">
            ‹ Retour
          </Link>
        </div>
      </main>
    );
  }
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
          position: POSITIONS.includes((fiche?.position ?? "").split(",")[0].trim()) ? (fiche!.position as string).split(",")[0].trim() : "",
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
