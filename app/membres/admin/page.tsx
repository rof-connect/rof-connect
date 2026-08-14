import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

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

export default async function DirectionPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user!.id).single();
  if (profile?.role !== "admin") redirect("/membres");

  const { data: teams } = await supabase.from("teams").select("id, name, sport, archived").eq("archived", false);
  const { data: membres } = await supabase
    .from("team_members")
    .select("team_id, profile_id, status_id, profiles (full_name, created_at)")
    .eq("role_in_team", "athlete");

  const profileIds = (membres ?? []).map((m) => m.profile_id);
  const { data: fiches } = await supabase
    .from("athlete_details")
    .select("profile_id, birth_date, guardian_phone, photo_consent")
    .in("profile_id", profileIds.length ? profileIds : ["00000000-0000-0000-0000-000000000000"]);
  const ficheParProfil = new Map((fiches ?? []).map((f) => [f.profile_id, f]));

  const total = (membres ?? []).length;
  const sansFiche = (membres ?? []).filter((m) => {
    const f = ficheParProfil.get(m.profile_id);
    return !f?.birth_date || !f?.guardian_phone;
  }).length;
  const consentements = (membres ?? []).filter((m) => ficheParProfil.get(m.profile_id)?.photo_consent).length;

  const parEquipe = (teams ?? []).map((t) => ({
    ...t,
    n: (membres ?? []).filter((m) => m.team_id === t.id).length,
  }));

  const parStatut = STATUTS.map((s) => ({
    ...s,
    n: (membres ?? []).filter((m) => m.status_id === s.id).length,
  }));

  const recents = [...(membres ?? [])]
    .sort((a, b) => {
      const pa = Array.isArray(a.profiles) ? a.profiles[0] : a.profiles;
      const pb = Array.isArray(b.profiles) ? b.profiles[0] : b.profiles;
      return new Date(pb?.created_at ?? 0).getTime() - new Date(pa?.created_at ?? 0).getTime();
    })
    .slice(0, 5);

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-5 py-10">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-condensed text-sm uppercase tracking-[0.3em] text-rof-poudre">Direction</p>
          <h1 className="mt-1 font-condensed text-3xl font-bold uppercase text-rof-texte">Vue d&apos;organisation</h1>
        </div>
        <div className="flex flex-col items-end gap-2">
          <a
            href="/api/export/joueurs"
            className="rounded-lg bg-rof-or px-4 py-2 font-condensed text-sm font-bold uppercase tracking-wide text-white"
          >
            Export CSV
          </a>
          <Link href="/membres/admin/equipes" className="text-sm text-rof-poudre underline">
            Gérer les équipes
          </Link>
          <Link href="/membres/admin/comptes" className="text-sm text-rof-poudre underline">
            Comptes entraîneurs &amp; direction
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Tuile n={total} l="Inscriptions totales" />
        <Tuile n={(teams ?? []).length} l="Équipes actives" />
        <Tuile n={consentements} l="Consentements photo" couleur="text-rof-gazon" />
        <Tuile n={sansFiche} l="Fiches incomplètes" couleur={sansFiche > 0 ? "text-rof-rouge" : "text-rof-gazon"} />
      </div>

      <div>
        <h3 className="mb-2 font-condensed text-xl font-bold uppercase tracking-wide text-rof-poudre">Effectifs par équipe</h3>
        <div className="grid gap-2">
          {parEquipe.map((t) => (
            <div key={t.id} className="flex items-center justify-between rounded-xl border border-rof-ligne bg-rof-blanc px-4 py-3">
              <div>
                <span className="font-semibold text-rof-texte">{t.name}</span>
                <span className="ml-2 text-xs text-rof-gris">{t.sport}</span>
              </div>
              <span className={`font-condensed text-2xl font-bold ${t.n > 0 ? "text-rof-or" : "text-rof-gris"}`}>{t.n}</span>
            </div>
          ))}
          {parEquipe.length === 0 && <p className="text-sm text-rof-gris">Aucune équipe.</p>}
        </div>
      </div>

      <div>
        <h3 className="mb-2 font-condensed text-xl font-bold uppercase tracking-wide text-rof-poudre">Pipeline de développement</h3>
        <div className="rounded-xl border border-rof-ligne bg-rof-blanc p-4">
          {parStatut.map((s) => (
            <div key={s.id} className="mb-2 flex items-center gap-3 last:mb-0">
              <div className="w-28 shrink-0 text-xs font-semibold uppercase text-rof-gris">{s.nom}</div>
              <div className="h-3 flex-1 overflow-hidden rounded-full bg-rof-craie">
                <div
                  className={`h-full rounded-full ${s.id >= 7 ? "bg-rof-or" : "bg-rof-royal"}`}
                  style={{ width: total ? `${(s.n / total) * 100}%` : "0%" }}
                />
              </div>
              <div className="w-8 text-right font-bold text-rof-texte">{s.n}</div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-2 font-condensed text-xl font-bold uppercase tracking-wide text-rof-poudre">Dernières inscriptions</h3>
        <div className="grid gap-2">
          {recents.map((m, i) => {
            const p = Array.isArray(m.profiles) ? m.profiles[0] : m.profiles;
            const team = (teams ?? []).find((t) => t.id === m.team_id);
            return (
              <div key={i} className="flex items-center justify-between rounded-xl border border-rof-ligne bg-rof-blanc px-4 py-2.5">
                <div>
                  <span className="font-semibold text-rof-texte">{p?.full_name}</span>
                  <span className="ml-2 text-xs text-rof-gris">{team?.name}</span>
                </div>
                <span className="text-xs text-rof-gris">
                  {p?.created_at ? new Date(p.created_at).toLocaleDateString("fr-CA") : ""}
                </span>
              </div>
            );
          })}
          {recents.length === 0 && <p className="text-sm text-rof-gris">Aucune inscription pour l&apos;instant.</p>}
        </div>
      </div>
    </main>
  );
}

function Tuile({ n, l, couleur }: { n: number; l: string; couleur?: string }) {
  return (
    <div className="rounded-2xl border border-rof-ligne bg-rof-blanc p-4 text-center">
      <div className={`font-condensed text-4xl font-bold ${couleur ?? "text-rof-or"}`}>{n}</div>
      <div className="mt-1 text-xs uppercase tracking-wide text-rof-gris">{l}</div>
    </div>
  );
}
