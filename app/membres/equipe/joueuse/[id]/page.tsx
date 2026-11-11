import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getDictionnaire } from "@/lib/i18n/server";
import { FicheAthlete } from "@/components/membres/FicheAthlete";
import { bouton } from "@/components/ui/boutons";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function FicheJoueusePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!UUID.test(id)) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) notFound();

  const admin = createAdminClient();

  // Autorisation : direction, ou coach d'une équipe active où cette personne est athlète.
  const { data: moi } = await admin.from("profiles").select("role").eq("id", user.id).single();
  let autorise = moi?.role === "admin";
  if (!autorise) {
    const [{ data: mesEquipesCoach }, { data: sesEquipes }] = await Promise.all([
      admin.from("team_members").select("team_id").eq("profile_id", user.id).eq("role_in_team", "coach"),
      admin
        .from("team_members")
        .select("team_id, teams!inner (archived)")
        .eq("profile_id", id)
        .eq("role_in_team", "athlete")
        .eq("teams.archived", false),
    ]);
    const coachDe = new Set((mesEquipesCoach ?? []).map((e) => e.team_id));
    autorise = (sesEquipes ?? []).some((e) => coachDe.has(e.team_id));
  }
  if (!autorise) notFound();

  const { t, locale } = await getDictionnaire();

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-5 py-8">
      <Link href="/membres/equipe" className={bouton("secondaire")}>
        ‹ {t.fiche.retour}
      </Link>
      <FicheAthlete client={admin} profileId={id} t={t} locale={locale} mode="staff" />
    </main>
  );
}
