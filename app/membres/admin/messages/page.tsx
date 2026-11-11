import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { chargerMessagesTous } from "@/lib/messages-tous";
import { majMessagesTous } from "./actions";
import { bouton } from "@/components/ui/boutons";

const champ = "w-full rounded-lg border border-rof-ligne bg-rof-craie px-3 py-2 text-sm text-rof-texte";

const BLOCS = [
  {
    cle: "selection",
    titre: "Joueuses sélectionnées",
    aide: "Affiché aux joueuses qui n'ont plus le statut Prospect.",
  },
  {
    cle: "prospect",
    titre: "Joueuses Prospect",
    aide: "Affiché aux joueuses qui ont encore le statut Prospect (ou aucune équipe).",
  },
  {
    cle: "general",
    titre: "Autre message à tous",
    aide: "Affiché à tout le monde (joueuses, entraîneurs, direction) sous le message ci-dessus. Laisser vide pour ne rien afficher.",
  },
] as const;

export default async function MessagesTousPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user!.id).single();
  if (profile?.role !== "admin") redirect("/membres");

  const fr = await chargerMessagesTous("fr");
  const en = await chargerMessagesTous("en");

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-5 py-10">
      <div>
        <p className="font-condensed text-sm uppercase tracking-[0.3em] text-rof-poudre">Direction</p>
        <h1 className="mt-1 font-condensed text-3xl font-bold uppercase text-rof-texte">Messages à tous</h1>
        <p className="mt-2 text-sm text-rof-gris">
          Ces messages s&apos;affichent sur la page d&apos;accueil des membres à leur connexion, dans leur langue.
        </p>
      </div>

      <form action={majMessagesTous} className="flex flex-col gap-6">
        {BLOCS.map((b) => (
          <section key={b.cle} className="flex flex-col gap-3 rounded-xl border border-rof-ligne bg-rof-blanc p-4">
            <div>
              <h2 className="font-condensed text-xl font-bold uppercase tracking-wide text-rof-or">{b.titre}</h2>
              <p className="text-xs text-rof-gris">{b.aide}</p>
            </div>
            <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-rof-gris">
              Français
              <textarea name={`${b.cle}_fr`} rows={3} defaultValue={fr[b.cle]} className={champ} />
            </label>
            <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-rof-gris">
              English
              <textarea name={`${b.cle}_en`} rows={3} defaultValue={en[b.cle]} className={champ} />
            </label>
          </section>
        ))}
        <button
          type="submit"
          className={bouton("primaire", "md")}
        >
          Enregistrer
        </button>
      </form>
    </main>
  );
}
