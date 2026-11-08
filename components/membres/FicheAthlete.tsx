import Link from "next/link";
import type { SupabaseClient } from "@supabase/supabase-js";
import { PARCOURS } from "@/lib/parcours/calcul";
import { modifierMaFiche } from "@/app/membres/moi/actions";
import type { Dictionnaire } from "@/lib/i18n/dictionaries";
import { urlPhotoProfil } from "@/lib/photo-profil";
import { FormPhotoProfil } from "@/components/membres/FormPhotoProfil";

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
}: {
  client: SupabaseClient;
  profileId: string;
  t: Dictionnaire;
  locale: string;
  mode: "moi" | "staff";
}) {
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

  const photoUrl = await urlPhotoProfil(profileId);
  const nom = profile?.full_name || profile?.email || "";
  const initiales = nom
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((x: string) => x[0]?.toUpperCase())
    .join("");

  const bilan = (bilans ?? [])[0] ?? null;
  const resultat = (bilan?.resultat ?? {}) as Resultat;
  const finSecondaire = (bilan?.reponses as { fin?: number } | null)?.fin;
  const candidats = (resultat.candidats ?? [])
    .map((k) => {
      const calc = resultat.parcours?.find((p) => p.k === k);
      const def = PARCOURS.find((p) => p.k === k);
      return calc && def ? { ...calc, nom: def.n } : null;
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

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
        {mode === "moi" && (
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
            {mode === "moi" && (
              <Link href="/membres/parcours" className="mt-3 inline-block text-sm text-rof-poudre underline">
                {f.refaire}
              </Link>
            )}
          </>
        ) : mode === "moi" ? (
          <>
            <p className="mt-1 text-sm text-rof-gris">{f.aucunParcours}</p>
            <Link
              href="/membres/parcours"
              className="mt-3 inline-block rounded-full bg-rof-or px-4 py-2 font-condensed text-sm font-bold uppercase tracking-wide text-black"
            >
              {f.faireParcours}
            </Link>
          </>
        ) : (
          <p className="mt-1 text-sm text-rof-gris">{f.nonRenseigne}</p>
        )}
      </section>

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
          <a href={fiche.fieldlevel_url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-sm text-rof-poudre underline">
            {f.voirFieldLevel} ↗
          </a>
        ) : (
          <p className="mt-1 text-sm text-rof-gris">{mode === "moi" ? f.aucunFieldLevel : f.nonRenseigne}</p>
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
            <summary className="cursor-pointer text-sm text-rof-poudre underline">
              {f.afficher} — {f.notesMedicales.toLowerCase()}
            </summary>
            <p className="mt-2 whitespace-pre-line rounded-lg border border-rof-ligne bg-rof-craie p-3 text-sm text-rof-texte">{notes}</p>
          </details>
        )}
      </section>

      {mode === "moi" && (
        <details className={carte}>
          <summary className="cursor-pointer font-condensed text-sm font-bold uppercase tracking-wide text-rof-poudre">{f.modifier}</summary>
          <form action={modifierMaFiche} className="mt-3 flex flex-col gap-3">
            <label className="flex flex-col gap-1 text-xs text-rof-gris">
              {f.position}
              <input name="position" list="positions" defaultValue={fiche?.position ?? ""} maxLength={40} className={champ} />
              <datalist id="positions">
                {["Lanceuse", "Receveuse", "Avant-champ", "Voltigeuse", "Polyvalente", "Lanceur", "Receveur", "Voltigeur"].map((p) => (
                  <option key={p} value={p} />
                ))}
              </datalist>
            </label>
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
            <button type="submit" className="self-start rounded-full bg-rof-royal px-5 py-2 font-condensed text-sm font-bold uppercase tracking-wide text-white">
              {f.enregistrer}
            </button>
          </form>
        </details>
      )}
    </>
  );
}
