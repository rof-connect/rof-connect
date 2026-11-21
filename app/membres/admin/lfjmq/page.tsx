import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CLES_DIVISION, chargerLfjmq } from "@/lib/lfjmq";
import { OPTIONS_DIVISION } from "@/lib/lfjmq-saison";
import { bouton } from "@/components/ui/boutons";
import { majWidgetsLfjmq } from "./actions";

const champ = "w-full rounded-lg border border-rof-ligne bg-rof-craie px-3 py-2 text-sm text-rof-texte placeholder:text-rof-gris/60";
const etiquette = "mb-1 text-xs font-semibold uppercase tracking-wide text-rof-gris";

export default async function LfjmqAdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user!.id).single();
  if (profile?.role !== "admin") redirect("/membres");

  const d = await chargerLfjmq();

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-5 py-10">
      <div>
        <p className="font-condensed text-sm uppercase tracking-[0.3em] text-rof-poudre">Direction</p>
        <h1 className="mt-1 font-condensed text-3xl font-bold uppercase text-rof-texte">LFJMQ</h1>
        <p className="mt-2 text-sm text-rof-gris">
          Le site de la ligue est en ligne sur royalonfield.ca/lfjmq. La bande de résultats du haut change selon la division choisie : branche ici le widget GameChanger de chaque division. Tant qu&apos;un widget n&apos;est pas branché, la bande affiche les derniers résultats déjà publiés.
        </p>
      </div>

      <form action={majWidgetsLfjmq} className="flex flex-col gap-4 rounded-xl border border-rof-ligne bg-rof-blanc p-4">
        <p className="font-condensed text-lg font-bold uppercase tracking-wide text-rof-texte">Widgets GameChanger par division</p>
        <p className="text-xs text-rof-gris">Dans GameChanger : page de la ligue, Tools, Create Scoreboard. Copie l&apos;identifiant du widget (widgetId) du code fourni.</p>
        {CLES_DIVISION.map((k) => (
          <fieldset key={k} className="flex flex-col gap-3 rounded-lg border border-rof-ligne p-3">
            <legend className="px-1 font-condensed text-xs font-bold uppercase tracking-[0.2em] text-rof-or">{OPTIONS_DIVISION.find((o) => o.cle === k)?.nom.fr}</legend>
            <div>
              <p className={etiquette}>Identifiant du widget</p>
              <input name={`widget_${k}`} defaultValue={d.widgets[k].widgetId} placeholder="ex. 7995b8d4-b175-40db-9190-7719a306837c" className={champ} />
            </div>
            <div>
              <p className={etiquette}>Lien « Tous les résultats » sur GameChanger</p>
              <input name={`url_${k}`} defaultValue={d.widgets[k].url} placeholder="https://web.gc.com/…" className={champ} />
            </div>
          </fieldset>
        ))}
        <button type="submit" className={bouton("primaire", "md")}>
          Enregistrer
        </button>
      </form>
    </main>
  );
}
