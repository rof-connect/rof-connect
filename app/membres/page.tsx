import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { FormAjouterJoueuse } from "@/components/membres/FormAjouterJoueuse";
import { chargerMessagesTous } from "@/lib/messages-tous";
import { chargerSondages } from "@/lib/sondages";
import { getDictionnaire } from "@/lib/i18n/server";
import { repondre } from "@/app/membres/agenda/actions";
import { chargerStatutsJoueuses } from "@/lib/statuts";
import { bouton as styleBouton } from "@/components/ui/boutons";

type EvenementBody = { type?: string; heure?: string | null; lieu?: string | null };

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

  const prochain = (aVenir ?? [])[0] ?? null;
  const nbSemaine = (aVenir ?? []).filter((e) => (e.event_date ?? "") <= dansSeptJours).length;

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

  const sondages = await chargerSondages(user!.id, estAdmin);
  const sondagesAFaire = sondages.filter((s) => !s.closed && !s.monVote && s.maDates.length === 0).length;

  const nbAFaire = sondagesAFaire;

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

      <section className="mt-6 rounded-xl border border-rof-or bg-rof-blanc p-4">
        <p className="font-condensed text-xs font-bold uppercase tracking-[0.2em] text-rof-or">{a.prochain}</p>
        {prochain ? (
          <>
            <p className="mt-1 font-condensed text-2xl font-bold uppercase text-rof-texte">{prochain.title}</p>
            <p className="text-sm text-rof-gris">{details}</p>
            {teamIds.length > 1 && <p className="text-xs text-rof-gris">{nomEquipe.get(prochain.team_id)}</p>}
            {estAthlete && (
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
        <Link href="/membres/sondages" className="rounded-xl border border-rof-ligne bg-rof-blanc p-4">
          <p className="font-condensed text-xs font-bold uppercase tracking-[0.2em] text-rof-gris">{a.aFaire}</p>
          <p className={`font-condensed text-3xl font-bold ${nbAFaire ? "text-rof-rouge" : "text-rof-gazon"}`}>
            {nbAFaire}
          </p>
          <p className="text-xs text-rof-gris">
            {nbAFaire
              ? `${sondagesAFaire} ${a.sondagesAFaire}`
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
