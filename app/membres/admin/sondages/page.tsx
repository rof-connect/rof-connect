import { redirect } from "next/navigation";
import { trierEquipes } from "@/lib/equipes";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { chargerSondages } from "@/lib/sondages";
import { TableauSondages } from "@/components/membres/TableauSondages";
import { FormImageSondage } from "@/components/membres/FormImageSondage";
import { FormOptionSondage } from "@/components/membres/FormOptionSondage";
import { creerSondage, ajouterOptionSondage, basculerSondage, supprimerSondage } from "./actions";

const champ = "w-full rounded-lg border border-rof-ligne bg-rof-craie px-3 py-2 text-sm text-rof-texte placeholder:text-rof-gris/60";
const etiquette = "mb-1 text-xs font-semibold uppercase tracking-wide text-rof-gris";

export default async function SondagesAdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user!.id).single();
  if (profile?.role !== "admin") redirect("/membres");

  const { data: teamsBrut } = await supabase.from("teams").select("id, name").eq("archived", false);
  const teams = trierEquipes(teamsBrut);
  const sondages = await chargerSondages(user!.id, true);

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-5 py-10">
      <div>
        <p className="font-condensed text-sm uppercase tracking-[0.3em] text-rof-poudre">Direction</p>
        <h1 className="mt-1 font-condensed text-3xl font-bold uppercase text-rof-texte">Sondages</h1>
        <p className="mt-2 text-sm text-rof-gris">
          Crée un sondage, ajoute les photos des choix quand tu les as, et consulte les résultats.{" "}
          <Link href="/membres/sondages" className="text-rof-poudre underline">
            Voir comme un membre
          </Link>
        </p>
      </div>

      <TableauSondages sondages={sondages} />

      <details className="rounded-xl border border-rof-ligne bg-rof-blanc p-4">
        <summary className="cursor-pointer font-condensed text-lg font-bold uppercase tracking-wide text-rof-texte">
          + Nouveau sondage
        </summary>
        <form action={creerSondage} className="mt-4 flex flex-col gap-3">
          <div>
            <p className={etiquette}>Titre</p>
            <input name="titre" required className={champ} placeholder="Ex. : Voyage Spring Training" />
          </div>
          <div>
            <p className={etiquette}>Description (facultatif)</p>
            <input name="description" className={champ} />
          </div>
          <div>
            <p className={etiquette}>Type de réponse</p>
            <select name="kind" className={champ}>
              <option value="choix">Choix (les membres votent pour une option)</option>
              <option value="date">Une date (les membres inscrivent leur date)</option>
            </select>
          </div>
          <div>
            <p className={etiquette}>Type « Une date » : nombre de dates possibles par personne (facultatives)</p>
            <input name="max_dates" type="number" min={1} max={5} defaultValue={1} className={champ} />
          </div>
          <div>
            <p className={etiquette}>Choix (un par ligne, minimum 2) : seulement pour le type « Choix »</p>
            <textarea name="options" rows={4} className={champ} placeholder={"Floride\nTexas"} />
          </div>
          <div>
            <p className={etiquette}>Pour qui</p>
            <select name="team_id" className={champ}>
              <option value="">Tout le monde</option>
              {(teams ?? []).map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="w-fit rounded-lg bg-rof-or px-4 py-2 font-condensed text-sm font-bold uppercase tracking-wide text-white"
          >
            Créer le sondage
          </button>
        </form>
      </details>

      <div className="flex flex-col gap-5">
        {sondages.map((s) => (
          <div key={s.id} className="flex flex-col gap-3 rounded-xl border border-rof-ligne bg-rof-blanc p-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="font-condensed text-xl font-bold uppercase tracking-wide text-rof-texte">{s.title}</h2>
              <p className="text-xs text-rof-gris">
                {s.teamName ?? "Tout le monde"} · {s.closed ? "Fermé" : "Ouvert"} · {s.total} vote{s.total > 1 ? "s" : ""}
              </p>
            </div>
            {s.description && <p className="text-sm text-rof-gris">{s.description}</p>}

            {s.kind === "date" ? (
              <div className="rounded-lg border border-rof-ligne bg-rof-craie p-3 text-sm">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-rof-gris">
                  Dates reçues ({s.dates.length})
                </p>
                {s.dates.length === 0 && <p className="text-rof-gris">Aucune réponse pour le moment.</p>}
                {s.dates.map((d, n) => (
                  <p key={n} className="text-rof-texte">
                    {new Date(d.date + "T12:00:00").toLocaleDateString("fr-CA", { dateStyle: "long" })}{" "}
                    <span className="text-rof-gris">· {d.nom}</span>
                  </p>
                ))}
              </div>
            ) : (
              <>
                <FormImageSondage pollId={s.id} imageUrl={s.imageUrl} />

                <div className="grid gap-3 sm:grid-cols-2">
                  {s.options.map((o) => (
                    <FormOptionSondage key={o.id} optionId={o.id} label={o.label} imageUrl={o.imageUrl} votes={o.votes} />
                  ))}
                </div>

                <form action={ajouterOptionSondage} className="flex items-center gap-2">
                  <input type="hidden" name="poll_id" value={s.id} />
                  <input name="label" required placeholder="Ajouter un choix…" className={champ} />
                  <button type="submit" className="shrink-0 text-sm text-rof-poudre underline">
                    Ajouter
                  </button>
                </form>
              </>
            )}

            {s.total > 0 && s.kind !== "date" && (
              <details>
                <summary className="cursor-pointer text-sm font-semibold text-rof-poudre">Qui a voté quoi</summary>
                <div className="mt-2 flex flex-col gap-2 text-sm">
                  {s.options.map((o) => (
                    <p key={o.id} className="text-rof-gris">
                      <span className="font-semibold text-rof-texte">{o.label}</span> :{" "}
                      {s.votants
                        .filter((v) => v.optionId === o.id)
                        .map((v) => v.nom)
                        .join(", ") || "—"}
                    </p>
                  ))}
                </div>
              </details>
            )}

            <div className="flex gap-4">
              <form action={basculerSondage}>
                <input type="hidden" name="poll_id" value={s.id} />
                <input type="hidden" name="fermer" value={s.closed ? "0" : "1"} />
                <button type="submit" className="text-sm text-rof-poudre underline">
                  {s.closed ? "Rouvrir" : "Fermer le sondage"}
                </button>
              </form>
              <form action={supprimerSondage}>
                <input type="hidden" name="poll_id" value={s.id} />
                <button type="submit" className="text-sm text-rof-rouge underline">
                  Supprimer
                </button>
              </form>
            </div>
          </div>
        ))}
        {sondages.length === 0 && <p className="text-sm text-rof-gris">Aucun sondage pour le moment.</p>}
      </div>
    </main>
  );
}
