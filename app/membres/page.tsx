import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { FormAjouterJoueuse } from "@/components/membres/FormAjouterJoueuse";
import { chargerMessagesTous } from "@/lib/messages-tous";
import { chargerSondages } from "@/lib/sondages";
import { getDictionnaire } from "@/lib/i18n/server";
import { repondre } from "@/app/membres/agenda/actions";
import { chargerDepots, doitDepot } from "@/lib/depots";
import { marquerDepotEnvoye } from "@/app/membres/depot/actions";

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

  // Dépôt de 500 $ : seulement pour le softball, dès que le statut n'est plus Prospect.
  const etatDepot = (await chargerDepots())[user!.id];
  const depotDu = doitDepot(equipes.map((e) => ({ role_in_team: e.role_in_team, status_id: e.status_id, sport: e.team?.sport }))) && etatDepot !== "recu";
  const nbAFaire = sondagesAFaire + (depotDu && etatDepot !== "envoye" ? 1 : 0);

  const messages = await chargerMessagesTous(locale === "en" ? "en" : "fr");
  const aSelection = equipes.some((m) => m.role_in_team === "athlete" && m.status_id > 1);
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
            <Link href="/membres/agenda" className="mt-3 inline-block text-sm text-rof-poudre underline">
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
              ? [sondagesAFaire ? `${sondagesAFaire} ${a.sondagesAFaire}` : "", depotDu && etatDepot !== "envoye" ? a.depotAFaire : ""].filter(Boolean).join(" · ")
              : a.toutEstFait}
          </p>
        </Link>
        <Link href="/membres/agenda" className="rounded-xl border border-rof-ligne bg-rof-blanc p-4">
          <p className="font-condensed text-xs font-bold uppercase tracking-[0.2em] text-rof-gris">{a.semaine}</p>
          <p className="font-condensed text-3xl font-bold text-rof-poudre">{nbSemaine}</p>
          <p className="text-xs text-rof-gris">{a.evenements}</p>
        </Link>
      </div>

      {depotDu && (
        <section className="mt-3 rounded-xl border border-rof-or bg-rof-blanc p-4">
          <p className="font-condensed text-xs font-bold uppercase tracking-[0.2em] text-rof-or">{a.depotTitre}</p>
          <p className="mt-1 text-sm text-rof-texte">{a.depotTexte}</p>
          {etatDepot === "envoye" ? (
            <p className="mt-3 text-sm text-rof-gazon">{a.depotVerification}</p>
          ) : (
            <form action={marquerDepotEnvoye} className="mt-3">
              <button type="submit" className="rounded-full bg-rof-or px-5 py-2 font-condensed text-sm font-bold uppercase tracking-wide text-black">
                {a.depotEnvoye}
              </button>
            </form>
          )}
        </section>
      )}

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
