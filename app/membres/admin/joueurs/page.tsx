import { redirect } from "next/navigation";
import { trierEquipes } from "@/lib/equipes";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ajouterAEquipe, deplacerVersEquipe, retirerDeEquipe, modifierJoueuse, archiverJoueuse, changerStatutJoueuse } from "./actions";
import { chargerArchivees } from "@/lib/joueuses-archivees";
import { chargerTousLiens } from "@/lib/liens-sociaux";
import { changerNumeroJoueuse, changerInfosRoster, changerSportJoueuse } from "@/app/membres/admin/joueurs/actions";
import { chargerSportsJoueuses, sportEffectif, sportPourAge } from "@/lib/sport-joueuses";
import { chargerNumeros } from "@/lib/numeros-chandail";
import { chargerInfosRoster } from "@/lib/infos-roster";
import { sportAdmin } from "@/lib/sport-admin";
import { chargerGroupes } from "@/lib/groupes";
import { SelecteurSportAdmin } from "@/components/membres/SelecteurSportAdmin";
import { toutesPresentations } from "@/lib/presentation";
import { FormPhotoJoueuse } from "@/components/membres/FormPhotoJoueuse";
import { chargerStatutsJoueuses, statutEffectif, statutSelonNaissance } from "@/lib/statuts";
import { FormCreerJoueuse } from "@/components/membres/FormCreerJoueuse";
import { ImportJoueurs } from "@/components/membres/ImportJoueurs";
import { FormInviterJoueuse } from "@/components/membres/FormInviterJoueuse";
import { bouton } from "@/components/ui/boutons";

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
  searchParams: Promise<{ q?: string; sport?: string; equipe?: string; statut?: string; id?: string }>;
}) {
  const { q = "", sport: sportUrl = "", equipe = "", statut = "", id = "" } = await searchParams;
  // Sport de gestion mémorisé (Tous / Softball / Baseball) quand aucun filtre de sport n'est demandé dans l'adresse.
  const sportMemorise = await sportAdmin();
  const sport = sportUrl || sportMemorise;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user!.id).single();
  if (profile?.role !== "admin") redirect("/membres");

  const { data: teamsBrut } = await supabase.from("teams").select("id, name, sport").eq("archived", false);
  const sportsJoueuses = await chargerSportsJoueuses();
  const groupes = await chargerGroupes(); // les groupes se gèrent dans leur propre page (Équipes) : ils ne comptent pas dans les équipes d'une joueuse
  const teams = trierEquipes(teamsBrut).filter((t) => !groupes.has(t.id));

  const { data: membershipsBrut } = await supabase
    .from("team_members")
    .select("id, team_id, profile_id, status_id, profiles (full_name, email), teams!inner (name, sport)")
    .eq("role_in_team", "athlete")
    .eq("teams.archived", false);

  const memberships = (membershipsBrut ?? []).filter((m) => !groupes.has(m.team_id));

  // Toutes les joueuses inscrites à la plateforme, avec ou sans équipe.
  const { data: tousProfils } = await supabase.from("profiles").select("id, full_name, email").eq("role", "member");

  const profileIds = [...new Set([...(memberships ?? []).map((m) => m.profile_id), ...(tousProfils ?? []).map((p) => p.id)])];
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

  (tousProfils ?? []).forEach((p) => {
    if (!parJoueur.has(p.id)) {
      parJoueur.set(p.id, {
        nom: p.full_name ?? "—",
        email: p.email ?? "",
        naissance: naissanceParProfil.get(p.id) ?? null,
        memberships: [],
      });
    }
  });

  const archivees = await chargerArchivees();
  const tousLiens = await chargerTousLiens();
  const statutsJoueuses = await chargerStatutsJoueuses();
  const numeros = await chargerNumeros();
  const infosRoster = await chargerInfosRoster();
  const fichesJoueuses = await toutesPresentations();
  // Valeur affichée : la fiche de la joueuse d'abord (ce que la famille a pu modifier), sinon l'ancienne saisie de la Direction.
  const infoDe = (id: string, k: "ville" | "grad" | "taille" | "ecole") => fichesJoueuses[id]?.profil?.[k] || infosRoster[id]?.[k] || "";
  const tousLesJoueurs = Array.from(parJoueur.entries()).sort((a, b) => a[1].nom.localeCompare(b[1].nom));
  const nbArchivees = tousLesJoueurs.filter(([pid]) => archivees.has(pid)).length;

  const recherche = normaliser(q.trim());
  const joueurs = tousLesJoueurs.filter(([pid, j]) => {
    if (id) return pid === id;
    if (recherche && !normaliser(j.nom).includes(recherche) && !normaliser(j.email).includes(recherche)) return false;
    if (equipe === "archivees") return archivees.has(pid);
    if (archivees.has(pid)) return false;
    // Statut : toujours celui du joueur (même sans équipe), pas celui d'une équipe.
    if (statut && String(statutEffectif(pid, statutsJoueuses, j.memberships.map((m) => m.status_id))) !== statut) return false;
    if (equipe === "aucune") return j.memberships.length === 0;
    if (statut && !sport && (!equipe || equipe === "aucune")) {
      return String(statutEffectif(pid, statutsJoueuses, j.memberships.map((m) => m.status_id))) === statut;
    }
    if (!sportUrl && sportMemorise && j.memberships.length === 0 && !sportsJoueuses[pid] && !equipe) return true; // sans équipe : sport pas encore décidé
    if (!sport && !equipe && !statut) return true;
    if (sport && sportsJoueuses[pid]) return sportsJoueuses[pid] === sport && (!equipe || j.memberships.some((m) => m.team_id === equipe));
    return j.memberships.some((m) => {
      const t = Array.isArray(m.teams) ? m.teams[0] : m.teams;
      return (
        (!sport || t?.sport === sport) &&
        (!equipe || m.team_id === equipe)
      );
    });
  });
  const filtreActif = Boolean(q || sport || equipe || statut || id);

  const nomStatut = (sid: number) => STATUTS.find((s) => s.id === sid)?.nom ?? "—";
  const initiales = (nom: string) =>
    nom
      .split(/\s+/)
      .filter((x) => x && x !== "—")
      .slice(0, 2)
      .map((x) => x[0]?.toUpperCase())
      .join("") || "?";
  const lienFiltre = (changements: Record<string, string>) => {
    const params = new URLSearchParams({ q, sport: sportUrl, equipe, statut, ...changements });
    for (const [k, v] of [...params.entries()]) if (!v) params.delete(k);
    const chaine = params.toString();
    return chaine ? `/membres/admin/joueurs?${chaine}` : "/membres/admin/joueurs";
  };
  const champ = "w-full rounded-xl border border-rof-ligne bg-rof-craie px-3 py-2.5 text-sm text-rof-texte";
  const detail = id ? joueurs[0] : null;

  /* ───────────── Fiche d'un joueur ───────────── */
  if (id) {
    if (!detail) {
      return (
        <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-5 py-6">
          <Link href="/membres/admin/joueurs" className={`${bouton("neutre", "md")} self-start`}>
            ‹ Liste des joueurs
          </Link>
          <p className="text-sm text-rof-gris">Ce joueur est introuvable.</p>
        </main>
      );
    }
    const [profileId, j] = detail;
    const equipesActuelles = new Set(j.memberships.map((m) => m.team_id));
    // Une joueuse de softball n'est jamais proposée pour une équipe de baseball, et inversement.
    const sportsDeSesEquipes = j.memberships.map((m) => (Array.isArray(m.teams) ? m.teams[0] : m.teams)?.sport ?? "").filter(Boolean);
    const sportDeLaJoueuse = sportEffectif(profileId, sportsJoueuses, sportsDeSesEquipes);
    const equipesDisponibles = (teams ?? []).filter((t) => !equipesActuelles.has(t.id) && (!sportDeLaJoueuse || t.sport === sportDeLaJoueuse));
    const actuel = statutEffectif(profileId, statutsJoueuses, j.memberships.map((m) => m.status_id));
    const archivee = archivees.has(profileId);

    return (
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-5 py-6">
        <Link href="/membres/admin/joueurs" className={`${bouton("neutre", "md")} self-start`}>
          ‹ Liste des joueurs
        </Link>

        <section className="rounded-2xl border border-rof-ligne bg-rof-blanc p-4">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-2 border-rof-or bg-rof-royal-sombre font-condensed text-2xl font-bold text-rof-poudre">
              {initiales(j.nom)}
            </div>
            <div className="min-w-0">
              <h1 className="font-condensed text-3xl font-bold uppercase leading-none text-rof-texte">{j.nom}</h1>
              <p className="mt-1 text-sm text-rof-gris">
                {j.naissance ? `Né(e) le ${new Date(j.naissance + "T12:00:00").toLocaleDateString("fr-CA")}` : "Date de naissance non fournie"}
              </p>
              {j.email && <p className="truncate text-sm text-rof-gris">{j.email}</p>}
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Pastille ton="or">{nomStatut(actuel)}</Pastille>
            {sportDeLaJoueuse && <Pastille>{sportDeLaJoueuse === "baseball" ? "Baseball" : "Softball"}</Pastille>}
            {archivee && <Pastille ton="rouge">Archivé(e)</Pastille>}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <Link href={`/membres/admin/joueurs/${profileId}`} className={`${bouton("accent", "md")} w-full`}>
              Voir son profil
            </Link>
            <form action={archiverJoueuse}>
              <input type="hidden" name="profile_id" value={profileId} />
              <input type="hidden" name="archiver" value={archivee ? "0" : "1"} />
              <button type="submit" className={`${bouton(archivee ? "succes" : "neutre", "md")} w-full`}>
                {archivee ? "Désarchiver" : "Archiver"}
              </button>
            </form>
          </div>
        </section>

        <Section titre="Statut" resume={nomStatut(actuel)} ouvert>
            <form action={changerStatutJoueuse} className="mt-2 flex flex-wrap items-center gap-2">
              <input type="hidden" name="profile_id" value={profileId} />
              <select
                name="status_id"
                defaultValue={statutEffectif(profileId, statutsJoueuses, j.memberships.map((m) => m.status_id))}
                className="rounded-xl border border-rof-ligne bg-rof-craie px-3 py-2 text-sm text-rof-texte"
              >
                {STATUTS.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.nom}
                  </option>
                ))}
              </select>
              <button type="submit" className={bouton("primaire", "sm")}>
                Enregistrer le statut
              </button>
            </form>
            {(() => {
              const suggere = statutSelonNaissance(j.naissance, sportPourAge(profileId, sportsJoueuses, j.memberships.map((m) => (Array.isArray(m.teams) ? m.teams[0] : m.teams)?.sport ?? "")));
              const actuel = statutEffectif(profileId, statutsJoueuses, j.memberships.map((m) => m.status_id));
              if (!suggere) return <p className="mt-1 text-xs text-rof-rouge">Date de naissance manquante : impossible de calculer le statut selon l&apos;âge.</p>;
              return (
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-rof-gris">
                  <span>
                    Selon son âge au {suggere.ref.toLocaleDateString("fr-CA", { day: "numeric", month: "long", year: "numeric" })} ({suggere.age} ans, charte {suggere.charte}) : <strong className="text-rof-texte">{suggere.nom}</strong>
                  </span>
                  {suggere.id !== actuel && (
                    <form action={changerStatutJoueuse}>
                      <input type="hidden" name="profile_id" value={profileId} />
                      <input type="hidden" name="status_id" value={suggere.id} />
                      <button type="submit" className={bouton("secondaire")}>
                        {actuel === 1 ? "Accepter la joueuse" : "Appliquer"} → {suggere.nom}
                      </button>
                    </form>
                  )}
                </div>
              );
            })()}
            <p className="mt-1 text-xs text-rof-gris">Le statut s&apos;applique à toutes ses équipes, et même si elle n&apos;a pas d&apos;équipe.</p>
        </Section>

        <Section titre="Équipes et groupes" resume={j.memberships.length ? `${j.memberships.length} équipe(s)` : "Aucune équipe"} ouvert>
            {j.memberships.length === 0 && <p className="mt-2 text-sm text-rof-gris">Aucune équipe pour le moment.</p>}

            <div className="mt-2 flex flex-col gap-2">
              {j.memberships.map((m) => {
                const team = Array.isArray(m.teams) ? m.teams[0] : m.teams;
                return (
                  <div key={m.id} className="rounded-lg bg-rof-craie p-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-condensed text-sm font-bold uppercase text-rof-poudre">{team?.name ?? "—"}</span>
                      <form action={retirerDeEquipe}>
                        <input type="hidden" name="team_member_id" value={m.id} />
                        <button type="submit" className={bouton("danger")}>
                          Retirer
                        </button>
                      </form>
                    </div>

                    {equipesDisponibles.length > 0 && (
                      <form action={deplacerVersEquipe} className="mt-2 flex items-center gap-1">
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
                        <button type="submit" className={bouton("secondaire")}>
                          Déplacer vers
                        </button>
                      </form>
                    )}
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
                <button type="submit" className={bouton("succes")}>
                  + Ajouter à une équipe
                </button>
              </form>
            )}
        </Section>

        <Section titre="Fiche d'inscription" resume="Naissance, positions, parent, santé, réseaux">
            {(() => {
              const f = ficheParProfil.get(profileId);
              const c = champ;
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
                  <div>
                    <p className={e}>Positions (jusqu&apos;à 3)</p>
                    <div className="grid grid-cols-3 gap-2">
                      {["position", "position2", "position3"].map((nom, n) => (
                        <input key={nom} name={nom} defaultValue={(f?.position ?? "").split(",")[n]?.trim() ?? ""} className={c} />
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
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
                  {(["instagram", "youtube", "x"] as const).map((r) => (
                    <div key={r}>
                      <p className={e}>{r === "x" ? "X" : r === "youtube" ? "YouTube" : "Instagram"}</p>
                      <input name={r} defaultValue={tousLiens[profileId]?.[r] ?? ""} placeholder="https://… ou @nom" className={c} />
                    </div>
                  ))}
                  <label className="flex items-center gap-2 text-sm text-rof-texte">
                    <input type="checkbox" name="photo_consent" defaultChecked={f?.photo_consent ?? false} /> Consentement photo / vidéo
                  </label>
                  <button
                    type="submit"
                    className={bouton("primaire", "md")}
                  >
                    Enregistrer
                  </button>
                </form>
              );
            })()}
        </Section>

        <Section titre="Site public" resume="Sport, numéro, ville, grad, taille, école">
          <div className="flex flex-col gap-3">
            <form action={changerSportJoueuse} className="mt-2 flex flex-wrap items-center gap-2 text-sm">
              <input type="hidden" name="profile_id" value={profileId} />
              <label htmlFor={`sport-${profileId}`} className="text-rof-gris">
                Sport
              </label>
              <select
                id={`sport-${profileId}`}
                name="sport"
                defaultValue={sportsJoueuses[profileId] ?? ""}
                className="rounded-lg border border-rof-ligne bg-rof-craie px-2 py-1 text-rof-texte"
              >
                <option value="">Selon ses équipes</option>
                <option value="softball">Softball</option>
                <option value="baseball">Baseball</option>
              </select>
              <button type="submit" className={bouton("secondaire")}>
                Enregistrer
              </button>
            </form>
            <form action={changerNumeroJoueuse} className="mt-2 flex flex-wrap items-center gap-2 text-sm">
              <input type="hidden" name="profile_id" value={profileId} />
              <label htmlFor={`numero-${profileId}`} className="text-rof-gris">
                N° de chandail
              </label>
              <input
                id={`numero-${profileId}`}
                name="numero"
                inputMode="numeric"
                maxLength={2}
                defaultValue={numeros[profileId] ?? ""}
                className="w-16 rounded-lg border border-rof-ligne bg-rof-craie px-2 py-1 text-rof-texte"
              />
              <button type="submit" className={bouton("secondaire")}>
                Enregistrer
              </button>
            </form>

            <form action={changerInfosRoster} className="mt-2 flex flex-wrap items-center gap-2 text-sm">
              <input type="hidden" name="profile_id" value={profileId} />
              <label htmlFor={`ville-${profileId}`} className="text-rof-gris">
                Ville (site public)
              </label>
              <input
                id={`ville-${profileId}`}
                name="ville"
                maxLength={60}
                defaultValue={infoDe(profileId, "ville")}
                className="w-44 rounded-lg border border-rof-ligne bg-rof-craie px-2 py-1 text-rof-texte"
              />
              <label htmlFor={`grad-${profileId}`} className="text-rof-gris">
                Grad
              </label>
              <input
                id={`grad-${profileId}`}
                name="grad"
                inputMode="numeric"
                maxLength={4}
                placeholder="2027"
                defaultValue={infoDe(profileId, "grad")}
                className="w-20 rounded-lg border border-rof-ligne bg-rof-craie px-2 py-1 text-rof-texte"
              />
              <label htmlFor={`taille-${profileId}`} className="text-rof-gris">
                Taille
              </label>
              <input
                id={`taille-${profileId}`}
                name="taille"
                maxLength={12}
                placeholder={"5'6\""}
                defaultValue={infoDe(profileId, "taille")}
                className="w-20 rounded-lg border border-rof-ligne bg-rof-craie px-2 py-1 text-rof-texte"
              />
              <label htmlFor={`ecole-${profileId}`} className="text-rof-gris">
                École
              </label>
              <input
                id={`ecole-${profileId}`}
                name="ecole"
                maxLength={80}
                defaultValue={infoDe(profileId, "ecole")}
                className="w-44 rounded-lg border border-rof-ligne bg-rof-craie px-2 py-1 text-rof-texte"
              />
              <button type="submit" className={bouton("secondaire")}>
                Enregistrer
              </button>
            </form>

          </div>
        </Section>

        <Section titre="Photo" resume="Photo de profil du roster">
          <FormPhotoJoueuse profileId={profileId} />
        </Section>
      </main>
    );
  }

  /* ───────────── Liste ───────────── */
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-5 px-5 py-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-condensed text-sm uppercase tracking-[0.3em] text-rof-poudre">Direction</p>
          <h1 className="mt-1 font-condensed text-3xl font-bold uppercase text-rof-texte">Joueurs</h1>
        </div>
        <SelecteurSportAdmin actif={sportMemorise} retour="/membres/admin/joueurs" />
      </div>

      <details className="group rounded-2xl border border-rof-ligne bg-rof-blanc">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4 [&::-webkit-details-marker]:hidden">
          <span className={bouton("primaire", "md")}>+ Ajouter des joueurs</span>
          <span className="text-sm text-rof-gris">Créer, inviter ou importer</span>
        </summary>
        <div className="flex flex-col gap-3 border-t border-rof-ligne p-4">
          <FormCreerJoueuse equipes={teams ?? []} statuts={STATUTS} />
          <FormInviterJoueuse equipes={teams ?? []} />
          <ImportJoueurs />
        </div>
      </details>

      <form method="get" className="flex flex-col gap-3">
        <div className="flex gap-2">
          <input
            name="q"
            defaultValue={q}
            placeholder="Rechercher un nom ou un courriel…"
            className="min-w-0 flex-1 rounded-full border border-rof-ligne bg-rof-blanc px-4 py-2.5 text-rof-texte placeholder:text-rof-gris/60"
          />
          {sportUrl && <input type="hidden" name="sport" value={sportUrl} />}
          {equipe && <input type="hidden" name="equipe" value={equipe} />}
          {statut && <input type="hidden" name="statut" value={statut} />}
          <button type="submit" className={bouton("primaire", "md")}>
            Chercher
          </button>
        </div>
      </form>

      <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
        {[
          { label: "Tous", href: lienFiltre({ equipe: "", statut: "" }), actif: !equipe && !statut },
          { label: "Prospects", href: lienFiltre({ statut: "1", equipe: "" }), actif: statut === "1" },
          { label: "Sans équipe", href: lienFiltre({ equipe: "aucune", statut: "" }), actif: equipe === "aucune" },
          { label: `Archivés (${nbArchivees})`, href: lienFiltre({ equipe: "archivees", statut: "" }), actif: equipe === "archivees" },
        ].map((c) => (
          <Link key={c.label} href={c.href} className={`${bouton(c.actif ? "primaire" : "neutre")} shrink-0`}>
            {c.label}
          </Link>
        ))}
      </div>

      <form method="get" className="grid grid-cols-2 gap-2">
        {q && <input type="hidden" name="q" value={q} />}
        {sportUrl && <input type="hidden" name="sport" value={sportUrl} />}
        <select name="equipe" defaultValue={equipe === "aucune" || equipe === "archivees" ? "" : equipe} className={champ}>
          <option value="">Toutes les équipes</option>
          {(teams ?? []).map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
        <select name="statut" defaultValue={statut} className={champ}>
          <option value="">Tous les statuts</option>
          {STATUTS.map((s) => (
            <option key={s.id} value={s.id}>
              {s.nom}
            </option>
          ))}
        </select>
        <button type="submit" className={`${bouton("secondaire", "md")} col-span-2`}>
          Appliquer les filtres
        </button>
      </form>

      <div className="flex items-center justify-between">
        <span className="text-sm text-rof-gris">
          {joueurs.length} / {tousLesJoueurs.length - nbArchivees} joueur{tousLesJoueurs.length - nbArchivees > 1 ? "s" : ""}
        </span>
        {filtreActif && (
          <Link href="/membres/admin/joueurs" className={bouton("neutre")}>
            Effacer les filtres
          </Link>
        )}
      </div>

      <ul className="flex flex-col gap-2">
        {joueurs.map(([profileId, j]) => {
          const actuel = statutEffectif(profileId, statutsJoueuses, j.memberships.map((m) => m.status_id));
          const noms = j.memberships.map((m) => (Array.isArray(m.teams) ? m.teams[0] : m.teams)?.name).filter(Boolean) as string[];
          const suggere = statutSelonNaissance(j.naissance, sportPourAge(profileId, sportsJoueuses, j.memberships.map((m) => (Array.isArray(m.teams) ? m.teams[0] : m.teams)?.sport ?? "")));
          const aCorriger = actuel > 1 && suggere && suggere.id !== actuel;
          return (
            <li key={profileId}>
              <Link
                href={`/membres/admin/joueurs?id=${profileId}`}
                className="flex items-center gap-3 rounded-2xl border border-rof-ligne bg-rof-blanc p-3 transition-colors hover:border-rof-or active:scale-[0.99]"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-rof-royal-sombre font-condensed text-lg font-bold text-rof-poudre">
                  {initiales(j.nom)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold text-rof-texte">{j.nom}</span>
                  <span className="mt-1 flex flex-wrap gap-1">
                    <Pastille ton={actuel === 1 ? "bleu" : "or"}>{nomStatut(actuel)}</Pastille>
                    {noms.slice(0, 2).map((n) => (
                      <Pastille key={n}>{n}</Pastille>
                    ))}
                    {noms.length > 2 && <Pastille>+{noms.length - 2}</Pastille>}
                    {!j.naissance && <Pastille ton="rouge">Date manquante</Pastille>}
                    {aCorriger && <Pastille ton="rouge">→ {suggere!.nom}</Pastille>}
                    {archivees.has(profileId) && <Pastille ton="rouge">Archivé(e)</Pastille>}
                  </span>
                </span>
                <span className="shrink-0 text-xl text-rof-poudre" aria-hidden="true">
                  ›
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
      {joueurs.length === 0 && (
        <p className="text-sm text-rof-gris">{filtreActif ? "Aucun joueur ne correspond à ces filtres." : "Aucun joueur pour le moment."}</p>
      )}
    </main>
  );
}

function Pastille({ children, ton = "gris" }: { children: React.ReactNode; ton?: "gris" | "or" | "bleu" | "rouge" }) {
  const couleurs = {
    gris: "border-rof-ligne bg-rof-craie text-rof-gris",
    or: "border-rof-or/50 bg-rof-or/15 text-rof-or",
    bleu: "border-rof-poudre/50 bg-rof-royal-sombre text-rof-poudre",
    rouge: "border-rof-rouge/50 bg-rof-rouge/10 text-rof-rouge",
  };
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 font-condensed text-xs font-bold uppercase tracking-wide ${couleurs[ton]}`}>
      {children}
    </span>
  );
}

function Section({ titre, resume, ouvert = false, children }: { titre: string; resume: string; ouvert?: boolean; children: React.ReactNode }) {
  return (
    <details open={ouvert} className="group rounded-2xl border border-rof-ligne bg-rof-blanc">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4 [&::-webkit-details-marker]:hidden">
        <span className="min-w-0">
          <span className="block font-condensed text-lg font-bold uppercase text-rof-texte">{titre}</span>
          <span className="block truncate text-xs text-rof-gris">{resume}</span>
        </span>
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-rof-ligne text-rof-poudre transition-transform group-open:rotate-180" aria-hidden="true">
          ⌄
        </span>
      </summary>
      <div className="border-t border-rof-ligne p-4">{children}</div>
    </details>
  );
}
