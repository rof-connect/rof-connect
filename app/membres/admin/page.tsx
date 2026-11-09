import { redirect } from "next/navigation";
import { trierEquipes } from "@/lib/equipes";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { chargerArchivees } from "@/lib/joueuses-archivees";
import { chargerDepots } from "@/lib/depots";
import { chargerStatutsJoueuses } from "@/lib/statuts";

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

export default async function DirectionPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user!.id).single();
  if (profile?.role !== "admin") redirect("/membres");

  const { data: teamsBrut } = await supabase.from("teams").select("id, name, sport, archived").eq("archived", false);
  const teams = trierEquipes(teamsBrut);
  const archivees = await chargerArchivees();
  const { data: membresBrut } = await supabase
    .from("team_members")
    .select("team_id, profile_id, status_id, profiles (full_name, created_at), teams!inner (id, sport)")
    .eq("role_in_team", "athlete")
    .eq("teams.archived", false);
  const membres = (membresBrut ?? []).filter((m) => !archivees.has(m.profile_id));

  const { data: comptes } = await supabase.from("profiles").select("id, full_name, email, created_at").eq("role", "member");
  const comptesActifs = (comptes ?? []).filter((c) => !archivees.has(c.id));
  const nbComptes = comptesActifs.length;

  // Nouvelles connexions à gérer : Prospect = aucune équipe, ou seulement le statut Prospect.
  const statutsJoueuses = await chargerStatutsJoueuses();
  const placees = new Set([
    ...membres.filter((m) => m.status_id > 1).map((m) => m.profile_id),
    ...Object.entries(statutsJoueuses).filter(([, st]) => st > 1).map(([id]) => id),
  ]);
  const aGerer = comptesActifs
    .filter((c) => !placees.has(c.id))
    .sort((a, b) => new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime());

  // À faire : tout ce qui attend une action de la Direction. Ajouter ici chaque nouvelle tâche.
  const { count: nbParcoursNouveaux } = await supabase
    .from("parcours_demandes")
    .select("id", { count: "exact", head: true })
    .eq("statut", "nouveau");
  const il_y_a_30j = new Date(Date.now() - 30 * 86400000).toISOString();
  const { data: privesRecents } = await supabase
    .from("messages")
    .select("thread_profile_id, author_id, created_at")
    .eq("channel", "private")
    .gte("created_at", il_y_a_30j)
    .order("created_at", { ascending: false });
  // Une conversation privée attend une réponse quand son dernier message vient de la joueuse.
  const dernierParFil = new Map<string, string>();
  (privesRecents ?? []).forEach((m) => {
    if (m.thread_profile_id && !dernierParFil.has(m.thread_profile_id)) dernierParFil.set(m.thread_profile_id, m.author_id);
  });
  const nbMessagesEnAttente = [...dernierParFil.entries()].filter(([fil, auteur]) => fil === auteur).length;

  // Dépôts de 500 $ (softball, statut autre que Prospect) : à confirmer / en attente.
  const depots = await chargerDepots();
  const devantDepot = new Set(
    membres
      .filter((m) => {
        const t = Array.isArray(m.teams) ? m.teams[0] : m.teams;
        return t?.sport === "softball" && m.status_id > 1;
      })
      .map((m) => m.profile_id),
  );
  const nbDepotsAConfirmer = [...devantDepot].filter((id) => depots[id] === "envoye").length;
  const nbDepotsEnAttente = [...devantDepot].filter((id) => !depots[id]).length;

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

  const sportDe = (m: NonNullable<typeof membres>[number]) => {
    const t = Array.isArray(m.teams) ? m.teams[0] : m.teams;
    return t?.sport;
  };

  const parStatutParSport = (sport: string) =>
    STATUTS.map((s) => ({
      ...s,
      n: (membres ?? []).filter((m) => m.status_id === s.id && sportDe(m) === sport).length,
    }));

  const parStatutBaseball = parStatutParSport("baseball");
  const parStatutSoftball = parStatutParSport("softball");
  const totalBaseball = (membres ?? []).filter((m) => sportDe(m) === "baseball").length;
  const totalSoftball = (membres ?? []).filter((m) => sportDe(m) === "softball").length;

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
          <Link href="/membres/admin/joueurs" className="text-sm text-rof-poudre underline">
            Gérer les joueurs
          </Link>
          <Link href="/membres/admin/messages" className="text-sm text-rof-poudre underline">
            Messages à tous
          </Link>
          <Link href="/membres/admin/sondages" className="text-sm text-rof-poudre underline">
            Sondages
          </Link>
          <Link href="/membres/admin/parcours" className="text-sm text-rof-poudre underline">
            Questionnaires de parcours
          </Link>
          <Link href="/membres/admin/comptes" className="text-sm text-rof-poudre underline">
            Comptes entraîneurs &amp; direction
          </Link>
        </div>
      </div>

      <section className="rounded-2xl border-2 border-rof-or bg-rof-blanc p-4">
        <h2 className="font-condensed text-xl font-bold uppercase tracking-wide text-rof-or">À faire</h2>
        <ul className="mt-2 flex flex-col divide-y divide-rof-ligne">
          {[
            { n: aGerer.length, texte: "nouvelle(s) connexion(s) Prospect à gérer", href: "#prospects" },
            { n: nbMessagesEnAttente, texte: "conversation(s) privée(s) en attente de réponse", href: "/membres/messages" },
            { n: nbDepotsAConfirmer, texte: "dépôt(s) de 500 $ envoyé(s) à confirmer", href: "/membres/admin/joueurs?sport=softball" },
            { n: nbDepotsEnAttente, texte: "joueuse(s) de softball qui n'ont pas encore envoyé leur dépôt de 500 $", href: "/membres/admin/joueurs?sport=softball" },
            { n: nbParcoursNouveaux ?? 0, texte: "questionnaire(s) de parcours à traiter", href: "/membres/admin/parcours" },
            { n: sansFiche, texte: "fiche(s) de joueuse incomplète(s)", href: "/membres/admin/joueurs" },
          ]
            .filter((t) => t.n > 0)
            .map((t) => (
              <li key={t.texte}>
                <Link href={t.href} className="flex items-center justify-between gap-3 py-2.5 hover:text-rof-or">
                  <span className="text-rof-texte">
                    <span className="mr-2 font-condensed text-2xl font-bold text-rof-or">{t.n}</span>
                    {t.texte}
                  </span>
                  <span className="text-rof-gris" aria-hidden>
                    ›
                  </span>
                </Link>
              </li>
            ))}
        </ul>
        {aGerer.length + nbMessagesEnAttente + nbDepotsAConfirmer + nbDepotsEnAttente + (nbParcoursNouveaux ?? 0) + sansFiche === 0 && (
          <p className="mt-2 text-sm text-rof-gris">Rien à faire pour le moment. ✓</p>
        )}
      </section>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Tuile n={nbComptes ?? total} l="Joueuses inscrites" />
        <Tuile n={(teams ?? []).length} l="Équipes actives" />
        <Tuile n={consentements} l="Consentements photo" couleur="text-rof-gazon" />
        <Tuile n={sansFiche} l="Fiches incomplètes" couleur={sansFiche > 0 ? "text-rof-rouge" : "text-rof-gazon"} />
      </div>



      <div id="prospects">
        <div className="mb-2 flex items-end justify-between gap-3">
          <h3 className="font-condensed text-xl font-bold uppercase tracking-wide text-rof-poudre">
            Nouvelles connexions à gérer <span className="text-rof-or">({aGerer.length})</span>
          </h3>
          <Link href="/membres/admin/joueurs?equipe=aucune" className="text-sm text-rof-poudre underline">
            Voir tous
          </Link>
        </div>
        <div className="grid gap-2">
          {aGerer.slice(0, 10).map((c) => (
            <Link
              key={c.id}
              href={`/membres/admin/joueurs?id=${c.id}`}
              className="flex items-center justify-between gap-3 rounded-xl border border-rof-ligne bg-rof-blanc px-4 py-2.5 hover:border-rof-or"
            >
              <div className="min-w-0">
                <span className="font-semibold text-rof-texte">{c.full_name || c.email || "—"}</span>
                <span className="ml-2 rounded-md bg-rof-craie px-1.5 py-0.5 text-xs text-rof-gris">Prospect</span>
              </div>
              <span className="flex shrink-0 items-center gap-2 text-xs text-rof-gris">
                {c.created_at ? new Date(c.created_at).toLocaleDateString("fr-CA") : ""}
                <span aria-hidden>›</span>
              </span>
            </Link>
          ))}
          {aGerer.length === 0 && <p className="text-sm text-rof-gris">Aucune nouvelle connexion à gérer.</p>}
          {aGerer.length > 10 && <p className="text-xs text-rof-gris">+ {aGerer.length - 10} autres : « Voir tous ».</p>}
        </div>
      </div>

      <div>
        <h3 className="mb-2 font-condensed text-xl font-bold uppercase tracking-wide text-rof-poudre">Effectifs par équipe</h3>
        <div className="grid gap-2">
          {parEquipe.map((t) => (
            <Link
              key={t.id}
              href={`/membres/admin/equipes/${t.id}`}
              className="flex items-center justify-between rounded-xl border border-rof-ligne bg-rof-blanc px-4 py-3 hover:border-rof-or"
            >
              <div>
                <span className="font-semibold text-rof-texte">{t.name}</span>
                <span className="ml-2 text-xs text-rof-gris">{t.sport}</span>
              </div>
              <span className="flex items-center gap-2">
                <span className={`font-condensed text-2xl font-bold ${t.n > 0 ? "text-rof-or" : "text-rof-gris"}`}>{t.n}</span>
                <span className="text-rof-gris" aria-hidden>
                  ›
                </span>
              </span>
            </Link>
          ))}
          {parEquipe.length === 0 && <p className="text-sm text-rof-gris">Aucune équipe.</p>}
        </div>
      </div>

      <div>
        <h3 className="mb-2 font-condensed text-xl font-bold uppercase tracking-wide text-rof-poudre">Pipeline de développement</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <PipelineSport titre="Baseball" parStatut={parStatutBaseball} total={totalBaseball} />
          <PipelineSport titre="Softball" parStatut={parStatutSoftball} total={totalSoftball} />
        </div>
      </div>

    </main>
  );
}

function PipelineSport({
  titre,
  parStatut,
  total,
}: {
  titre: string;
  parStatut: { id: number; nom: string; n: number }[];
  total: number;
}) {
  return (
    <div className="rounded-xl border border-rof-ligne bg-rof-blanc p-4">
      <p className="mb-2 font-condensed text-sm font-bold uppercase tracking-wide text-rof-gris">
        {titre} <span className="text-rof-texte">({total})</span>
      </p>
      {parStatut.map((s) => (
        <div key={s.id} className="mb-2 flex items-center gap-3 last:mb-0">
          <div className="w-16 shrink-0 text-xs font-semibold uppercase text-rof-gris">{s.nom}</div>
          <div className="h-3 flex-1 overflow-hidden rounded-full bg-rof-craie">
            <div
              className={`h-full rounded-full ${s.id >= 2 ? "bg-rof-or" : "bg-rof-royal"}`}
              style={{ width: total ? `${(s.n / total) * 100}%` : "0%" }}
            />
          </div>
          <div className="w-6 text-right font-bold text-rof-texte">{s.n}</div>
        </div>
      ))}
    </div>
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
