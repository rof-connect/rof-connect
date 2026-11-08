import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getDictionnaire } from "@/lib/i18n/server";
import { FicheAthlete } from "@/components/membres/FicheAthlete";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Direction : le profil d'une joueuse exactement comme elle le voit (lecture seule). */
export default async function ProfilVuParLaJoueusePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!UUID.test(id)) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: moi } = await supabase.from("profiles").select("role").eq("id", user!.id).single();
  if (moi?.role !== "admin") redirect("/membres");

  const admin = createAdminClient();
  const { data: joueuse } = await admin.from("profiles").select("full_name").eq("id", id).maybeSingle();
  if (!joueuse) notFound();

  const { t, locale } = await getDictionnaire();

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-5 py-8">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Link href="/membres/admin/joueurs" className="text-sm text-rof-poudre underline">
          ‹ Gestion des joueurs
        </Link>
        <Link href={`/membres/admin/joueurs?id=${id}`} className="text-sm font-semibold text-rof-or underline">
          Modifier la fiche
        </Link>
      </div>
      <p className="rounded-lg border border-rof-or bg-rof-craie px-3 py-2 text-sm text-rof-texte">
        Aperçu : voici le profil tel que <strong>{joueuse.full_name || "la joueuse"}</strong> le voit. Lecture seule : rien ne peut être modifié d&apos;ici.
      </p>
      <FicheAthlete client={admin} profileId={id} t={t} locale={locale} mode="moi" apercu />
    </main>
  );
}
