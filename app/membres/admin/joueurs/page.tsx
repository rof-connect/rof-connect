import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { changerStatut, ajouterAEquipe, deplacerVersEquipe, retirerDeEquipe, modifierJoueuse } from "./actions";
import { FormCreerJoueuse } from "@/components/membres/FormCreerJoueuse";
import { ImportJoueurs } from "@/components/membres/ImportJoueurs";
import { FormInviterJoueuse } from "@/components/membres/FormInviterJoueuse";

const STATUTS = [
  { id: 1, nom: "Prospect" },
  { id: 2, nom: "9U" },
  { id: 3, nom: "10U" },
  { id: 4, nom: "11U" },
  { id: 5, nom: "12U" },
  { id: 6, nom: "13U" },
  { id: 7, nom: "14U" },
  { id: 8, nom: "15U" },
  { id: 9, nom: "16U" },
  { id: 10, nom: "17U" },
  { id: 11, nom: "18U" },
];

type Membership = {
  id: string;
  team_id: string;
  profile_id: string;
  status_id: number;
  profiles: { full_name: string | null; email: string | null } | { full_name: string | null; email: string | null }[] | null;
  teams: { name: string; sport: string } | { name: string; sport: string }[] | null;
};

function normaliser(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

export default async function JoueursPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; sport?: string; equipe?: string; statut?: string }>;
}) {
  const { q = "", sport = "", equipe = "", statut = "" } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user!.id).single();
  if (profile?.role !== "admin") redirect("/membres");

  const { data: teams } = await supabase.from("teams").select("id, name").eq("archived", false).order("name");

  const { data: memberships } = await supabase
    .from("team_members")
    .select("id, team_id, profile_id, status_id, profiles (full_name, email), teams!inner (name, sport)")
    .eq("role_in_team", "athlete")
    .eq("teams.archived", false);

  const profileIds = [...new Set((memberships ?? []).map((m) => m.profile_id))];
  const { data: fiches } = await supabase
    .from("athlete_details")
    .select("profile_id, birth_date, position, throws, bats, guardian_name, guardian_phone, guardian_email, medical_notes, photo_consent")
    .in("profile_id", profileIds.length ? profileIds : ["00000000-0000-0000-0000-000000000000"]);
  const ficheParProfil = new Map((fiches ?? []).map((f) => [f.profile_id, f]));
  const naissanceParProfil = new Map((fiches ?? []).map((f) => [f.profile_id, f.birth_date]));

  const parJoueur = new Map<string, { nom: string; email: string; naissance: string | null; memberships: Membership[] }>();
  (memberships ?? []).forEach((m) => {
    const p = Array.isArray(m.profiles) ? m.profiles[0] : m.profiles;
    const existant = parJoueur.get(m.profile_id);
    if (existant) {
      existant.memberships.push(m);
    } else {
      parJoueur.set(m.profile_id, {
        nom: p?.full_name ?? "—",
        email: p?.email ?? "",
        naissance: naissanceParProfil.get(m.profile_id) ?? null,
        memberships: [m],
      });
    }
  });

  const tousLesJoueurs = Array.from(parJoueur.entries()).sort((a, b) => a[1].nom.localeCompare(b[1].nom));

  const recherche = normaliser(q.trim());
  const joueurs = tousLesJoueurs.filter(([, j]) => {
    if (recherche && !normaliser(j.nom).includes(recherche) && !normaliser(j.email).includes(recherche)) return false;
    if (!sport && !equipe && !statut) return true;
    return j.memberships.some((m) => {
      const t = Array.isArray(m.teams) ? m.teams[0] : m.teams;
      return (
        (!sport || t?.sport === sport) &&
        (!equipe || m.team_id === equipe) &&
        (!statut || String(m.status_id) === statut)
      );
    });
  });
  const filtreActif = Boolean(q || sport || equipe || statut);

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-5 py-10">
      <div>
        <p className="font-condensed text-sm uppercase tracking-[0.3em] text-rof-poudre">Direction</p>
        <h1 className="mt-1 font-condensed text-3xl font-bold uppercase text-rof-texte">Gestion des joueurs</h1>
        <p className="mt-2 text-sm text-rof-gris">
          Change le statut d&apos;un joueur, déplace-le vers une autre équipe, ou ajoute-le à une équipe supplémentaire.
        </p>
      </div>

      <FormCreerJoueuse equipes={teams ?? []} statuts={STATUTS} />
      <FormInviterJoueuse equipes={teams ?? []} />
      <ImportJoueurs />

      <form method="get" className="flex flex-col gap-3 rounded-xl border border-rof-ligne bg-rof-blanc p-4">
        <p className="font-condensed text-sm font-bold uppercase tracking-wide text-rof-gris">Filtrer la liste</p>
        <input
          name="q"
          defaultValue={q}
          placeholder="Rechercher un nom ou un courriel…"
          className="w-full rounded-lg border border-rof-ligne bg-rof-craie px-3 py-2 text-rof-texte placeholder:text-rof-gris/60"
        />
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <select
            name="sport"
            defaultValue={sport}
            className="rounded-lg border border-rof-ligne bg-rof-craie px-2 py-2 text-sm text-rof-texte"
          >
            <option value="">Tous les sports</option>
            <option value="baseball">Baseball</option>
            <option value="softball">Softball</option>
          </select>
          <select
            name="equipe"
            defaultValue={equipe}
            className="rounded-lg border border-rof-ligne bg-rof-craie px-2 py-2 text-sm text-rof-texte"
          >
            <option value="">Toutes les équipes</option>
            {(teams ?? []).map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
          <select
            name="statut"
            defaultValue={statut}
            className="rounded-lg border border-rof-ligne bg-rof-craie px-2 py-2 text-sm text-rof-texte"
          >
            <option value="">Tous les statuts</option>
            {STATUTS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nom}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="rounded-lg bg-rof-or px-4 py-2 font-condensed text-sm font-bold uppercase tracking-wide text-white"
          >
            Filtrer
          </button>
          {filtreActif && (
            <Link href="/membres/admin/joueurs" className="text-sm text-rof-poudre underline">
              Réinitialiser
            </Link>
          )}
          <span className="ml-auto text-sm text-rof-gris">
            {joueurs.length} / {tousLesJoueurs.length} joueur{tousLesJoueurs.length > 1 ? "s" : ""}
          </span>
        </div>
      </form>

      <div className="flex flex-col gap-4">
        {joueurs.map(([profileId, j]) => {
          const equipesActuelles = new Set(j.memberships.map((m) => m.team_id));
          const equipesDisponibles = (teams ?? []).filter((t) => !equipesActuelles.has(t.id));

          return (
            <div key={profileId} className="rounded-xl border border-rof-ligne bg-rof-blanc p-4">
              <p className="font-condensed text-lg font-bold uppercase text-rof-texte">{j.nom}</p>
              <p className="text-sm text-rof-gris">
                {j.naissance
                  ? `Née le ${new Date(j.naissance + "T12:00:00").toLocaleDateString("fr-CA")}`
                  : "Date de naissance non fournie"}
              </p>

              {j.email && <p className="text-sm text-rof-gris">{j.email}</p>}

              <details className="mt-2 rounded-lg border border-rof-ligne p-3">
                <summary className="cursor-pointer text-sm font-semibold text-rof-poudre">Modifier la fiche</summary>
                {(() => {
                  const f = ficheParProfil.get(profileId);
                  const c = "w-full rounded-lg border border-rof-ligne bg-rof-craie px-3 py-2 text-sm text-rof-texte";
                  const e = "mb-1 text-xs font-semibold uppercase tracking-wide text-rof-gris";
                  return (
                    <form action={modifierJoueuse} className="mt-3 flex flex-col gap-3">
                      <input type="hidden" name="profile_id" value={profileId} />
                      <div>
                        <p className={e}>Nom complet</p>
                        <input name="full_name" required defaultValue={j.nom === "—" ? "" : j.nom} className={c} />
                      </div>
                      <div>
                        <p className={e}>Date de naissance</p>
                        <input name="birth_date" type="date" defaultValue={f?.birth_date ?? ""} className={c} />
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <p className={e}>Position</p>
                          <input name="position" defaultValue={f?.position ?? ""} className={c} />
                        </div>
                        <div>
                          <p className={e}>Lance</p>
                          <select name="throws" defaultValue={f?.throws ?? ""} className={c}>
                            <option value="">—</option>
                            <option value="Droite">Droite</option>
                            <option value="Gauche">Gauche</option>
                          </select>
                        </div>
                        <div>
                          <p className={e}>Frappe</p>
                          <select name="bats" defaultValue={f?.bats ?? ""} className={c}>
                            <option value="">—</option>
                            <option value="Droite">Droite</option>
                            <option value="Gauche">Gauche</option>
                            <option value="Ambidextre">Ambidextre</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <p className={e}>Nom du parent ou tuteur</p>
                        <input name="guardian_name" defaultValue={f?.guardian_name ?? ""} className={c} />
                      </div>
                      <div>
                        <p className={e}>Téléphone du parent ou tuteur</p>
                        <input name="guardian_phone" type="tel" defaultValue={f?.guardian_phone ?? ""} className={c} />
                      </div>
                      <div>
                        <p className={e}>Courriel du parent ou tuteur</p>
                        <input name="guardian_email" type="email" defaultValue={f?.guardian_email ?? ""} className={c} />
                      </div>
                      <div>
                        <p className={e}>Allergies / infos médicales</p>
                        <input name="medical_notes" defaultValue={f?.medical_notes ?? ""} className={c} />
                      </div>
                      <label className="flex items-center gap-2 text-sm text-rof-texte">
                        <input type="checkbox" name="photo_consent" defaultChecked={f?.photo_consent ?? false} /> Consentement photo / vidéo
                      </label>
                      <button
                        type="submit"
                        className="w-fit rounded-lg bg-rof-or px-4 py-2 font-condensed text-sm font-bold uppercase tracking-wide text-white"
                      >
                        Enregistrer
                      </button>
                    </form>
                  );
                })()}
              </details>

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
        {joueurs.length === 0 && (
          <p className="text-sm text-rof-gris">{filtreActif ? "Aucun joueur ne correspond à ces filtres." : "Aucun joueur pour le moment."}</p>
        )}
      </div>
    </main>
  );
}
