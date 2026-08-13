import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { FormAjoutEvenementCalendrier } from "@/components/membres/FormAjoutEvenementCalendrier";
import { supprimerEvenementCalendrier } from "@/app/membres/calendrier/actions";

const JOURS_SEMAINE = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

const COULEURS_TYPE: Record<string, string> = {
  Pratique: "bg-emerald-100 text-emerald-800",
  Match: "bg-blue-100 text-blue-800",
  Tournoi: "bg-amber-100 text-amber-800",
  Réunion: "bg-violet-100 text-violet-800",
  "Date limite": "bg-rose-100 text-rose-800",
  Événement: "bg-sky-100 text-sky-800",
  Autre: "bg-gray-200 text-gray-700",
};

const LABEL_SPORT: Record<string, string> = { baseball: "Baseball", softball: "Softball" };

type EvenementJour = {
  id: string;
  source: "calendar" | "agenda";
  titre: string;
  type: string;
  heure: string | null;
  lieu: string | null;
  note: string | null;
  porteeLabel: string | null;
};

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export default async function CalendrierPage({
  searchParams,
}: {
  searchParams: Promise<{ m?: string; d?: string }>;
}) {
  const params = await searchParams;

  const now = new Date();
  let year = now.getFullYear();
  let monthIndex = now.getMonth();
  if (params.m && /^\d{4}-\d{2}$/.test(params.m)) {
    const [y, m] = params.m.split("-").map(Number);
    if (m >= 1 && m <= 12) {
      year = y;
      monthIndex = m - 1;
    }
  }

  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const leadingBlanks = (new Date(year, monthIndex, 1).getDay() + 6) % 7;
  const startDate = `${year}-${pad(monthIndex + 1)}-01`;
  const endDate = `${year}-${pad(monthIndex + 1)}-${pad(daysInMonth)}`;

  let prevYear = year;
  let prevMonth = monthIndex - 1;
  if (prevMonth < 0) {
    prevMonth = 11;
    prevYear -= 1;
  }
  let nextYear = year;
  let nextMonth = monthIndex + 1;
  if (nextMonth > 11) {
    nextMonth = 0;
    nextYear += 1;
  }

  const moisLabel = new Date(year, monthIndex, 1).toLocaleDateString("fr-CA", { month: "long", year: "numeric" });

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user!.id).single();
  const estAdmin = profile?.role === "admin";

  const { data: teams } = await supabase.from("teams").select("id, name, sport").eq("archived", false).order("name");
  const teamNameById = new Map((teams ?? []).map((t) => [t.id, t.name]));

  const { data: calEvents } = await supabase
    .from("calendar_events")
    .select("id, team_id, sport, title, event_date, event_time, location, note, type")
    .gte("event_date", startDate)
    .lte("event_date", endDate);

  const { data: agendaEvents } = await supabase
    .from("contents")
    .select("id, team_id, title, event_date, body")
    .eq("kind", "agenda")
    .gte("event_date", startDate)
    .lte("event_date", endDate);

  const eventsByDate = new Map<string, EvenementJour[]>();

  for (const e of calEvents ?? []) {
    if (!e.event_date) continue;
    const list = eventsByDate.get(e.event_date) ?? [];
    const porteeLabel = e.team_id
      ? (teamNameById.get(e.team_id) ?? "Équipe spécifique")
      : e.sport
        ? `Tout le ${LABEL_SPORT[e.sport] ?? e.sport}`
        : "Organisation";
    list.push({
      id: e.id,
      source: "calendar",
      titre: e.title,
      type: e.type,
      heure: e.event_time,
      lieu: e.location,
      note: e.note,
      porteeLabel,
    });
    eventsByDate.set(e.event_date, list);
  }

  for (const e of agendaEvents ?? []) {
    if (!e.event_date) continue;
    const body = (e.body ?? {}) as { type?: string; heure?: string | null; lieu?: string | null; note?: string | null };
    const list = eventsByDate.get(e.event_date) ?? [];
    list.push({
      id: e.id,
      source: "agenda",
      titre: e.title,
      type: body.type ?? "Autre",
      heure: body.heure ?? null,
      lieu: body.lieu ?? null,
      note: body.note ?? null,
      porteeLabel: teamNameById.get(e.team_id) ?? null,
    });
    eventsByDate.set(e.event_date, list);
  }

  const estMoisCourant = year === now.getFullYear() && monthIndex === now.getMonth();
  const selectedDate =
    params.d && /^\d{4}-\d{2}-\d{2}$/.test(params.d) ? params.d : estMoisCourant ? todayISO() : null;
  const evenementsJourSelectionne = selectedDate ? (eventsByDate.get(selectedDate) ?? []) : [];

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-5 py-10">
      <div>
        <p className="font-condensed text-sm uppercase tracking-[0.3em] text-rof-poudre">Espace membres</p>
        <h1 className="mt-1 font-condensed text-3xl font-bold uppercase text-rof-texte">Calendrier</h1>
      </div>

      <div className="flex items-center justify-between">
        <Link
          href={`/membres/calendrier?m=${prevYear}-${pad(prevMonth + 1)}`}
          className="rounded-lg border border-rof-ligne px-3 py-1.5 font-condensed text-sm font-bold uppercase text-rof-gris"
        >
          ‹ Préc.
        </Link>
        <h2 className="font-condensed text-xl font-bold capitalize text-white">{moisLabel}</h2>
        <Link
          href={`/membres/calendrier?m=${nextYear}-${pad(nextMonth + 1)}`}
          className="rounded-lg border border-rof-ligne px-3 py-1.5 font-condensed text-sm font-bold uppercase text-rof-gris"
        >
          Suiv. ›
        </Link>
      </div>

      <div>
        <div className="grid grid-cols-7 gap-1 text-center">
          {JOURS_SEMAINE.map((j) => (
            <div key={j} className="text-xs font-semibold uppercase tracking-wide text-rof-gris">
              {j}
            </div>
          ))}
          {Array.from({ length: leadingBlanks }).map((_, i) => (
            <div key={`blanc-${i}`} />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const jour = i + 1;
            const dateStr = `${year}-${pad(monthIndex + 1)}-${pad(jour)}`;
            const evenements = eventsByDate.get(dateStr) ?? [];
            const estSelectionne = dateStr === selectedDate;
            const estAujourdhui = dateStr === todayISO();
            return (
              <Link
                key={dateStr}
                href={`/membres/calendrier?m=${year}-${pad(monthIndex + 1)}&d=${dateStr}`}
                className={`flex min-h-16 flex-col items-center gap-1 rounded-lg border p-1 ${
                  estSelectionne ? "border-rof-or bg-rof-carte-haut" : "border-rof-ligne"
                }`}
              >
                <span
                  className={`font-condensed text-sm font-bold ${
                    estAujourdhui ? "rounded-full bg-rof-or px-1.5 text-white" : "text-rof-texte"
                  }`}
                >
                  {jour}
                </span>
                <div className="flex flex-wrap justify-center gap-0.5">
                  {evenements.slice(0, 3).map((e) => (
                    <span
                      key={e.id}
                      className={`h-1.5 w-1.5 rounded-full ${(COULEURS_TYPE[e.type] ?? COULEURS_TYPE.Autre).split(" ")[0]}`}
                    />
                  ))}
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <h3 className="font-condensed text-lg font-bold uppercase tracking-wide text-rof-poudre">
          {selectedDate
            ? new Date(selectedDate + "T12:00:00").toLocaleDateString("fr-CA", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })
            : "Sélectionnez un jour"}
        </h3>

        {estAdmin && (
          <FormAjoutEvenementCalendrier dateParDefaut={selectedDate ?? todayISO()} equipes={teams ?? []} />
        )}

        <div className="flex flex-col gap-2">
          {evenementsJourSelectionne.map((e) => {
            const badge = COULEURS_TYPE[e.type] ?? COULEURS_TYPE.Autre;
            return (
              <div key={`${e.source}-${e.id}`} className="rounded-xl border border-rof-ligne bg-rof-blanc p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`rounded-full px-2 py-0.5 font-condensed text-xs font-bold uppercase tracking-wide ${badge}`}>
                    {e.type}
                  </span>
                  {e.porteeLabel && (
                    <span className="rounded-full bg-rof-craie px-2 py-0.5 text-xs font-semibold text-rof-gris">
                      {e.porteeLabel}
                    </span>
                  )}
                </div>
                <div className="mt-1 font-condensed text-lg font-bold uppercase leading-tight text-white">{e.titre}</div>
                {e.heure && <div className="text-sm text-rof-texte">{e.heure}</div>}
                {e.lieu && <div className="text-sm text-rof-gris">📍 {e.lieu}</div>}
                {e.note && <p className="mt-1 text-sm text-rof-texte">{e.note}</p>}
                {estAdmin && e.source === "calendar" && (
                  <form action={supprimerEvenementCalendrier} className="mt-2 text-right">
                    <input type="hidden" name="id" value={e.id} />
                    <button type="submit" className="text-sm text-rof-rouge underline">
                      Supprimer
                    </button>
                  </form>
                )}
              </div>
            );
          })}
          {selectedDate && evenementsJourSelectionne.length === 0 && (
            <p className="text-sm text-rof-gris">Aucun événement ce jour-là.</p>
          )}
        </div>
      </div>
    </main>
  );
}
