import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { parcoursOuvert } from "@/lib/statuts";
import { CarteHub } from "@/components/membres/CarteHub";
import { CartePlan } from "@/components/membres/CartePlan";
import type { BlocProgramme } from "@/components/membres/CarteEvenement";

export const metadata = { title: "Plans d'entraînement · ROF Connect" };

type CorpsPlan = {
  note?: string | null;
  exercices_blocs?: { titre: string; info?: string; exercices: { code: string; nom: string; series: string; description: string; image?: string }[] }[];
};

export default async function PlansPage() {
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
    coach: m.role_in_team === "coach",
  }));
  const nomEquipe = new Map(equipes.map((e) => [e.id, e.nom]));

  // Les plans d'entraînement sont les programmes d'exercices déjà publiés dans l'agenda des équipes.
  const { data: evenements } = equipes.length
    ? await supabase
        .from("contents")
        .select("id, title, event_date, body, team_id")
        .in("team_id", equipes.map((e) => e.id))
        .eq("kind", "agenda")
        .order("event_date", { ascending: false })
    : { data: [] as { id: string; title: string; event_date: string | null; body: unknown; team_id: string }[] };

  // Un plan par titre et par équipe (le plus récent), pour ne pas répéter un programme planifié plusieurs fois.
  const vus = new Set<string>();
  const plans = (evenements ?? []).filter((e) => {
    const corps = (e.body ?? {}) as CorpsPlan;
    if (!corps.exercices_blocs?.length) return false;
    const cle = `${e.team_id}::${e.title.trim().toLowerCase()}`;
    if (vus.has(cle)) return false;
    vus.add(cle);
    return true;
  });

  // Photos des exercices : liens signés d'une heure.
  const chemins = [...new Set(plans.flatMap((e) => ((e.body ?? {}) as CorpsPlan).exercices_blocs?.flatMap((b) => b.exercices.map((x) => x.image ?? "")) ?? []).filter(Boolean))];
  const urls = new Map<string, string>();
  if (chemins.length) {
    const { data } = await createAdminClient().storage.from("media").createSignedUrls(chemins, 60 * 60);
    for (const d of data ?? []) if (d.path && d.signedUrl) urls.set(d.path, d.signedUrl);
  }

  const voitSprint = estAdmin || equipes.some((e) => e.coach) || (await parcoursOuvert(user!.id));
  const plusieursEquipes = equipes.length > 1;

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-5 py-8">
      <div>
        <p className="font-condensed text-sm uppercase tracking-[0.3em] text-rof-poudre">Espace membres</p>
        <h1 className="mt-1 font-condensed text-3xl font-bold uppercase text-rof-texte">Plans d&apos;entraînement</h1>
        <p className="mt-1 text-sm text-rof-gris">Touche un plan pour voir les exercices. Les étapes cochées ici sont les mêmes que dans l&apos;agenda.</p>
      </div>

      {voitSprint && (
        <CarteHub href="/membres/sprint" titre="Programme sprint" description="6 semaines · 2 × 30 min · animations de chaque exercice" />
      )}

      <h2 className="mt-2 font-condensed text-sm font-bold uppercase tracking-[0.2em] text-rof-or">Entraînement physique ({plans.length})</h2>
      {plans.length === 0 && (
        <p className="rounded-xl border border-rof-ligne bg-rof-blanc p-4 text-sm text-rof-gris">Aucun plan d&apos;entraînement publié pour le moment.</p>
      )}
      <div className="flex flex-col gap-2">
        {plans.map((e) => {
          const corps = (e.body ?? {}) as CorpsPlan;
          const blocs: BlocProgramme[] = (corps.exercices_blocs ?? []).map((b) => ({
            titre: b.titre,
            info: b.info,
            exercices: b.exercices.map((x) => ({ code: x.code, nom: x.nom, series: x.series, description: x.description, url: x.image ? urls.get(x.image) ?? null : null })),
          }));
          return (
            <CartePlan
              key={e.id}
              id={e.id}
              titre={e.title}
              equipe={plusieursEquipes ? nomEquipe.get(e.team_id) : undefined}
              date={e.event_date}
              note={corps.note ?? null}
              blocs={blocs}
              profilId={user!.id}
            />
          );
        })}
      </div>
    </main>
  );
}
