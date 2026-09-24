import { createAdminClient } from "@/lib/supabase/admin";
import Link from "next/link";
import { getDictionnaire } from "@/lib/i18n/server";
import { LanguageToggle } from "@/components/i18n/LanguageToggle";
import { FormInscription } from "@/components/inscription/FormInscription";

export default async function InscriptionPage({
  searchParams,
}: {
  searchParams: Promise<{ erreur?: string; type?: string }>;
}) {
  const { erreur, type } = await searchParams;
  const { locale, t } = await getDictionnaire();
  const i = t.inscription;
  const admin = createAdminClient();
  const { data: teams } = await admin
    .from("teams")
    .select("id, name, sport")
    .eq("archived", false)
    .order("name");

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-5 py-10">
      <div className="mb-2">
        <LanguageToggle locale={locale} />
      </div>
      <p className="font-condensed text-sm uppercase tracking-[0.3em] text-rof-poudre">Royal On Field</p>
      <h1 className="mt-1 font-condensed text-3xl font-bold uppercase text-rof-texte">{i.titre}</h1>
      <p className="mt-2 text-sm text-rof-gris">{i.intro}</p>

      {erreur && (
        <div className="mt-4 rounded-lg bg-rof-rouge/10 px-3 py-2 text-sm text-rof-rouge">{erreur}</div>
      )}

      <FormInscription teams={teams ?? []} i={i} typeInitial={type === "entraineur" ? "entraineur" : "athlete"} />

      <p className="mt-6 text-center text-sm text-rof-gris">
        {i.dejaInscrit} <Link href="/connexion" className="text-rof-poudre">{i.seConnecter}</Link>
      </p>
    </main>
  );
}
