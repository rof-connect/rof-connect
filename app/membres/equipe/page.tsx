import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getDictionnaire } from "@/lib/i18n/server";
import { CarteHub } from "@/components/membres/CarteHub";
import { trierEquipes } from "@/lib/equipes";

type Equipe = { id: string; name: string; sport: string };

export default async function EquipePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { t } = await getDictionnaire();
  const h = t.hubs;

  const admin = createAdminClient();
  const { data: profile } = await admin.from("profiles").select("role").eq("id", user!.id).single();
  const estAdmin = profile?.role === "admin";

  // Équipes dont l'utilisateur voit l'alignement : toutes pour la direction, sinon celles qu'il entraîne.
  let equipes: Equipe[] = [];
  if (estAdmin) {
    const { data } = await admin.from("teams").select("id, name, sport").eq("archived", false);
    equipes = data ?? [];
  } else {
    const { data } = await admin
      .from("team_members")
      .select("teams!inner (id, name, sport, archived)")
      .eq("profile_id", user!.id)
      .eq("role_in_team", "coach")
      .eq("teams.archived", false);
    equipes = (data ?? [])
      .map((m) => (Array.isArray(m.teams) ? m.teams[0] : m.teams) as Equipe | null)
      .filter((e): e is Equipe => !!e);
  }
  equipes = trierEquipes(equipes);

  const alignements = new Map<string, { id: string; nom: string }[]>();
  if (equipes.length) {
    const { data: membres } = await admin
      .from("team_members")
      .select("team_id, profile_id, profiles (full_name)")
      .in("team_id", equipes.map((e) => e.id))
      .eq("role_in_team", "athlete");
    for (const m of membres ?? []) {
      const p = (Array.isArray(m.profiles) ? m.profiles[0] : m.profiles) as { full_name: string | null } | null;
      const liste = alignements.get(m.team_id) ?? [];
      liste.push({ id: m.profile_id, nom: p?.full_name || "—" });
      alignements.set(m.team_id, liste);
    }
    for (const liste of alignements.values()) liste.sort((a, b) => a.nom.localeCompare(b.nom, "fr"));
  }

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-5 py-10">
      <p className="font-condensed text-sm uppercase tracking-[0.3em] text-rof-poudre">{t.nav.espaceMembres}</p>
      <h1 className="mt-1 font-condensed text-3xl font-bold uppercase text-rof-texte">{h.equipeTitre}</h1>
      <div className="mt-6 flex flex-col gap-3">
        <CarteHub href="/membres/gc" titre={t.nav.gc} description={h.gcDesc} />
        <CarteHub titre={t.nav.videos} description={h.videosDesc} bientot={h.bientot} />
        <CarteHub titre={h.plansTitre} description={h.plansDesc} bientot={h.bientot} />
        <CarteHub titre={t.nav.signaux} description={h.signauxDesc} bientot={h.bientot} />
      </div>

      {equipes.length > 0 && (
        <section className="mt-8 flex flex-col gap-4">
          <p className="font-condensed text-xs font-bold uppercase tracking-[0.2em] text-rof-or">{h.alignements}</p>
          {equipes.map((e) => {
            const liste = alignements.get(e.id) ?? [];
            return (
              <details key={e.id} className="rounded-xl border border-rof-ligne bg-rof-blanc" open={equipes.length === 1}>
                <summary className="flex cursor-pointer items-center justify-between p-4">
                  <span className="font-condensed text-lg font-semibold uppercase text-rof-texte">{e.name}</span>
                  <span className="font-condensed text-sm text-rof-gris">{liste.length}</span>
                </summary>
                <ul className="border-t border-rof-ligne">
                  {liste.map((j) => (
                    <li key={j.id} className="border-b border-rof-ligne last:border-b-0">
                      <Link href={`/membres/equipe/joueuse/${j.id}`} className="flex items-center justify-between px-4 py-3 text-sm text-rof-texte">
                        {j.nom}
                        <span aria-hidden="true" className="text-rof-poudre">›</span>
                      </Link>
                    </li>
                  ))}
                  {liste.length === 0 && <li className="px-4 py-3 text-sm text-rof-gris">{h.aucuneJoueuse}</li>}
                </ul>
              </details>
            );
          })}
        </section>
      )}
    </main>
  );
}
