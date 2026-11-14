import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { parcoursOuvert } from "@/lib/statuts";
import ProgrammeSprint from "@/components/membres/ProgrammeSprint";

export const metadata = { title: "Programme sprint · ROF Connect" };

export default async function SprintPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user!.id).single();

  // Réservé aux joueuses dont le statut n'est plus Prospect (la Direction et les entraîneurs y accèdent toujours).
  if (profile?.role === "member" && !(await parcoursOuvert(user!.id))) {
    return (
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-5 py-10">
        <h1 className="font-condensed text-3xl font-bold uppercase text-rof-texte">Programme sprint</h1>
        <div className="rounded-xl border border-rof-or bg-rof-blanc p-5">
          <p className="text-rof-texte">
            Le programme sprint sera disponible dès que la Direction aura accepté la joueuse et que son statut ne sera plus Prospect.
          </p>
          <p className="mt-2 text-sm text-rof-gris">
            The sprint program becomes available once the staff accepts the player and her status is no longer Prospect.
          </p>
          <Link href="/membres/moi" className="mt-4 inline-block text-sm text-rof-poudre underline">
            ‹ Retour
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-5 py-8">
      <div>
        <p className="font-condensed text-sm uppercase tracking-[0.3em] text-rof-poudre">Espace membres</p>
        <h1 className="mt-1 font-condensed text-3xl font-bold uppercase text-rof-texte">Programme sprint</h1>
        <p className="mt-1 text-sm text-rof-gris">6 semaines · 2 séances de 30 min par semaine, à faire de façon autonome.</p>
      </div>
      <ProgrammeSprint joueuse={{ id: user!.id }} />
    </main>
  );
}
