import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { FormAjouterJoueuse } from "@/components/membres/FormAjouterJoueuse";
import { chargerMessagesTous } from "@/lib/messages-tous";
import { chargerSondages } from "@/lib/sondages";
import { getDictionnaire } from "@/lib/i18n/server";
import { marquerComplete, repondre } from "@/app/membres/agenda/actions";
import { chargerStatutsJoueuses } from "@/lib/statuts";
import { bouton as styleBouton } from "@/components/ui/boutons";

type EvenementBody = { type?: string; heure?: string | null; lieu?: string | null; mode?: string | null };

function dateLocale(decalageJours = 0) {
  const d = new Date(Date.now() + decalageJours * 86400000);
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Toronto" }).format(d);
}

export default async function MembresPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase.from("profiles").select("full_name, role").eq("id", user!.id).single();
  const { t, locale } = await getDictionnaire();
  const m2 = t.membres;
  const a = t.accueilJour;
  const estAdmin = profile?.role === "admin";
  if (estAdmin) redirect("/membres/admin"); // l'accueil de la Direction est la page de direction

  const { data: memberships } = await supabase
    .from("team_members")
    .select("team_id, status_id, role_in_team, teams!inner (id, name, sport)")
    .eq("profile_id", user!.id)
    .eq("teams.archived", false);

  const equipes = (memberships ?? []).map((m) => ({
    ...m,
    team: Array.isArray(m.teams) ? m.teams[0] : m.teams,
  }));
  const teamIds = equipes.map((e) => e.team_id);
  const nomEquipe = new Map(equipes.map((e) => [e.team_id, e.team?.name ?? ""]));
  const estAthlete = equipes.some((e) => e.role_in_team === "athlete");

  const aujourdhui = dateLocale(0);
  const demain = dateLocale(1);
  const dansSeptJours = dateLocale(7);

  const { data: aVenir } = teamIds.length
    ? await supabase
        .from("contents")
        .select("id, title, event_date, team_id, body")
        .in("team_id", teamIds)
        .eq("kind", "agenda")
        .gte("event_date", aujourdhui)
        .order("event_date", { ascending: true })
        .limit(20)
    : { data: [] as { id: string; title: string; event_date: string | null; team_id: string; body: unknown }[] };

  const evenementsReguliers = (aVenir ?? []).filter((e) => ((e.body ?? {}) as EvenementBody).mode !== "completer");
  const prochain = evenementsReguliers[0] ?? null;
  const nbSemaine = evenementsReguliers.filter((e) => (e.event_date ?? "") <= dansSeptJours).length;

  let maReponse: "yes" | "no" | null = null;
  if (prochain) {
    const { data: rep } = await supabase
      .from("attendance")
      .select("response")
      .eq("content_id", prochain.id)
      .eq("profile_id", user!.id)
      .maybeSingle();
    maReponse = (rep?.response as "yes" | "no" | undefined) ?? null;
  }

  // À FAIRE : entraînements à compléter (à faire avant leur date, ou en retard depuis moins de 14 jours).
  let tachesPlan: { id: string; title: string; event_date: string; lieu: string; enRetard: boolean }[] = [];
  if (estAthlete && teamIds.length) {
    const { data: plans } = await supabase
      .from("contents")
      .select("id, title, event_date, body")
      .in("team_id", teamIds)
      .eq("kind", "agenda")
      .gte("event_date", dateLocale(-14))
      .lte("event_date", dansSeptJours)
      .order("event_date", { ascending: true })
      .limit(60);
    const aCompleter = (plans ?? []).filter((e) => ((e.body ?? {}) as EvenementBody).mode === "completer");
    const { data: faits } = aCompleter.length
      ? await supabase.from("attendance").select("content_id, response").eq("profile_id", user!.id).in("content_id", aCompleter.map((e) => e.id))
      : { data: [] as { content_id: string; response: string }[] };
    const dejaFaits = new Set((faits ?? []).filter((f) => f.response === "yes").map((f) => f.content_id));
    tachesPlan = aCompleter
      .filter((e) => !dejaFaits.has(e.id))
      .map((e) => ({ id: e.id, title: e.title, event_date: e.event_date ?? "", lieu: ((e.body ?? {}) as EvenementBody).lieu ?? "", enRetard: (e.event_date ?? "") < aujourdhui }));
  }
  let ficheIncomplete = false;
  if (profile?.role === "member") {
    const { data: fiche } = await supabase.from("athlete_details").select("birth_date").eq("profile_id", user!.id).maybeSingle();
    ficheIncomplete = !fiche?.birth_date;
  }

  const sondages = await chargerSondages(user!.id, estAdmin);
  const sondagesAFaire = sondages.filter((s) => !s.closed && !s.monVote && s.maDates.length === 0).length;

  const nbAFaire = sondagesAFaire + tachesPlan.length + (ficheIncomplete ? 1 : 0);

  const messages = await chargerMessagesTous(locale === "en" ? "en" : "fr");
  const statutPropre = (await chargerStatutsJoueuses())[user!.id] ?? 1;
  const aSelection = statutPropre > 1 || equipes.some((m) => m.role_in_team === "athlete" && m.status_id > 1);
  const messagesAffiches = [
    profile?.role === "member" ? (aSelection ? messages.selection : messages.prospect) : "",
    messages.general,
  ].filter((m) => m.trim());

  const body = (prochain?.body ?? {}) as EvenementBody;
  const jourProchain = prochain?.event_date
    ? prochain.event_date === aujourdhui
      ? a.aujourdhui
      : prochain.event_date === demain
        ? a.demain
        : new Date(prochain.event_date + "T12:00:00").toLocaleDateString(locale === "en" ? "en-CA" : "fr-CA", {
            weekday: "long",
            day: "numeric",
            month: "long",
          })
    : "";
  const details = [jourProchain, body.heure, body.lieu].filter(Boolean).join(" · ");

  const bouton = "flex-1 rounded-full px-4 py-2.5 font-condensed text-sm font-bold uppercase tracking-wide";

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-5 py-8">
      <p className="font-condensed text-sm uppercase tracking-[0.3em] text-rof-poudre">{a.kicker}</p>
      <h1 className="mt-1 font-condensed text-3xl font-bold uppercase text-rof-texte">
        {m2.bienvenue}, {profile?.full_name || user?.email}
      </h1>

      {(estAthlete || profile?.role === "member") && (
        <section id="afaire" aria-label={a.aFaire} className="mt-6 rounded-xl border-2 border-rof-or bg-rof-blanc p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="font-condensed text-sm font-bold uppercase tracking-[0.2em] text-rof-or">{a.aFaire}</p>
            <span className={`rounded-full px-3 py-0.5 font-condensed text-sm font-bold ${nbAFaire ? "bg-rof-or text-black" : "bg-rof-gazon/20 text-rof-gazon"}`}>{nbAFaire}</span>
          </div>
          {nbAFaire === 0 && <p className="mt-2 text-sm text-rof-gazon">{locale === "en" ? "All done ✓" : "Tout est fait ✓"}</p>}
          <ul className="mt-3 flex flex-col gap-3">
            {tachesPlan.map((tache) => (
              <li key={tache.id} className="rounded-xl border border-rof-ligne bg-rof-craie p-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-condensed text-lg font-bold uppercase leading-tight text-rof-texte">{tache.title}</p>
                  {tache.enRetard && <span className="shrink-0 rounded-full border border-rof-rouge/60 px-2 py-0.5 font-condensed text-xs font-bold uppercase text-rof-rouge">{locale === "en" ? "Late" : "En retard"}</span>}
                </div>
                <p className="mt-0.5 text-xs text-rof-gris">
                  {tache.lieu}
                  {tache.event_date ? ` · ${locale === "en" ? "by" : "avant le"} ${new Date(tache.event_date + "T12:00:00").toLocaleDateString(locale === "en" ? "en-CA" : "fr-CA", { weekday: "long", day: "numeric", month: "long" })}` : ""}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Link href="/membres/agenda" className={styleBouton("secondaire", "md")}>
                    {locale === "en" ? "See the program" : "Voir le programme"}
                  </Link>
                  <form action={marquerComplete}>
                    <input type="hidden" name="content_id" value={tache.id} />
                    <input type="hidden" name="fait" value="1" />
                    <button type="submit" className={styleBouton("primaire", "md")}>
                      ✓ {locale === "en" ? "I completed it" : "J'ai complété"}
                    </button>
                  </form>
                </div>
              </li>
            ))}
            {sondagesAFaire > 0 && (
              <li>
                <Link href="/membres/sondages" className="flex items-center justify-between gap-3 rounded-xl border border-rof-ligne bg-rof-craie p-3">
                  <span className="font-condensed text-base font-bold uppercase text-rof-texte">
                    {sondagesAFaire} {a.sondagesAFaire}
                  </span>
                  <span className="text-rof-or" aria-hidden>→</span>
                </Link>
              </li>
            )}
            {ficheIncomplete && (
              <li>
                <Link href="/membres/moi" className="flex items-center justify-between gap-3 rounded-xl border border-rof-ligne bg-rof-craie p-3">
                  <span className="font-condensed text-base font-bold uppercase text-rof-texte">{locale === "en" ? "Add my date of birth" : "Ajouter ma date de naissance"}</span>
                  <span className="text-rof-or" aria-hidden>→</span>
                </Link>
              </li>
            )}
          </ul>
        </section>
      )}

      <section className="mt-6 rounded-xl border border-rof-or bg-rof-blanc p-4">
        <p className="font-condensed text-xs font-bold uppercase tracking-[0.2em] text-rof-or">{a.prochain}</p>
        {prochain ? (
          <>
            <p className="mt-1 font-condensed text-2xl font-bold uppercase text-rof-texte">{prochain.title}</p>
            <p className="text-sm text-rof-gris">{details}</p>
            {teamIds.length > 1 && <p className="text-xs text-rof-gris">{nomEquipe.get(prochain.team_id)}</p>}
            {estAthlete && body.mode === "completer" && (
              <div className="mt-4 flex flex-col gap-2">
                <p className={`self-start rounded-full border px-3 py-1 font-condensed text-xs font-bold uppercase tracking-wide ${maReponse === "yes" ? "border-rof-gazon/60 text-rof-gazon" : "border-rof-ligne text-rof-gris"}`}>
                  {maReponse === "yes" ? "✓ Complété" : "Non complété"}
                </p>
                <form action={marquerComplete} className="flex">
                  <input type="hidden" name="content_id" value={prochain.id} />
                  <input type="hidden" name="fait" value={maReponse === "yes" ? "0" : "1"} />
                  <button type="submit" className={`${bouton} ${maReponse === "yes" ? "border border-rof-ligne text-rof-texte" : "bg-rof-or text-black"}`}>
                    {maReponse === "yes" ? "Annuler" : "✓ J'ai complété cet entraînement"}
                  </button>
                </form>
              </div>
            )}
            {estAthlete && body.mode !== "completer" && (
              <div className="mt-4 flex gap-2">
                <form action={repondre} className="flex flex-1">
                  <input type="hidden" name="content_id" value={prochain.id} />
                  <input type="hidden" name="response" value="yes" />
                  <button
                    type="submit"
                    aria-pressed={maReponse === "yes"}
                    className={`${bouton} ${maReponse === "yes" ? "bg-rof-gazon text-black" : "border border-rof-ligne text-rof-texte"}`}
                  >
                    {maReponse === "yes" ? "✓ " : ""}
                    {a.present}
                  </button>
                </form>
                <form action={repondre} className="flex flex-1">
                  <input type="hidden" name="content_id" value={prochain.id} />
                  <input type="hidden" name="response" value="no" />
                  <button
                    type="submit"
                    aria-pressed={maReponse === "no"}
                    className={`${bouton} ${maReponse === "no" ? "bg-rof-rouge text-white" : "border border-rof-ligne text-rof-texte"}`}
                  >
                    {maReponse === "no" ? "✓ " : ""}
                    {a.absent}
                  </button>
                </form>
              </div>
            )}
            <Link href="/membres/agenda" className={`${styleBouton("secondaire")} mt-3`}>
              {a.voirAgenda}
            </Link>
          </>
        ) : (
          <p className="mt-1 text-sm text-rof-gris">{a.aucun}</p>
        )}
      </section>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <Link href="#afaire" className="rounded-xl border border-rof-ligne bg-rof-blanc p-4">
          <p className="font-condensed text-xs font-bold uppercase tracking-[0.2em] text-rof-gris">{a.aFaire}</p>
          <p className={`font-condensed text-3xl font-bold ${nbAFaire ? "text-rof-rouge" : "text-rof-gazon"}`}>
            {nbAFaire}
          </p>
          <p className="text-xs text-rof-gris">
            {nbAFaire
              ? `${nbAFaire} ${locale === "en" ? "task" : "tâche"}${nbAFaire > 1 ? "s" : ""}`
              : a.toutEstFait}
          </p>
        </Link>
        <Link href="/membres/agenda" className="rounded-xl border border-rof-ligne bg-rof-blanc p-4">
          <p className="font-condensed text-xs font-bold uppercase tracking-[0.2em] text-rof-gris">{a.semaine}</p>
          <p className="font-condensed text-3xl font-bold text-rof-poudre">{nbSemaine}</p>
          <p className="text-xs text-rof-gris">{a.evenements}</p>
        </Link>
      </div>

      <section className="mt-6">
        <p className="font-condensed text-xs font-bold uppercase tracking-[0.2em] text-rof-gris">{a.acces}</p>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {[
            { href: "/membres/agenda", label: t.nav.agenda, icone: "M4 6h16v14H4zM4 10h16M8 3v4M16 3v4" },
            { href: "/membres/documents", label: t.nav.documents, icone: "M7 3h7l5 5v13H7zM14 3v5h5M10 13h6M10 17h6" },
            { href: "/membres/sondages", label: t.nav.sondages, icone: "M5 20V10M12 20V4M19 20v-7" },
            { href: "/membres/parcours", label: t.nav.parcours, icone: "M4 19h16M6 15l4-4 3 3 5-6" },
            { href: "/membres/messages", label: t.nav.messages, icone: "M4 5h16v11H9l-5 4z" },
            { href: "/membres/contact", label: t.nav.contact, icone: "M4 6h16v12H4zM4 7l8 6 8-6" },
          ].map((r) => (
            <Link
              key={r.href}
              href={r.href}
              className="flex flex-col items-center gap-2 rounded-2xl border border-rof-ligne bg-rof-blanc px-2 py-4 text-center transition-colors hover:border-rof-or active:scale-[0.97]"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-rof-royal-sombre text-rof-poudre">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d={r.icone} />
                </svg>
              </span>
              <span className="font-condensed text-sm font-bold uppercase tracking-wide text-rof-texte">{r.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {messagesAffiches.length > 0 && (
        <section className="mt-3 flex flex-col gap-2 rounded-xl border border-rof-ligne bg-rof-blanc p-4">
          <p className="font-condensed text-xs font-bold uppercase tracking-[0.2em] text-rof-or">{m2.messageATous}</p>
          {messagesAffiches.map((m, i) => (
            <p key={i} className="whitespace-pre-line text-base text-rof-texte">
              {m}
            </p>
          ))}
        </section>
      )}

      <section className="mt-6">
        <p className="font-condensed text-xs font-bold uppercase tracking-[0.2em] text-rof-gris">{a.mesEquipes}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {equipes.map((e) => (
            <span
              key={e.team_id}
              className="rounded-full border border-rof-ligne bg-rof-blanc px-3 py-1 font-condensed text-sm uppercase text-rof-texte"
            >
              {e.team?.name}
            </span>
          ))}
          {equipes.length === 0 && <p className="text-sm text-rof-gris">{m2.aucuneEquipe}</p>}
        </div>
      </section>

      {profile?.role === "member" && (
        <div className="mt-6">
          <FormAjouterJoueuse
            libelles={{
              titre: m2.ajouterJoueuse,
              nom: m2.nomJoueuse,
              naissance: m2.naissance,
              bouton: m2.ajouter,
              ok: m2.joueuseAjoutee,
            }}
          />
        </div>
      )}
    </main>
  );
}
