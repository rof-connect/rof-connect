import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { calculerRecalcul } from "@/lib/statuts-recalcul";
import { dateReferenceAge } from "@/lib/statuts";
import { appliquerRecalcul } from "@/app/membres/admin/statuts/actions";

export const dynamic = "force-dynamic";

const fmt = (d: string | Date) =>
  (typeof d === "string" ? new Date(d + "T12:00:00") : d).toLocaleDateString("fr-CA", { day: "numeric", month: "long", year: "numeric" });

export default async function RecalculStatutsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: moi } = await supabase.from("profiles").select("role").eq("id", user!.id).single();
  if (moi?.role !== "admin") redirect("/membres");

  const { corrections, sansNaissance, prospects, dejaBons } = await calculerRecalcul();
  const ref = fmt(dateReferenceAge());

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-5 py-10">
      <div>
        <Link href="/membres/admin" className="text-sm text-rof-poudre underline">
          ‹ Direction
        </Link>
        <h1 className="mt-2 font-condensed text-3xl font-bold uppercase text-rof-texte">Recalculer les statuts</h1>
        <p className="mt-1 text-sm text-rof-gris">
          Charte d&apos;âge Little League, baseball et softball : âge au <strong className="text-rof-texte">{ref}</strong>. Les prospects ne sont pas
          touchés : ils restent à accepter un par un.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          [corrections.length, "À corriger", corrections.length ? "text-rof-or" : "text-rof-gazon"],
          [dejaBons, "Déjà bons", "text-rof-gazon"],
          [prospects, "Prospects (inchangés)", "text-rof-gris"],
          [sansNaissance.length, "Sans date de naissance", sansNaissance.length ? "text-rof-rouge" : "text-rof-gris"],
        ].map(([n, l, c]) => (
          <div key={String(l)} className="rounded-xl border border-rof-ligne bg-rof-blanc p-3">
            <p className={`font-condensed text-3xl font-bold ${c}`}>{n}</p>
            <p className="text-xs text-rof-gris">{l}</p>
          </div>
        ))}
      </div>

      {corrections.length > 0 ? (
        <form action={appliquerRecalcul} className="flex flex-col gap-3">
          <div className="overflow-hidden rounded-xl border border-rof-ligne">
            <table className="w-full text-sm">
              <thead className="bg-rof-craie text-left font-condensed text-xs uppercase tracking-wide text-rof-gris">
                <tr>
                  <th className="w-10 px-3 py-2" />
                  <th className="px-3 py-2">Joueur·euse</th>
                  <th className="px-3 py-2">Naissance</th>
                  <th className="px-3 py-2">Actuel</th>
                  <th className="px-3 py-2">Charte</th>
                </tr>
              </thead>
              <tbody>
                {corrections.map((c) => (
                  <tr key={c.profileId} className="border-t border-rof-ligne bg-rof-blanc">
                    <td className="px-3 py-2">
                      <input type="checkbox" name="profile_id" value={c.profileId} defaultChecked aria-label={`Corriger ${c.nom}`} />
                    </td>
                    <td className="px-3 py-2">
                      <Link href={`/membres/admin/joueurs?id=${c.profileId}`} className="text-rof-texte hover:text-rof-or">
                        {c.nom}
                      </Link>
                    </td>
                    <td className="px-3 py-2 text-rof-gris">
                      {fmt(c.naissance)} · {c.age} ans
                    </td>
                    <td className="px-3 py-2 text-rof-gris line-through">{c.actuelNom}</td>
                    <td className="px-3 py-2 font-condensed text-base font-bold text-rof-or">
                      {c.nouveauNom} {c.nouveau > c.actuel ? "↑" : "↓"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-rof-gris">Décoche une ligne pour garder un statut voulu (surclassement, exception). Le statut est aussi recopié sur ses équipes.</p>
          <button
            type="submit"
            className="self-start rounded-full bg-rof-or px-5 py-2.5 font-condensed text-sm font-bold uppercase tracking-wide text-black"
          >
            Appliquer les corrections cochées
          </button>
        </form>
      ) : (
        <p className="rounded-xl border border-rof-gazon bg-rof-blanc p-4 text-sm text-rof-texte">Tous les statuts placés correspondent à la charte.</p>
      )}

      {sansNaissance.length > 0 && (
        <section>
          <h2 className="font-condensed text-lg font-bold uppercase text-rof-rouge">Sans date de naissance ({sansNaissance.length})</h2>
          <p className="text-xs text-rof-gris">Impossible de vérifier : compléter la date dans la fiche.</p>
          <ul className="mt-2 flex flex-col gap-1 text-sm">
            {sansNaissance.map((j) => (
              <li key={j.profileId}>
                <Link href={`/membres/admin/joueurs?id=${j.profileId}`} className="text-rof-poudre underline">
                  {j.nom}
                </Link>{" "}
                <span className="text-rof-gris">· {j.actuelNom}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
