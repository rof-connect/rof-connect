import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { changerStatut, ajouterAEquipe, deplacerVersEquipe, retirerDeEquipe } from "./actions";

const STATUTS = [
  { id: 1, nom: "Prospect" },
  { id: 2, nom: "Mineur" },
  { id: 3, nom: "Majeur" },
  { id: 4, nom: "Intermédiaire" },
  { id: 5, nom: "Junior" },
  { id: 6, nom: "Senior" },
  { id: 7, nom: "JV" },
  { id: 8, nom: "Varsity" },
];

type Membership = {
  id: string;
  team_id: string;
  profile_id: string;
  status_id: number;
  profiles: { full_name: string | null } | { full_name: string | null }[] | null;
  teams: { name: string } | { name: string }[] | null;
};

export default async function JoueursPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user!.id).single();
  if (profile?.role !== "admin") redirect("/membres");

  const { data: teams } = await supabase.from("teams").select("id, name").eq("archived", false).order("name");

  const { data: memberships } = await supabase
    .from("team_members")
    .select("id, team_id, profile_id, status_id, profiles (full_name), teams (name)")
    .eq("role_in_team", "athlete");

  const parJoueur = new Map<string, { nom: string; memberships: Membership[] }>();
  (memberships ?? []).forEach((m) => {
    const p = Array.isArray(m.profiles) ? m.profiles[0] : m.profiles;
    const existant = parJoueur.get(m.profile_id);
    if (existant) {
      existant.memberships.push(m);
    } else {
      parJoueur.set(m.profile_id, { nom: p?.full_name ?? "—", memberships: [m] });
    }
  });

  const joueurs = Array.from(parJoueur.entries()).sort((a, b) => a[1].nom.localeCompare(b[1].nom));

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-5 py-10">
      <div>
        <p className="font-condensed text-sm uppercase tracking-[0.3em] text-rof-poudre">Direction</p>
        <h1 className="mt-1 font-condensed text-3xl font-bold uppercase text-rof-texte">Gestion des joueurs</h1>
        <p className="mt-2 text-sm text-rof-gris">
          Change le statut d&apos;un joueur, déplace-le vers une autre équipe, ou ajoute-le à une équipe supplémentaire.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {joueurs.map(([profileId, j]) => {
          const equipesActuelles = new Set(j.memberships.map((m) => m.team_id));
          const equipesDisponibles = (teams ?? []).filter((t) => !equipesActuelles.has(t.id));

          return (
            <div key={profileId} className="rounded-xl border border-rof-ligne bg-rof-blanc p-4">
              <p className="font-condensed text-lg font-bold uppercase text-rof-texte">{j.nom}</p>

              <div className="mt-2 flex flex-col gap-2">
                {j.memberships.map((m) => {
                  const team = Array.isArray(m.teams) ? m.teams[0] : m.teams;
                  return (
                    <div key={m.id} className="rounded-lg bg-rof-craie p-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-condensed text-sm font-bold uppercase text-rof-poudre">{team?.name ?? "—"}</span>
                        <form action={retirerDeEquipe}>
                          <input type="hidden" name="team_member_id" value={m.id} />
                          <button type="submit" className="text-xs text-rof-rouge underline">
                            Retirer
                          </button>
                        </form>
                      </div>

                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <form action={changerStatut} className="flex items-center gap-1">
                          <input type="hidden" name="team_member_id" value={m.id} />
                          <select
                            name="status_id"
                            defaultValue={m.status_id}
                            className="rounded-lg border border-rof-ligne bg-rof-blanc px-2 py-1 text-xs text-rof-texte"
                          >
                            {STATUTS.map((s) => (
                              <option key={s.id} value={s.id}>
                                {s.nom}
                              </option>
                            ))}
                          </select>
                          <button type="submit" className="text-xs text-rof-poudre underline">
                            Mettre à jour
                          </button>
                        </form>

                        {equipesDisponibles.length > 0 && (
                          <form action={deplacerVersEquipe} className="flex items-center gap-1">
                            <input type="hidden" name="team_member_id" value={m.id} />
                            <select
                              name="nouvelle_equipe_id"
                              className="rounded-lg border border-rof-ligne bg-rof-blanc px-2 py-1 text-xs text-rof-texte"
                            >
                              {equipesDisponibles.map((t) => (
                                <option key={t.id} value={t.id}>
                                  {t.name}
                                </option>
                              ))}
                            </select>
                            <button type="submit" className="text-xs text-rof-poudre underline">
                              Déplacer vers
                            </button>
                          </form>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {equipesDisponibles.length > 0 && (
                <form action={ajouterAEquipe} className="mt-3 flex items-center gap-1">
                  <input type="hidden" name="profile_id" value={profileId} />
                  <select
                    name="team_id"
                    className="rounded-lg border border-rof-ligne bg-rof-craie px-2 py-1 text-xs text-rof-texte"
                  >
                    {equipesDisponibles.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                  <button type="submit" className="text-xs text-rof-gazon underline">
                    + Ajouter à une équipe
                  </button>
                </form>
              )}
            </div>
          );
        })}
        {joueurs.length === 0 && <p className="text-sm text-rof-gris">Aucun joueur pour le moment.</p>}
      </div>
    </main>
  );
}
