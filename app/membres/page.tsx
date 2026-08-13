import { createClient } from "@/lib/supabase/server";
import { getDictionnaire } from "@/lib/i18n/server";

export default async function MembresPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase.from("profiles").select("full_name, role").eq("id", user!.id).single();
  const { t } = await getDictionnaire();
  const m2 = t.membres;

  const { data: memberships } = await supabase
    .from("team_members")
    .select("status_id, role_in_team, teams (id, name, sport)")
    .eq("profile_id", user!.id);

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-5 py-10">
      <p className="font-condensed text-sm uppercase tracking-[0.3em] text-rof-poudre">{t.nav.espaceMembres}</p>
      <h1 className="mt-1 font-condensed text-3xl font-bold uppercase text-rof-texte">
        {m2.bienvenue}, {profile?.full_name || user?.email}
      </h1>
      <p className="mt-2 text-sm text-rof-gris">
        {m2.role} : <span className="text-rof-texte">{profile?.role}</span>
      </p>

      <div className="mt-6 flex flex-col gap-3">
        {(memberships ?? []).map((m, i) => {
          const team = Array.isArray(m.teams) ? m.teams[0] : m.teams;
          return (
            <div key={i} className="rounded-xl border border-rof-ligne bg-rof-blanc p-4">
              <p className="font-condensed text-lg font-semibold uppercase text-rof-texte">{team?.name}</p>
              <p className="text-sm text-rof-gris">
                {team?.sport} · {m.role_in_team} · statut {m.status_id}
              </p>
            </div>
          );
        })}
        {(memberships ?? []).length === 0 && <p className="text-sm text-rof-gris">{m2.aucuneEquipe}</p>}
      </div>
    </main>
  );
}
