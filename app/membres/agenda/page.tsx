import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { CarteEvenement } from "@/components/membres/CarteEvenement";
import { FormAjoutEvenement } from "@/components/membres/FormAjoutEvenement";
import { ImportExcel } from "@/components/membres/ImportExcel";
import { bouton } from "@/components/ui/boutons";

type EvenementBody = {
  type?: string;
  heure?: string | null;
  lieu?: string | null;
  note?: string | null;
};

function aujourdhui() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Toronto" }).format(new Date());
}

export default async function AgendaPage({ searchParams }: { searchParams: Promise<{ equipe?: string }> }) {
  const { equipe: filtre = "" } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user!.id).single();
  const estAdmin = profile?.role === "admin";

  const { data: memberships } = await supabase
    .from("team_members")
    .select("team_id, role_in_team, teams!inner (id, name)")
    .eq("profile_id", user!.id)
    .eq("teams.archived", false);

  const equipes = (memberships ?? []).map((m) => ({
    id: m.team_id,
    nom: ((Array.isArray(m.teams) ? m.teams[0] : m.teams) as { name: string } | null)?.name ?? "",
    peutEditer: estAdmin || m.role_in_team === "coach",
  }));
  const nomEquipe = new Map(equipes.map((e) => [e.id, e.nom]));
  const equipesVisibles = filtre && nomEquipe.has(filtre) ? equipes.filter((e) => e.id === filtre) : equipes;
  const idsVisibles = equipesVisibles.map((e) => e.id);
  const equipesCoach = equipes.filter((e) => e.peutEditer);

  const { data: evenements } = idsVisibles.length
    ? await supabase
        .from("contents")
        .select("id, title, event_date, body, team_id")
        .in("team_id", idsVisibles)
        .eq("kind", "agenda")
        .order("event_date", { ascending: true })
    : { data: [] as { id: string; title: string; event_date: string | null; body: unknown; team_id: string }[] };

  const ids = (evenements ?? []).map((e) => e.id);
  const { data: presences } = ids.length
    ? await supabase.from("attendance").select("content_id, profile_id, response").in("content_id", ids)
    : { data: [] as { content_id: string; profile_id: string; response: string }[] };

  // Alignements, seulement pour les équipes que l'utilisateur entraîne (vue des présences).
  const rosters = new Map<string, { id: string; nom: string }[]>();
  const idsCoachVisibles = equipesVisibles.filter((e) => e.peutEditer).map((e) => e.id);
  if (idsCoachVisibles.length) {
    const { data: membres } = await supabase
      .from("team_members")
      .select("team_id, profile_id, profiles (full_name)")
      .in("team_id", idsCoachVisibles)
      .eq("role_in_team", "athlete");
    for (const m of membres ?? []) {
      const p = Array.isArray(m.profiles) ? m.profiles[0] : m.profiles;
      rosters.set(m.team_id, [...(rosters.get(m.team_id) ?? []), { id: m.profile_id, nom: p?.full_name ?? "—" }]);
    }
  }

  const jour = aujourdhui();
  const aVenir = (evenements ?? []).filter((e) => (e.event_date ?? "") >= jour);
  const passes = (evenements ?? []).filter((e) => (e.event_date ?? "") < jour).reverse();
  const plusieursEquipes = equipes.length > 1;

  const carte = (e: NonNullable<typeof evenements>[number], passe: boolean) => {
    const body = (e.body ?? {}) as EvenementBody;
    const rows = (presences ?? []).filter((p) => p.content_id === e.id);
    const maReponse = (rows.find((p) => p.profile_id === user!.id)?.response as "yes" | "no" | undefined) ?? null;
    const roster = rosters.get(e.team_id) ?? [];
    const peutEditer = equipes.find((x) => x.id === e.team_id)?.peutEditer ?? false;
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
        equipe={plusieursEquipes ? nomEquipe.get(e.team_id) : undefined}
        passe={passe}
        maReponse={maReponse}
        peutEditer={peutEditer}
        presents={roster.filter((j) => rows.find((p) => p.profile_id === j.id && p.response === "yes"))}
        absents={roster.filter((j) => rows.find((p) => p.profile_id === j.id && p.response === "no"))}
        sansReponse={roster.filter((j) => !rows.find((p) => p.profile_id === j.id))}
      />
    );
  };

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-5 px-5 py-6">
      <div>
        <p className="font-condensed text-sm uppercase tracking-[0.3em] text-rof-poudre">Espace membres</p>
        <h1 className="mt-1 font-condensed text-3xl font-bold uppercase text-rof-texte">Agenda</h1>
      </div>

      {equipes.length === 0 && <p className="text-sm text-rof-gris">Aucune équipe assignée pour le moment.</p>}

      {plusieursEquipes && (
        <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
          <Link href="/membres/agenda" className={`${bouton(!filtre ? "primaire" : "neutre")} shrink-0`}>
            Toutes
          </Link>
          {equipes.map((e) => (
            <Link key={e.id} href={`/membres/agenda?equipe=${e.id}`} className={`${bouton(filtre === e.id ? "primaire" : "neutre")} shrink-0`}>
              {e.nom}
            </Link>
          ))}
        </div>
      )}

      {equipesCoach.length > 0 && (
        <details className="rounded-2xl border border-rof-ligne bg-rof-blanc">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4 [&::-webkit-details-marker]:hidden">
            <span className={bouton("primaire", "md")}>+ Ajouter un événement</span>
            <span className="text-sm text-rof-gris">Entraîneurs</span>
          </summary>
          <div className="flex flex-col gap-4 border-t border-rof-ligne p-4">
            {equipesCoach.map((e) => (
              <div key={e.id} className="flex flex-col gap-2">
                <p className="font-condensed text-sm font-bold uppercase tracking-wide text-rof-poudre">{e.nom}</p>
                <div className="flex flex-wrap gap-3">
                  <FormAjoutEvenement teamId={e.id} />
                  <ImportExcel modeleSlug="agenda" teamId={e.id} accesDefaut={1} />
                </div>
              </div>
            ))}
          </div>
        </details>
      )}

      <section className="flex flex-col gap-3">
        <h2 className="font-condensed text-sm font-bold uppercase tracking-[0.2em] text-rof-or">À venir ({aVenir.length})</h2>
        {aVenir.map((e) => carte(e, false))}
        {equipes.length > 0 && aVenir.length === 0 && (
          <p className="rounded-2xl border border-rof-ligne bg-rof-blanc p-4 text-sm text-rof-gris">Aucun événement à venir pour le moment.</p>
        )}
      </section>

      {passes.length > 0 && (
        <details className="group rounded-2xl border border-rof-ligne bg-rof-blanc">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4 [&::-webkit-details-marker]:hidden">
            <span className="font-condensed text-lg font-bold uppercase text-rof-texte">Événements passés ({passes.length})</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-rof-ligne text-rof-poudre transition-transform group-open:rotate-180" aria-hidden="true">
              ⌄
            </span>
          </summary>
          <div className="flex flex-col gap-3 border-t border-rof-ligne p-3">{passes.map((e) => carte(e, true))}</div>
        </details>
      )}
    </main>
  );
}
