import { redirect } from "next/navigation";
import { trierEquipes } from "@/lib/equipes";
import Link from "next/link";
import { bouton } from "@/components/ui/boutons";
import { createClient } from "@/lib/supabase/server";
import { chargerArchivees } from "@/lib/joueuses-archivees";
import { chargerStatutsJoueuses, statutEffectif, statutSelonNaissance } from "@/lib/statuts";
import { accepterJoueuse } from "@/app/membres/admin/joueurs/actions";
import { chargerConnexions, ilYa } from "@/lib/dernieres-connexions";
import { sportAdmin } from "@/lib/sport-admin";
import { chargerGroupes } from "@/lib/groupes";
import { chargerSportsJoueuses } from "@/lib/sport-joueuses";
import { SelecteurSportAdmin } from "@/components/membres/SelecteurSportAdmin";

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

  const connexions = (await chargerConnexions()).filter((c) => c.vue).slice(0, 8);

  const { data: teamsBrut } = await supabase.from("teams").select("id, name, sport, archived").eq("archived", false);
  const sportFiltre = await sportAdmin();
  const sportsJoueuses = await chargerSportsJoueuses();
  const groupes = await chargerGroupes(); // les groupes ne comptent ni dans les effectifs ni dans le pipeline
  const teams = trierEquipes(teamsBrut).filter((t) => !groupes.has(t.id) && (!sportFiltre || t.sport === sportFiltre));
  const archivees = await chargerArchivees();
  const { data: membresBrut } = await supabase
    .from("team_members")
    .select("team_id, profile_id, status_id, profiles (full_name, created_at), teams!inner (id, sport)")
    .eq("role_in_team", "athlete")
    .eq("teams.archived", false);
  const sportDeMembre = (m: { teams?: unknown }) => (Array.isArray(m.teams) ? (m.teams[0] as { sport?: string } | undefined) : (m.teams as { sport?: string } | null | undefined))?.sport;
  const membresTousSports = (membresBrut ?? []).filter((m) => !archivees.has(m.profile_id) && !groupes.has(m.team_id));
  // Le sport choisi pour la joueuse prime sur celui de ses équipes.
  const membres = membresTousSports.filter((m) => !sportFiltre || (sportsJoueuses[m.profile_id] ?? sportDeMembre(m)) === sportFiltre);
  const idsAvecEquipe = new Set(membresTousSports.map((m) => m.profile_id));
  const idsDuSport = new Set(membres.map((m) => m.profile_id));

  const { data: comptes } = await supabase.from("profiles").select("id, full_name, email, created_at").eq("role", "member");
  // Avec un sport choisi : les joueuses de ce sport, plus celles qui n'ont encore aucune équipe (sport pas encore décidé).
  const comptesActifs = (comptes ?? []).filter((c) => !archivees.has(c.id) && (!sportFiltre || sportsJoueuses[c.id] === sportFiltre || (!sportsJoueuses[c.id] && (idsDuSport.has(c.id) || !idsAvecEquipe.has(c.id)))));
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
  const { data: naissances } = await supabase
    .from("athlete_details")
    .select("profile_id, birth_date")
    .in("profile_id", aGerer.length ? aGerer.map((c) => c.id) : ["00000000-0000-0000-0000-000000000000"]);
  const naissanceDe = new Map((naissances ?? []).map((n) => [n.profile_id, n.birth_date as string | null]));

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

  // Pipeline : toutes les joueuses ensemble (avec ou sans équipe), classées selon LEUR statut : un aperçu des âges.
  const statutsEquipes = new Map<string, number[]>();
  membres.forEach((m) => {
    statutsEquipes.set(m.profile_id, [...(statutsEquipes.get(m.profile_id) ?? []), m.status_id]);
  });
  const pipeline = {
    total: comptesActifs.length,
    parStatut: STATUTS.map((s) => ({
      ...s,
      n: comptesActifs.filter((c) => statutEffectif(c.id, statutsJoueuses, statutsEquipes.get(c.id) ?? []) === s.id).length,
    })),
  };

  const aFaire = [
    { n: aGerer.length, texte: "prospect(s) à accepter", href: "#prospects" },
    { n: nbMessagesEnAttente, texte: "conversation(s) privée(s) en attente", href: "/membres/messages" },
    { n: nbParcoursNouveaux ?? 0, texte: "questionnaire(s) de parcours à traiter", href: "/membres/admin/parcours" },
    { n: sansFiche, texte: "fiche(s) de joueur incomplète(s)", href: "/membres/admin/joueurs" },
  ].filter((t) => t.n > 0);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-7 px-5 py-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-condensed text-sm uppercase tracking-[0.3em] text-rof-poudre">Direction</p>
          <h1 className="mt-1 font-condensed text-3xl font-bold uppercase text-rof-texte">Tableau de bord</h1>
        </div>
        <SelecteurSportAdmin actif={sportFiltre} retour="/membres/admin" />
      </div>

      <section>
        <h2 className="mb-2 font-condensed text-sm font-bold uppercase tracking-[0.2em] text-rof-or">À faire</h2>
        {aFaire.length > 0 ? (
          <div className="grid gap-2">
            {aFaire.map((t) => (
              <Link
                key={t.texte}
                href={t.href}
                className="flex items-center gap-4 rounded-2xl border border-rof-or/50 bg-rof-blanc p-4 transition-colors hover:border-rof-or active:scale-[0.99]"
              >
                <span className="w-12 shrink-0 text-center font-condensed text-4xl font-bold leading-none text-rof-or">{t.n}</span>
                <span className="min-w-0 flex-1 text-rof-texte">{t.texte}</span>
                <span className={bouton("primaire", "sm")}>Traiter ›</span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-3 rounded-2xl border border-rof-gazon/50 bg-rof-blanc p-4 text-rof-texte">
            <span className="font-condensed text-2xl text-rof-gazon">✓</span> Rien à faire pour le moment.
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-2 font-condensed text-sm font-bold uppercase tracking-[0.2em] text-rof-gris">Gérer</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <TuileMenu href="/membres/admin/joueurs" titre="Joueurs" sous={`${nbComptes ?? total} inscrits`} icone={ICONES.joueurs} />
          <TuileMenu href="/membres/admin/equipes" titre="Équipes" sous={`${(teams ?? []).length} actives`} icone={ICONES.equipes} />
          <TuileMenu href="/membres/admin/statuts" titre="Statuts" sous="Charte d'âge" icone={ICONES.statuts} />
          <TuileMenu href="/membres/admin/messages" titre="Message à tous" sous="Accueil des membres" icone={ICONES.messages} />
          <TuileMenu href="/membres/admin/sondages" titre="Sondages" sous="Créer et suivre" icone={ICONES.sondages} />
          <TuileMenu
            href="/membres/admin/parcours"
            titre="Parcours NCAA"
            sous="Questionnaires"
            icone={ICONES.parcours}
            pastille={nbParcoursNouveaux ?? 0}
          />
          <TuileMenu href="/membres/admin/infolettre" titre="Infolettre" sous="Abonnés" icone={ICONES.infolettre} />
          <TuileMenu href="/membres/admin/comptes" titre="Comptes" sous="Entraîneurs, direction" icone={ICONES.comptes} />
          <TuileMenu href="/membres/admin/connexions" titre="Connexions" sous="Activité récente" icone={ICONES.connexions} />
          <TuileMenu href="/api/export/joueurs" titre="Export CSV" sous="Tous les joueurs" icone={ICONES.export} externe />
        </div>
      </section>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Tuile n={nbComptes ?? total} l="Joueurs inscrits" />
        <Tuile n={(teams ?? []).length} l="Équipes actives" />
        <Tuile n={consentements} l="Consentements photo" couleur="text-rof-gazon" />
        <Tuile n={sansFiche} l="Fiches incomplètes" couleur={sansFiche > 0 ? "text-rof-rouge" : "text-rof-gazon"} />
      </div>

      <div id="prospects">
        <div className="mb-2 flex items-end justify-between gap-3">
          <h3 className="font-condensed text-xl font-bold uppercase tracking-wide text-rof-poudre">
            Nouvelles connexions à gérer <span className="text-rof-or">({aGerer.length})</span>
          </h3>
          <Link href="/membres/admin/joueurs?equipe=aucune" className={bouton("secondaire")}>
            Voir tous
          </Link>
        </div>
        <div className="grid gap-2">
          {aGerer.slice(0, 10).map((c) => {
            const suggere = statutSelonNaissance(naissanceDe.get(c.id));
            return (
              <div key={c.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-rof-ligne bg-rof-blanc px-4 py-2.5">
                <Link href={`/membres/admin/joueurs?id=${c.id}`} className="min-w-0 flex-1 hover:text-rof-or">
                  <span className="font-semibold text-rof-texte">{c.full_name || c.email || "—"}</span>
                  <span className="ml-2 rounded-md bg-rof-craie px-1.5 py-0.5 text-xs text-rof-gris">Prospect</span>
                  <span className="ml-2 text-xs text-rof-gris">{c.created_at ? new Date(c.created_at).toLocaleDateString("fr-CA") : ""}</span>
                </Link>
                {suggere ? (
                  <form action={accepterJoueuse}>
                    <input type="hidden" name="profile_id" value={c.id} />
                    <button
                      type="submit"
                      className={bouton("primaire")}
                      title={`${suggere.age} ans au ${suggere.ref.toLocaleDateString("fr-CA", { day: "numeric", month: "long", year: "numeric" })} (charte Little League)`}
                    >
                      Accepter → {suggere.nom}
                    </button>
                  </form>
                ) : (
                  <Link href={`/membres/admin/joueurs?id=${c.id}`} className={bouton("danger")}>
                    Date de naissance manquante
                  </Link>
                )}
              </div>
            );
          })}
          {aGerer.length === 0 && <p className="text-sm text-rof-gris">Aucune nouvelle connexion à gérer.</p>}
          {aGerer.length > 10 && <p className="text-xs text-rof-gris">+ {aGerer.length - 10} autres : « Voir tous ».</p>}
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-baseline justify-between">
          <h3 className="font-condensed text-xl font-bold uppercase tracking-wide text-rof-poudre">Dernières connexions</h3>
          <Link href="/membres/admin/connexions" className={bouton("secondaire")}>
            Voir toutes
          </Link>
        </div>
        <div className="grid gap-2">
          {connexions.map((c) => (
            <Link
              key={c.id}
              href={`/membres/admin/joueurs?id=${c.id}`}
              className={bouton("neutre", "md")}
            >
              <span className="min-w-0 truncate font-semibold text-rof-texte">{c.nom || c.courriel || "—"}</span>
              <span className="shrink-0 text-xs text-rof-gris">{ilYa(c.vue!)}</span>
            </Link>
          ))}
          {connexions.length === 0 && <p className="text-sm text-rof-gris">Aucune connexion enregistrée.</p>}
        </div>
      </div>

      <div>
        <h3 className="mb-2 font-condensed text-xl font-bold uppercase tracking-wide text-rof-poudre">Effectifs par équipe</h3>
        <div className="grid gap-2">
          {parEquipe.map((t) => (
            <Link
              key={t.id}
              href={`/membres/admin/equipes/${t.id}`}
              className={bouton("neutre", "lg")}
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
        <PipelineSport titre="Toutes les joueuses" parStatut={pipeline.parStatut} total={pipeline.total} />
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
  const plusGrand = Math.max(0, ...parStatut.map((s) => s.n)); // barres relatives à la plus grande catégorie d'âge
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
              style={{ width: plusGrand ? `${(s.n / plusGrand) * 100}%` : "0%" }}
            />
          </div>
          <div className="w-6 text-right font-bold text-rof-texte">{s.n}</div>
        </div>
      ))}
    </div>
  );
}

const ICONES = {
  joueurs: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM5 21a7 7 0 0 1 14 0",
  equipes: "M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM3 20a6 6 0 0 1 12 0M17 11a2.5 2.5 0 1 0 0-5M16 14a5 5 0 0 1 5 6",
  statuts: "M4 6h16M4 12h10M4 18h6M17 14l2 2 4-4",
  messages: "M4 5h16v11H9l-5 4z",
  sondages: "M5 20V10M12 20V4M19 20v-7",
  parcours: "M4 19h16M6 15l4-4 3 3 5-6",
  infolettre: "M3 6h18v12H3zM3 7l9 6 9-6",
  comptes: "M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7z",
  connexions: "M12 7v5l3 3M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z",
  export: "M12 4v11M7 10l5 5 5-5M5 20h14",
};

function TuileMenu({
  href,
  titre,
  sous,
  icone,
  pastille = 0,
  externe = false,
}: {
  href: string;
  titre: string;
  sous: string;
  icone: string;
  pastille?: number;
  externe?: boolean;
}) {
  const contenu = (
    <>
      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-rof-royal-sombre text-rof-poudre">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d={icone} />
        </svg>
      </span>
      <span className="mt-3 block font-condensed text-lg font-bold uppercase leading-tight text-rof-texte">{titre}</span>
      <span className="block text-xs text-rof-gris">{sous}</span>
      {pastille > 0 && (
        <span className="absolute right-3 top-3 flex h-6 min-w-6 items-center justify-center rounded-full bg-rof-rouge px-1.5 text-xs font-bold text-white">
          {pastille}
        </span>
      )}
    </>
  );
  const classes =
    "relative block rounded-2xl border border-rof-ligne bg-rof-blanc p-4 transition-colors hover:border-rof-or active:scale-[0.98]";
  return externe ? (
    <a href={href} className={classes}>
      {contenu}
    </a>
  ) : (
    <Link href={href} className={classes}>
      {contenu}
    </Link>
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
