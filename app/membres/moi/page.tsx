import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getDictionnaire } from "@/lib/i18n/server";
import { CarteHub } from "@/components/membres/CarteHub";
import { PARCOURS } from "@/lib/parcours/calcul";
import { modifierMaFiche } from "@/app/membres/moi/actions";

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

export default async function MoiPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const uid = user!.id;
  const { t, locale } = await getDictionnaire();
  const h = t.hubs;
  const f = t.fiche;
  const loc = locale === "en" ? "en-CA" : "fr-CA";

  const [{ data: profile }, { data: fiche }, { data: memberships }, { data: bilans }] = await Promise.all([
    supabase.from("profiles").select("full_name").eq("id", uid).single(),
    supabase
      .from("athlete_details")
      .select("birth_date, position, throws, bats, guardian_name, guardian_phone, guardian_email, medical_notes, photo_consent, fieldlevel_url")
      .eq("profile_id", uid)
      .maybeSingle(),
    supabase
      .from("team_members")
      .select("team_id, role_in_team, teams!inner (name, sport)")
      .eq("profile_id", uid)
      .eq("teams.archived", false),
    supabase
      .from("parcours_demandes")
      .select("created_at, reponses, resultat")
      .eq("profile_id", uid)
      .order("created_at", { ascending: false })
      .limit(1),
  ]);

  const equipes = (memberships ?? []).map((m) => ({
    ...m,
    team: (Array.isArray(m.teams) ? m.teams[0] : m.teams) as { name: string; sport: string } | null,
  }));
  const equipesAthlete = equipes.filter((e) => e.role_in_team === "athlete");
  const estAthlete = equipesAthlete.length > 0;

  // Présences sur les événements passés de ses équipes
  let stats: { total: number; oui: number; non: number } | null = null;
  if (estAthlete) {
    const { data: passes } = await supabase
      .from("contents")
      .select("id")
      .in("team_id", equipesAthlete.map((e) => e.team_id))
      .eq("kind", "agenda")
      .lt("event_date", dateLocale());
    const ids = (passes ?? []).map((p) => p.id);
    if (ids.length) {
      const { data: reps } = await supabase
        .from("attendance")
        .select("response")
        .eq("profile_id", uid)
        .in("content_id", ids);
      stats = {
        total: ids.length,
        oui: (reps ?? []).filter((r) => r.response === "yes").length,
        non: (reps ?? []).filter((r) => r.response === "no").length,
      };
    } else {
      stats = { total: 0, oui: 0, non: 0 };
    }
  }

  const nom = profile?.full_name || user?.email || "";
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

  const pct = stats && stats.total ? Math.round((stats.oui / stats.total) * 100) : null;

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-5 py-8">
      <div>
        <p className="font-condensed text-sm uppercase tracking-[0.3em] text-rof-poudre">{estAthlete ? f.titre : h.moiTitre}</p>
        <div className="mt-2 flex items-center gap-3">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-2 border-rof-or bg-rof-royal-sombre font-condensed text-2xl font-bold text-rof-poudre">
            {initiales}
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
      </div>

      {estAthlete && (
        <>
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
                <Link href="/membres/parcours" className="mt-3 inline-block text-sm text-rof-poudre underline">
                  {f.refaire}
                </Link>
              </>
            ) : (
              <>
                <p className="mt-1 text-sm text-rof-gris">{f.aucunParcours}</p>
                <Link
                  href="/membres/parcours"
                  className="mt-3 inline-block rounded-full bg-rof-or px-4 py-2 font-condensed text-sm font-bold uppercase tracking-wide text-black"
                >
                  {f.faireParcours}
                </Link>
              </>
            )}
          </section>

          <section className={carte}>
            <p className={`${titreSection} text-rof-gris`}>{f.presences}</p>
            {stats && stats.total > 0 ? (
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
              <p className="mt-1 text-sm text-rof-gris">{f.aucunFieldLevel}</p>
            )}
          </section>

          <section className={carte}>
            <p className={`${titreSection} text-rof-gris`}>{f.tuteur}</p>
            <p className="mt-1 text-sm text-rof-texte">{fiche?.guardian_name || f.nonRenseigne}</p>
            <p className="text-sm text-rof-gris">{[fiche?.guardian_phone, fiche?.guardian_email].filter(Boolean).join(" · ") || f.nonRenseigne}</p>
            <p className="mt-2 text-sm text-rof-gris">
              {f.consentementPhoto} : <span className="text-rof-texte">{fiche?.photo_consent ? f.oui : f.non}</span> · {f.notesMedicales} :{" "}
              <span className="text-rof-texte">{fiche?.medical_notes?.trim() ? f.auDossier : f.aucune}</span>
            </p>
          </section>

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
                <input
                  name="fieldlevel_url"
                  type="url"
                  defaultValue={fiche?.fieldlevel_url ?? ""}
                  placeholder="https://www.fieldlevel.com/app/profile/…"
                  className={champ}
                />
              </label>
              <button
                type="submit"
                className="self-start rounded-full bg-rof-royal px-5 py-2 font-condensed text-sm font-bold uppercase tracking-wide text-white"
              >
                {f.enregistrer}
              </button>
            </form>
          </details>
        </>
      )}

      <p className={`${titreSection} mt-2 text-rof-gris`}>{f.autres}</p>
      <div className="flex flex-col gap-3">
        <CarteHub href="/membres/documents" titre={t.nav.documents} description={h.documentsDesc} />
        <CarteHub href="/membres/sondages" titre={t.nav.sondages} description={h.sondagesDesc} />
        {!estAthlete && <CarteHub href="/membres/parcours" titre={t.nav.parcours} description={h.parcoursDesc} />}
        <CarteHub href="/membres/contact" titre={t.nav.contact} description={h.contactDesc} />
      </div>
    </main>
  );
}
