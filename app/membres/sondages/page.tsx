import { createClient } from "@/lib/supabase/server";
import { chargerSondages } from "@/lib/sondages";
import { voter } from "./actions";

export default async function SondagesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user!.id).single();
  const sondages = await chargerSondages(user!.id, profile?.role === "admin");

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-5 py-10">
      <div>
        <p className="font-condensed text-sm uppercase tracking-[0.3em] text-rof-poudre">Espace membres</p>
        <h1 className="mt-1 font-condensed text-3xl font-bold uppercase text-rof-texte">Sondages</h1>
      </div>

      {sondages.length === 0 && <p className="text-sm text-rof-gris">Aucun sondage pour le moment.</p>}

      {sondages.map((s) => {
        if (s.kind === "date") {
          return (
            <form key={s.id} action={voter} className="flex flex-col gap-3 rounded-xl border border-rof-ligne bg-rof-blanc p-4">
              <input type="hidden" name="poll_id" value={s.id} />
              <div>
                <h2 className="font-condensed text-xl font-bold uppercase tracking-wide text-rof-texte">{s.title}</h2>
                {s.description && <p className="mt-1 text-sm text-rof-gris">{s.description}</p>}
                <p className="mt-1 text-xs text-rof-gris">
                  {s.teamName ? s.teamName : "Tout le monde"} · {s.closed ? "Fermé" : "Ouvert"}
                </p>
              </div>
              <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-rof-gris">
                Ta date
                <input
                  type="date"
                  name="reponse_date"
                  required
                  defaultValue={s.maDate ?? ""}
                  disabled={s.closed}
                  className="w-full max-w-xs rounded-lg border border-rof-ligne bg-rof-craie px-3 py-2 text-base font-normal normal-case text-rof-texte"
                />
              </label>
              {!s.closed && (
                <button
                  type="submit"
                  className="w-fit rounded-lg bg-rof-or px-4 py-2 font-condensed text-sm font-bold uppercase tracking-wide text-white"
                >
                  {s.maDate ? "Modifier ma date" : "Enregistrer ma date"}
                </button>
              )}
              {s.maDate && (
                <p className="text-xs text-rof-gazon">
                  Date enregistrée : {new Date(s.maDate + "T12:00:00").toLocaleDateString("fr-CA", { dateStyle: "long" })}
                </p>
              )}
            </form>
          );
        }

        const resultats = s.monVote !== null || s.closed;
        return (
          <form key={s.id} action={voter} className="flex flex-col gap-3 rounded-xl border border-rof-ligne bg-rof-blanc p-4">
            <input type="hidden" name="poll_id" value={s.id} />
            <div>
              <h2 className="font-condensed text-xl font-bold uppercase tracking-wide text-rof-texte">{s.title}</h2>
              {s.description && <p className="mt-1 text-sm text-rof-gris">{s.description}</p>}
              <p className="mt-1 text-xs text-rof-gris">
                {s.teamName ? s.teamName : "Tout le monde"} · {s.closed ? "Fermé" : "Ouvert"}
              </p>
            </div>

            {s.imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={s.imageUrl} alt={s.title} className="w-full rounded-lg" />
            )}

            <div className={`grid gap-3 ${s.options.some((o) => o.imageUrl) ? "grid-cols-2" : "grid-cols-1"}`}>
              {s.options.map((o) => {
                const pct = s.total ? Math.round((o.votes / s.total) * 100) : 0;
                const choisi = s.monVote === o.id;
                return (
                  <label
                    key={o.id}
                    className={`flex flex-col gap-2 rounded-lg border p-3 ${choisi ? "border-rof-or bg-rof-carte-haut" : "border-rof-ligne bg-rof-craie"} ${s.closed ? "cursor-default" : "cursor-pointer"}`}
                  >
                    {o.imageUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={o.imageUrl} alt={o.label} className="aspect-square w-full rounded-md object-cover" />
                    )}
                    <span className="flex items-center gap-2 text-rof-texte">
                      <input type="radio" name="option_id" value={o.id} defaultChecked={choisi} disabled={s.closed} required />
                      <span className="font-semibold">{o.label}</span>
                    </span>
                    {resultats && (
                      <span className="flex flex-col gap-1">
                        <span className="h-2 w-full overflow-hidden rounded-full bg-rof-ligne">
                          <span className="block h-full bg-rof-or" style={{ width: `${pct}%` }} />
                        </span>
                        <span className="text-xs text-rof-gris">
                          {o.votes} vote{o.votes > 1 ? "s" : ""} · {pct} %
                        </span>
                      </span>
                    )}
                  </label>
                );
              })}
            </div>

            {!s.closed && (
              <button
                type="submit"
                className="w-fit rounded-lg bg-rof-or px-4 py-2 font-condensed text-sm font-bold uppercase tracking-wide text-white"
              >
                {s.monVote ? "Changer mon vote" : "Voter"}
              </button>
            )}
            {resultats && (
              <p className="text-xs text-rof-gris">
                {s.total} vote{s.total > 1 ? "s" : ""} au total
              </p>
            )}
          </form>
        );
      })}
    </main>
  );
}
