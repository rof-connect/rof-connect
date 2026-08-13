import { createClient } from "@/lib/supabase/server";
import { Messagerie } from "@/components/membres/Messagerie";

export default async function MessagesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase.from("profiles").select("role, full_name").eq("id", user!.id).single();
  const estAdmin = profile?.role === "admin";

  const { data: memberships } = await supabase
    .from("team_members")
    .select("team_id, role_in_team, teams (id, name)")
    .eq("profile_id", user!.id);

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-10 px-5 py-10">
      <div>
        <p className="font-condensed text-sm uppercase tracking-[0.3em] text-rof-poudre">Espace membres</p>
        <h1 className="mt-1 font-condensed text-3xl font-bold uppercase text-rof-texte">Messages</h1>
      </div>

      {(memberships ?? []).length === 0 && (
        <p className="text-sm text-rof-gris">Aucune équipe assignée pour le moment.</p>
      )}

      {(memberships ?? []).map((m) => {
        const team = Array.isArray(m.teams) ? m.teams[0] : m.teams;
        const estStaff = estAdmin || m.role_in_team === "coach";
        return (
          <EquipeMessages
            key={m.team_id}
            teamId={m.team_id}
            teamName={team?.name ?? ""}
            estStaff={estStaff}
            monId={user!.id}
            monNom={profile?.full_name ?? user!.email ?? "Moi"}
          />
        );
      })}
    </main>
  );
}

async function EquipeMessages({
  teamId,
  teamName,
  estStaff,
  monId,
  monNom,
}: {
  teamId: string;
  teamName: string;
  estStaff: boolean;
  monId: string;
  monNom: string;
}) {
  const supabase = await createClient();
  let roster: { id: string; nom: string }[] = [];

  if (estStaff) {
    const { data } = await supabase
      .from("team_members")
      .select("profile_id, profiles (full_name)")
      .eq("team_id", teamId)
      .eq("role_in_team", "athlete");
    roster = (data ?? []).map((m) => {
      const p = Array.isArray(m.profiles) ? m.profiles[0] : m.profiles;
      return { id: m.profile_id, nom: p?.full_name ?? "—" };
    });
  }

  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-condensed text-xl font-bold uppercase tracking-wide text-white">{teamName}</h2>
      <Messagerie teamId={teamId} estStaff={estStaff} monId={monId} monNom={monNom} roster={roster} />
    </section>
  );
}
