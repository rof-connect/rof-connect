import Link from "next/link";
import { getDictionnaire } from "@/lib/i18n/server";
import { LanguageToggle } from "@/components/i18n/LanguageToggle";

export default async function MotDePasseOublieEnvoyePage() {
  const { locale, t } = await getDictionnaire();
  const c = t.motDePasseOublie;

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-5 py-10 text-center">
      <div className="mb-2">
        <LanguageToggle locale={locale} />
      </div>
      <h1 className="font-condensed text-3xl font-bold uppercase text-rof-texte">{c.confirmationTitre}</h1>
      <p className="mt-3 text-rof-gris">{c.confirmationTexte}</p>
      <Link href="/connexion" className="mt-6 text-rof-poudre">
        {c.retour}
      </Link>
    </main>
  );
}
