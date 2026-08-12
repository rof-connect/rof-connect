import { createClient } from "@/lib/supabase/server";
import { CarteEvenement } from "@/components/membres/CarteEvenement";
import { FormAjoutEvenement } from "@/components/membres/FormAjoutEvenement";

type EvenementBody = {
  type?: string;
  heure?: string | null;
  lieu?: string | null;
  note?: string | null;
};

export default async function AgendaPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user!.id).single();
  const estAdmin = profile?.role === "admin";

  const { data: memberships } = await supabase
    .from("team_members")
    .select("team_id, role_in_team, teams (id, name)")
    .eq("profile_id", user!.id);

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-10 px-5 py-10">
      <div>
        <p className="font-condensed text-sm uppercase tracking-[0.3em] text-rof-poudre">Espace membres</p>
        <h1 className="mt-1 font-condensed text-3xl font-bold uppercase text-rof-texte">Agenda &amp; présences</h1>
      </div>

      {(memberships ?? []).length === 0 && (
        <p className="text-sm text-rof-gris">Aucune équipe assignée pour le moment.</p>
      )}

      {(memberships ?? []).map((m) => {
        const team = Array.isArray(m.teams) ? m.teams[0] : m.teams;
        const peutEditer = estAdmin || m.role_in_team === "coach";
        return (
          <EquipeAgenda
            key={m.team_id}
            teamId={m.team_id}
            teamName={team?.name ?? ""}
            peutEditer={peutEditer}
            userId={user!.id}
          />
        );
      })}
    </main>
  );
}

async function EquipeAgenda({
  teamId,
  teamName,
  peutEditer,
  userId,
}: {
  teamId: string;
  teamName: string;
  peutEditer: boolean;
  userId: string;
}) {
  const supabase = await createClient();

  const { data: evenements } = await supabase
    .from("contents")
    .select("id, title, event_date, body")
    .eq("team_id", teamId)
    .eq("kind", "agenda")
    .order("event_date", { ascending: true });

  const ids = (evenements ?? []).map((e) => e.id);

  const { data: presences } = ids.length
    ? await supabase.from("attendance").select("content_id, profile_id, response").in("content_id", ids)
    : { data: [] as { content_id: string; profile_id: string; response: string }[] };

  let roster: { id: string; nom: string }[] = [];
  if (peutEditer) {
    const { data: membres } = await supabase
      .from("team_members")
      .select("profile_id, profiles (full_name)")
      .eq("team_id", teamId)
      .eq("role_in_team", "athlete");
    roster = (membres ?? []).map((m) => {
      const p = Array.isArray(m.profiles) ? m.profiles[0] : m.profiles;
      return { id: m.profile_id, nom: p?.full_name ?? "—" };
    });
  }

  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-condensed text-xl font-bold uppercase tracking-wide text-white">{teamName}</h2>

      {peutEditer && <FormAjoutEvenement teamId={teamId} />}

      <div className="flex flex-col gap-3">
        {(evenements ?? []).map((e) => {
          const body = (e.body ?? {}) as EvenementBody;
          const rows = (presences ?? []).filter((p) => p.content_id === e.id);
          const maReponse = (rows.find((p) => p.profile_id === userId)?.response as "yes" | "no" | undefined) ?? null;

          const presents = roster.filter((j) => rows.find((p) => p.profile_id === j.id && p.response === "yes"));
          const absents = roster.filter((j) => rows.find((p) => p.profile_id === j.id && p.response === "no"));
          const sansReponse = roster.filter((j) => !rows.find((p) => p.profile_id === j.id));

          return (
            <CarteEvenement
              key={e.id}
              id={e.id}
              titre={e.title}
              type={body.type ?? "Autre"}
              date={e.event_date ?? ""}
              heure={body.heure ?? null}
              lieu={body.lieu ?? null}
              note={body.note ?? null}
              maReponse={maReponse}
              peutEditer={peutEditer}
              presents={presents}
              absents={absents}
              sansReponse={sansReponse}
            />
          );
        })}
        {(evenements ?? []).length === 0 && (
          <p className="text-sm text-rof-gris">Aucun événement à l&apos;agenda pour le moment.</p>
        )}
      </div>
    </section>
  );
}
