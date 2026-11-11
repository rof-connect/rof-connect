import { basculerEtape, changerChoixParcours } from "@/app/membres/parcours/actions";
import { ARC } from "@/lib/parcours/calcul";
import { bouton } from "@/components/ui/boutons";

type Etape = { id: string; titre: string; detail: string; quand: string; info: boolean; fait: boolean; retard: boolean };

/**
 * Plan d'action de la joueuse : choix de parcours (modifiable), étapes à cocher et calendrier.
 * Les étapes non faites dont la date est passée remontent en tête (« À faire maintenant »).
 */
export function PlanParcours({
  choix,
  parcours,
  etapes,
  lectureSeule = false,
}: {
  lectureSeule?: boolean;
  choix: string;
  parcours: { k: string; n: string }[];
  etapes: Etape[];
}) {
  const afaire = etapes.filter((e) => !e.fait);
  const faites = etapes.filter((e) => e.fait);

  return (
    <section className="rounded-xl border border-rof-or bg-rof-blanc p-4">
      <p className="font-condensed text-xs font-bold uppercase tracking-[0.2em] text-rof-or">Mon plan et mon calendrier</p>

      {lectureSeule ? (
        <p className="mt-3 text-sm text-rof-texte">
          Parcours choisi : <strong>{parcours.find((p) => p.k === choix) ? `${choix} · ${parcours.find((p) => p.k === choix)!.n}` : "pas encore décidé"}</strong>
        </p>
      ) : (
      <form action={changerChoixParcours} className="mt-3 flex flex-col gap-2">
        <label className="text-xs font-semibold uppercase tracking-wide text-rof-gris" htmlFor="choix-parcours">
          Mon parcours choisi
        </label>
        <div className="flex flex-wrap items-center gap-2">
          <select
            id="choix-parcours"
            name="k"
            defaultValue={choix}
            className="min-w-0 flex-1 rounded-lg border border-rof-ligne bg-rof-craie px-3 py-2 text-sm text-rof-texte"
          >
            <option value="">Pas encore décidé</option>
            {parcours.map((p) => (
              <option key={p.k} value={p.k}>
                {p.k} · {p.n}
              </option>
            ))}
          </select>
          <button type="submit" className={bouton("primaire", "md")}>
            {choix ? "Changer mon choix" : "Choisir"}
          </button>
        </div>
        <p className="text-xs text-rof-gris">
          Tu changes d&apos;idée? Le calendrier est recalculé selon le nouveau parcours. Les étapes déjà faites restent cochées et celles qui
          n&apos;ont pas été faites repassent à « à faire maintenant ».
        </p>
      </form>
      )}

      <ul className="mt-4 flex flex-col gap-2">
        {afaire.map((e) => (
          <li key={e.id} className={`rounded-lg border p-3 ${e.retard ? "border-rof-rouge bg-rof-craie" : "border-rof-ligne bg-rof-craie"}`}>
            <div className="flex items-start gap-3">
              {e.info || lectureSeule ? (
                <span className="mt-0.5 h-5 w-5 shrink-0 text-center text-rof-or" aria-hidden>
                  {e.info ? "◆" : "☐"}
                </span>
              ) : (
                <form action={basculerEtape} className="shrink-0">
                  <input type="hidden" name="id" value={e.id} />
                  <input type="hidden" name="faite" value="1" />
                  <button type="submit" aria-label={`Marquer « ${e.titre} » comme fait`} className="mt-0.5 h-5 w-5 rounded border border-rof-or" />
                </form>
              )}
              <div className="min-w-0">
                <p className={`text-xs font-semibold uppercase tracking-wide ${e.retard ? "text-rof-rouge" : "text-rof-or"}`}>{e.quand}</p>
                <p className="font-condensed text-base font-bold uppercase text-rof-texte">{e.titre}</p>
                <p className="text-sm text-rof-gris">{e.detail}</p>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {faites.length > 0 && (
        <details className="mt-3">
          <summary className={`${bouton("secondaire")} cursor-pointer list-none w-fit [&::-webkit-details-marker]:hidden`}>Étapes complétées ({faites.length})</summary>
          <ul className="mt-2 flex flex-col gap-2">
            {faites.map((e) => (
              <li key={e.id} className="flex items-center justify-between gap-3 rounded-lg border border-rof-ligne p-3">
                <p className="text-sm text-rof-gris line-through">{e.titre}</p>
                {!lectureSeule && (
                  <form action={basculerEtape}>
                    <input type="hidden" name="id" value={e.id} />
                    <input type="hidden" name="faite" value="0" />
                    <button type="submit" className={bouton("secondaire")}>
                      Remettre à faire
                    </button>
                  </form>
                )}
              </li>
            ))}
          </ul>
        </details>
      )}

      <div className="mt-4 rounded-lg border border-rof-or p-3">
        <p className="font-condensed text-sm font-bold uppercase text-rof-or">{ARC.nom} · services complets</p>
        <p className="mt-1 text-sm text-rof-texte">{ARC.suggestion}</p>
        <p className="mt-1 text-xs text-rof-gris">
          {ARC.contact} · {ARC.courriel} · {ARC.site}
        </p>
      </div>
    </section>
  );
}
