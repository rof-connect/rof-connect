import { redirect } from "next/navigation";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { chargerAbonnes, retirerAbonne } from "@/lib/infolettre";
import { bouton } from "@/components/ui/boutons";

export const dynamic = "force-dynamic";

async function retirer(formData: FormData) {
  "use server";
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  const { data: moi } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (moi?.role !== "admin") return;
  const courriel = String(formData.get("courriel") ?? "").trim().toLowerCase();
  if (courriel) await retirerAbonne(courriel);
  revalidatePath("/membres/admin/infolettre");
}

export default async function InfolettrePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: moi } = await supabase.from("profiles").select("role").eq("id", user!.id).single();
  if (moi?.role !== "admin") redirect("/membres");

  const abonnes = (await chargerAbonnes()).sort((a, b) => b.date.localeCompare(a.date));

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-5 py-10">
      <div>
        <Link href="/membres/admin" className={bouton("secondaire")}>
          ← Direction
        </Link>
        <h1 className="mt-3 font-condensed text-3xl font-bold uppercase text-rof-texte">Infolettre</h1>
        <p className="text-sm text-rof-gris">
          {abonnes.length} abonné{abonnes.length > 1 ? "s" : ""} · inscrits par la fenêtre d&apos;accueil du site public.
        </p>
      </div>

      {abonnes.length > 0 && (
        <a href="/api/export/infolettre" className={`${bouton("primaire", "md")} self-start`}>
          Télécharger la liste (CSV)
        </a>
      )}

      <ul className="flex flex-col gap-2">
        {abonnes.map((a) => (
          <li key={a.courriel} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-rof-ligne bg-rof-blanc px-4 py-3">
            <div className="min-w-0">
              <p className="break-all font-semibold text-rof-texte">{a.courriel}</p>
              <p className="text-xs text-rof-gris">
                {a.sport === "baseball" ? "Baseball" : "Softball"} · {new Date(a.date).toLocaleDateString("fr-CA", { dateStyle: "medium" })}
              </p>
            </div>
            <form action={retirer}>
              <input type="hidden" name="courriel" value={a.courriel} />
              <button type="submit" className={bouton("neutre")}>
                Retirer (désabonnement)
              </button>
            </form>
          </li>
        ))}
        {abonnes.length === 0 && <p className="text-sm text-rof-gris">Personne n&apos;est encore inscrit.</p>}
      </ul>
    </main>
  );
}
