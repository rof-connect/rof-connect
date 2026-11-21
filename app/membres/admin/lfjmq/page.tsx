import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { chargerLfjmq, texteClassement } from "@/lib/lfjmq";
import { bouton } from "@/components/ui/boutons";
import { ajouterResume, majClassement, majLiensLfjmq, supprimerResume } from "./actions";

const champ = "w-full rounded-lg border border-rof-ligne bg-rof-craie px-3 py-2 text-sm text-rof-texte placeholder:text-rof-gris/60";
const etiquette = "mb-1 text-xs font-semibold uppercase tracking-wide text-rof-gris";
const carte = "flex flex-col gap-3 rounded-xl border border-rof-ligne bg-rof-blanc p-4";
const titreCarte = "font-condensed text-lg font-bold uppercase tracking-wide text-rof-texte";

export default async function LfjmqAdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user!.id).single();
  if (profile?.role !== "admin") redirect("/membres");

  const d = await chargerLfjmq();
  const resumes = [...d.resumes].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-5 py-10">
      <div>
        <p className="font-condensed text-sm uppercase tracking-[0.3em] text-rof-poudre">Direction</p>
        <h1 className="mt-1 font-condensed text-3xl font-bold uppercase text-rof-texte">LFJMQ</h1>
        <p className="mt-2 text-sm text-rof-gris">
          Contenu de la page de la ligue sur le site public softball : horaire GameChanger, classement et résumés des matchs.{" "}
          Le site de la ligue est en ligne sur royalonfield.ca/lfjmq.
        </p>
      </div>

      <form action={majLiensLfjmq} className={carte}>
        <p className={titreCarte}>Liens GameChanger</p>
        <div>
          <p className={etiquette}>Identifiant du widget calendrier (facultatif)</p>
          <input name="widget_id" defaultValue={d.widgetId} placeholder="ex. 7995b8d4-b175-40db-9190-7719a306837c" className={champ} />
        </div>
        <div>
          <p className={etiquette}>Lien de l&apos;horaire sur GameChanger</p>
          <input name="lien_horaire" defaultValue={d.lienHoraire} placeholder="https://web.gc.com/…" className={champ} />
        </div>
        <div>
          <p className={etiquette}>Lien du classement sur GameChanger</p>
          <input name="lien_classement" defaultValue={d.lienClassement} placeholder="https://web.gc.com/…" className={champ} />
        </div>
        <button type="submit" className={bouton("primaire", "md")}>
          Enregistrer les liens
        </button>
      </form>

      <form action={majClassement} className={carte}>
        <p className={titreCarte}>Classement</p>
        <p className="text-xs text-rof-gris">
          Colle le tableau du classement : une ligne par équipe, « Équipe ; PJ ; V ; D ; N ; PTS » (point-virgule, tabulation ou virgule). Une ligne « # 18U » ouvre une division. Sans la colonne PTS, les points sont calculés (2 par victoire, 1 par nulle).
          {d.maj ? ` Dernière mise à jour : ${new Date(d.maj).toLocaleDateString("fr-CA", { dateStyle: "long" })}.` : ""}
        </p>
        <textarea
          name="classement"
          rows={10}
          defaultValue={texteClassement(d.divisions)}
          placeholder={"# 18U\nRoyal On Field;10;8;2;0;16\nAutre équipe;10;6;4;0;12"}
          className={`${champ} font-mono`}
        />
        <button type="submit" className={bouton("primaire", "md")}>
          Mettre à jour le classement
        </button>
      </form>

      <form action={ajouterResume} className={carte}>
        <p className={titreCarte}>Nouveau résumé de match</p>
        <p className="text-xs text-rof-gris">
          Copie le résumé de GameChanger (en anglais) dans « Texte original », puis colle sa traduction française dans « Texte affiché ». Seul le texte français est publié.
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className={etiquette}>Date du match</p>
            <input name="date" type="date" required className={champ} />
          </div>
          <div>
            <p className={etiquette}>Lien GameChanger (facultatif)</p>
            <input name="lien" placeholder="https://web.gc.com/…" className={champ} />
          </div>
        </div>
        <div>
          <p className={etiquette}>Titre</p>
          <input name="titre" required maxLength={120} placeholder="Ex. : Royal 5, Rebelles 3" className={champ} />
        </div>
        <div>
          <p className={etiquette}>Texte original GameChanger (anglais, non publié)</p>
          <textarea name="en" rows={4} className={champ} />
        </div>
        <div>
          <p className={etiquette}>Texte affiché sur le site (français)</p>
          <textarea name="fr" required rows={5} className={champ} />
        </div>
        <button type="submit" className={bouton("primaire", "md")}>
          Ajouter le résumé
        </button>
      </form>

      <section className="flex flex-col gap-3">
        <p className={titreCarte}>Résumés publiés ({resumes.length})</p>
        {resumes.length === 0 && <p className="text-sm text-rof-gris">Aucun résumé pour le moment.</p>}
        {resumes.map((r) => (
          <div key={r.id} className={carte}>
            <div className="flex items-baseline justify-between gap-2">
              <p className="font-condensed text-base font-bold uppercase text-rof-texte">{r.titre}</p>
              <p className="text-xs text-rof-gris">{new Date(r.date + "T12:00:00").toLocaleDateString("fr-CA", { dateStyle: "long" })}</p>
            </div>
            <p className="whitespace-pre-line text-sm text-rof-texte">{r.fr}</p>
            <form action={supprimerResume}>
              <input type="hidden" name="id" value={r.id} />
              <button type="submit" className={bouton("danger")}>
                Supprimer
              </button>
            </form>
          </div>
        ))}
      </section>
    </main>
  );
}
