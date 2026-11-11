import Link from "next/link";
import type { SupabaseClient } from "@supabase/supabase-js";
import { PARCOURS, calculer, etapes as calculerEtapes } from "@/lib/parcours/calcul";
import { PlanParcours } from "@/components/membres/PlanParcours";
import { modifierMaFiche } from "@/app/membres/moi/actions";
import type { Dictionnaire } from "@/lib/i18n/dictionaries";
import { urlPhotoProfil } from "@/lib/photo-profil";
import { liensDe } from "@/lib/liens-sociaux";
import { parcoursOuvert } from "@/lib/statuts";
import { presentationDe } from "@/lib/presentation";
import { CartePresentation } from "@/components/membres/CartePresentation";
import { FormPhotoProfil } from "@/components/membres/FormPhotoProfil";
import { bouton } from "@/components/ui/boutons";

type Resultat = {
  repere?: number;
  candidats?: string[];
  parcours?: { k: string; entree: number; saisons: [number, number]; marge: number }[];
  alertes?: string[];
};

function dateLocale() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Toronto" }).format(new Date());
}

function age(naissance: string) {
  const [y, m, d] = naissance.split("-").map(Number);
  const now = new Date();
  let a = now.getFullYear() - y;
  if (now.getMonth() + 1 < m || (now.getMonth() + 1 === m && now.getDate() < d)) a--;
  return a;
}

const titreSection = "font-condensed text-xs font-bold uppercase tracking-[0.2em]";
const carte = "rounded-xl border border-rof-ligne bg-rof-blanc p-4";
const champ = "w-full rounded-lg border border-rof-ligne bg-rof-craie px-3 py-2 text-sm text-rof-texte";

/**
 * Fiche athlète. `client` doit déjà être autorisé à lire ce profil :
 * client de l'utilisateur pour sa propre fiche, client admin après vérification pour un coach.
 */
export async function FicheAthlete({
  client,
  profileId,
  t,
  locale,
  mode,
  apercu = false,
}: {
  client: SupabaseClient;
  profileId: string;
  t: Dictionnaire;
  locale: string;
  mode: "moi" | "staff";
  /** Direction : voir la fiche exactement comme la joueuse la voit, en lecture seule (aucun formulaire actif). */
  apercu?: boolean;
}) {
  const vue = mode === "moi" || apercu; // contenu tel que la joueuse le voit
  const editable = mode === "moi" && !apercu; // formulaires actifs
  const f = t.fiche;
  const loc = locale === "en" ? "en-CA" : "fr-CA";

  const [{ data: profile }, { data: fiche }, { data: memberships }, { data: bilans }] = await Promise.all([
    client.from("profiles").select("full_name, email").eq("id", profileId).single(),
    client
      .from("athlete_details")
      .select("birth_date, position, throws, bats, guardian_name, guardian_phone, guardian_email, medical_notes, photo_consent, fieldlevel_url")
      .eq("profile_id", profileId)
      .maybeSingle(),
    client
      .from("team_members")
      .select("team_id, role_in_team, teams!inner (name, sport)")
      .eq("profile_id", profileId)
      .eq("teams.archived", false),
    client
      .from("parcours_demandes")
      .select("created_at, reponses, resultat")
      .eq("profile_id", profileId)
      .order("created_at", { ascending: false })
      .limit(1),
  ]);

  const equipes = (memberships ?? []).map((m) => ({
    ...m,
    team: (Array.isArray(m.teams) ? m.teams[0] : m.teams) as { name: string; sport: string } | null,
  }));
  const equipesAthlete = equipes.filter((e) => e.role_in_team === "athlete");

  let stats = { total: 0, oui: 0, non: 0 };
  if (equipesAthlete.length) {
    const { data: passes } = await client
      .from("contents")
      .select("id")
      .in("team_id", equipesAthlete.map((e) => e.team_id))
      .eq("kind", "agenda")
      .lt("event_date", dateLocale());
    const ids = (passes ?? []).map((p) => p.id);
    if (ids.length) {
      const { data: reps } = await client.from("attendance").select("response").eq("profile_id", profileId).in("content_id", ids);
      stats = {
        total: ids.length,
        oui: (reps ?? []).filter((r) => r.response === "yes").length,
        non: (reps ?? []).filter((r) => r.response === "no").length,
      };
    }
  }

  const ouvert = vue ? await parcoursOuvert(profileId) : true; // parcours réservé aux joueuses non Prospect
  const [photoUrl, liens, presentation] = await Promise.all([
    urlPhotoProfil(profileId),
    liensDe(profileId),
    vue ? presentationDe(profileId) : Promise.resolve(null),
  ]);
  const nom = profile?.full_name || profile?.email || "";
  const initiales = nom
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((x: string) => x[0]?.toUpperCase())
    .join("");

  const bilan = ouvert ? ((bilans ?? [])[0] ?? null) : null;
  const resultat = (bilan?.resultat ?? {}) as Resultat;
  const finSecondaire = (bilan?.reponses as { fin?: number } | null)?.fin;
  const candidats = (resultat.candidats ?? [])
    .map((k) => {
      const calc = resultat.parcours?.find((p) => p.k === k);
      const def = PARCOURS.find((p) => p.k === k);
      return calc && def ? { ...calc, nom: def.n } : null;
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  // Plan d'action : recalculé à chaque visite à partir du dernier questionnaire.
  const reponsesBilan = (bilan?.reponses ?? null) as (Record<string, unknown> & { choix?: string; faites?: string[] }) | null;
  const calc = reponsesBilan ? calculer(reponsesBilan as never, new Date()) : null;
  const choixParcours = reponsesBilan?.choix && PARCOURS.some((p) => p.k === reponsesBilan.choix) ? reponsesBilan.choix : "";
  const planEtapes = calc ? calculerEtapes(calc, choixParcours, new Date(), reponsesBilan?.faites ?? []) : [];

  const details = [
    fiche?.position ? `${f.position} : ${fiche.position}` : null,
    fiche?.throws ? `${f.lance} : ${fiche.throws}` : null,
    fiche?.bats ? `${f.frappe} : ${fiche.bats}` : null,
  ].filter(Boolean);
  const pct = stats.total ? Math.round((stats.oui / stats.total) * 100) : null;
  const notes = fiche?.medical_notes?.trim() ?? "";

  return (
    <>
      <div>
        <p className="font-condensed text-sm uppercase tracking-[0.3em] text-rof-poudre">{f.titre}</p>
        <div className="mt-2 flex items-center gap-3">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-rof-or bg-rof-royal-sombre font-condensed text-2xl font-bold text-rof-poudre">
            {photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photoUrl} alt={nom} className="h-full w-full object-cover" />
            ) : (
              initiales
            )}
          </div>
          <div className="min-w-0">
            <h1 className="font-condensed text-3xl font-bold uppercase leading-none text-rof-texte">{nom}</h1>
            {fiche?.birth_date && (
              <p className="mt-1 text-sm text-rof-gris">
                {f.naissance} : {new Date(fiche.birth_date + "T12:00:00").toLocaleDateString(loc, { day: "numeric", month: "long", year: "numeric" })} ·{" "}
                {age(fiche.birth_date)} {f.ans}
              </p>
            )}
          </div>
        </div>
        {editable && (
          <FormPhotoProfil
            aPhoto={Boolean(photoUrl)}
            libelles={{ changer: f.changerPhoto, ajouter: f.ajouterPhoto, retirer: f.retirerPhoto, illisible: f.photoIllisible }}
          />
        )}
        {equipes.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {equipes.map((e) => (
              <span key={e.team_id} className="rounded-full border border-rof-ligne bg-rof-blanc px-3 py-1 font-condensed text-sm uppercase text-rof-texte">
                {e.team?.name}
              </span>
            ))}
          </div>
        )}
        {details.length > 0 && <p className="mt-2 text-sm text-rof-texte">{details.join(" · ")}</p>}
        {mode === "staff" && <p className="mt-2 text-xs text-rof-gris">{f.fichePrivee}</p>}
      </div>

      <section className={`${carte} border-rof-or`}>
        <p className={`${titreSection} text-rof-or`}>{f.parcours}</p>
        {bilan ? (
          <>
            <p className="mt-1 text-xs text-rof-gris">
              {f.bilanDu} {new Date(bilan.created_at).toLocaleDateString(loc)}
            </p>
            <div className="mt-3 grid grid-cols-2 gap-3">
              {finSecondaire && (
                <div>
                  <p className="text-xs text-rof-gris">{f.finSecondaire}</p>
                  <p className="font-condensed text-2xl font-bold text-rof-texte">{finSecondaire}</p>
                </div>
              )}
              {resultat.repere && (
                <div>
                  <p className="text-xs text-rof-gris">{f.dateRepere}</p>
                  <p className="font-condensed text-2xl font-bold text-rof-texte">
                    {f.automne} {resultat.repere}
                  </p>
                </div>
              )}
            </div>
            <div className="mt-3 flex flex-col gap-2">
              {candidats.map((c) => (
                <div key={c.k} className="rounded-lg border border-rof-ligne bg-rof-craie p-3">
                  <p className="font-condensed text-base font-semibold uppercase text-rof-texte">
                    {c.k} · {c.nom}
                  </p>
                  <p className="text-sm text-rof-gris">
                    {f.entree} : {f.automne} {c.entree} · {c.saisons[0] === c.saisons[1] ? c.saisons[0] : `${c.saisons[0]}–${c.saisons[1]}`} {f.saisons}
                  </p>
                </div>
              ))}
            </div>
            {(resultat.alertes ?? []).length > 0 && (
              <p className="mt-3 text-sm text-rof-rouge">
                {resultat.alertes!.length} {f.alertes}
              </p>
            )}
            {vue && (
              <Link href="/membres/parcours" className={`${bouton("secondaire")} mt-3`}>
                {f.refaire}
              </Link>
            )}
          </>
        ) : vue && !ouvert ? (
          <p className="mt-1 text-sm text-rof-gris">
            {locale === "en"
              ? "The NCAA pathway becomes available once the staff accepts you and your status is no longer Prospect."
              : "Le parcours NCAA sera disponible dès que la Direction t'aura acceptée et que ton statut ne sera plus Prospect."}
          </p>
        ) : vue ? (
          <>
            <p className="mt-1 text-sm text-rof-gris">{f.aucunParcours}</p>
            <Link
              href="/membres/parcours"
              className={`${bouton("primaire", "md")} mt-3`}
            >
              {f.faireParcours}
            </Link>
          </>
        ) : (
          <p className="mt-1 text-sm text-rof-gris">{f.nonRenseigne}</p>
        )}
      </section>

      {vue && calc && (
        <PlanParcours lectureSeule={!editable} choix={choixParcours} parcours={PARCOURS.map((p) => ({ k: p.k, n: p.n }))} etapes={planEtapes} />
      )}

      <section className={carte}>
        <p className={`${titreSection} text-rof-gris`}>{f.presences}</p>
        {stats.total > 0 ? (
          <>
            <p className="mt-1 font-condensed text-4xl font-bold text-rof-poudre">
              {pct} %<span className="ml-2 text-sm font-normal text-rof-gris">{f.surEvenements}</span>
            </p>
            <div className="mt-2 h-2 rounded-full bg-rof-ligne">
              <div className="h-2 rounded-full bg-rof-gazon" style={{ width: `${pct}%` }} />
            </div>
            <p className="mt-2 text-sm text-rof-gris">
              {stats.oui} {f.presentes} · {stats.non} {f.absentes} · {stats.total - stats.oui - stats.non} {f.sansReponse}
            </p>
          </>
        ) : (
          <p className="mt-1 text-sm text-rof-gris">{f.aucunePresence}</p>
        )}
      </section>

      <section className={carte}>
        <p className={`${titreSection} text-rof-gris`}>{f.recrutement}</p>
        {fiche?.fieldlevel_url ? (
          <a href={fiche.fieldlevel_url} target="_blank" rel="noopener noreferrer" className={`${bouton("secondaire")} mt-2`}>
            {f.voirFieldLevel} ↗
          </a>
        ) : (
          <p className="mt-1 text-sm text-rof-gris">{vue ? f.aucunFieldLevel : f.nonRenseigne}</p>
        )}
        {(liens.instagram || liens.youtube || liens.x) && (
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
            {liens.instagram && (
              <a href={liens.instagram} target="_blank" rel="noopener noreferrer nofollow" className={bouton("secondaire")}>
                Instagram ↗
              </a>
            )}
            {liens.youtube && (
              <a href={liens.youtube} target="_blank" rel="noopener noreferrer nofollow" className={bouton("secondaire")}>
                YouTube ↗
              </a>
            )}
            {liens.x && (
              <a href={liens.x} target="_blank" rel="noopener noreferrer nofollow" className={bouton("secondaire")}>
                X ↗
              </a>
            )}
          </div>
        )}
      </section>

      <section className={carte}>
        <p className={`${titreSection} text-rof-gris`}>{f.tuteur}</p>
        <p className="mt-1 text-sm text-rof-texte">{fiche?.guardian_name || f.nonRenseigne}</p>
        <p className="text-sm text-rof-gris">{[fiche?.guardian_phone, fiche?.guardian_email].filter(Boolean).join(" · ") || f.nonRenseigne}</p>
        <p className="mt-2 text-sm text-rof-gris">
          {f.consentementPhoto} : <span className="text-rof-texte">{fiche?.photo_consent ? f.oui : f.non}</span> · {f.notesMedicales} :{" "}
          <span className="text-rof-texte">{notes ? f.auDossier : f.aucune}</span>
        </p>
        {notes && (
          <details className="mt-2">
            <summary className={`${bouton("secondaire")} cursor-pointer list-none w-fit [&::-webkit-details-marker]:hidden`}>
              {f.afficher} — {f.notesMedicales.toLowerCase()}
            </summary>
            <p className="mt-2 whitespace-pre-line rounded-lg border border-rof-ligne bg-rof-craie p-3 text-sm text-rof-texte">{notes}</p>
          </details>
        )}
      </section>

      {vue && <CartePresentation reglages={presentation} lectureSeule={!editable} />}

      {editable && (
        <details className={carte}>
          <summary className="cursor-pointer font-condensed text-sm font-bold uppercase tracking-wide text-rof-poudre">{f.modifier}</summary>
          <form action={modifierMaFiche} className="mt-3 flex flex-col gap-3">
            <div className="flex flex-col gap-1 text-xs text-rof-gris">
              <span>{f.positions}</span>
              {[0, 1, 2].map((n) => (
                <input
                  key={n}
                  name={`position${n + 1}`}
                  list="positions"
                  defaultValue={(fiche?.position ?? "").split(",")[n]?.trim() ?? ""}
                  maxLength={40}
                  placeholder={`${f.position} ${n + 1}`}
                  className={champ}
                />
              ))}
              <datalist id="positions">
                {["Lanceuse", "Receveuse", "Avant-champ", "Voltigeuse", "Polyvalente", "Lanceur", "Receveur", "Voltigeur"].map((p) => (
                  <option key={p} value={p} />
                ))}
              </datalist>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <label className="flex flex-col gap-1 text-xs text-rof-gris">
                {f.lance}
                <input name="throws" defaultValue={fiche?.throws ?? ""} maxLength={10} placeholder="D / G" className={champ} />
              </label>
              <label className="flex flex-col gap-1 text-xs text-rof-gris">
                {f.frappe}
                <input name="bats" defaultValue={fiche?.bats ?? ""} maxLength={10} placeholder="D / G / A" className={champ} />
              </label>
            </div>
            <label className="flex flex-col gap-1 text-xs text-rof-gris">
              {f.lienFieldLevel}
              <input name="fieldlevel_url" type="url" defaultValue={fiche?.fieldlevel_url ?? ""} placeholder="https://www.fieldlevel.com/app/profile/…" className={champ} />
            </label>
            {(["instagram", "youtube", "x"] as const).map((r) => (
              <label key={r} className="flex flex-col gap-1 text-xs text-rof-gris">
                {r === "x" ? "X" : r === "youtube" ? "YouTube" : "Instagram"}
                <input name={r} defaultValue={liens[r]} placeholder="https://… ou @nom" className={champ} />
              </label>
            ))}
            <button type="submit" className={`${bouton("accent", "md")} self-start`}>
              {f.enregistrer}
            </button>
          </form>
        </details>
      )}
    </>
  );
}
