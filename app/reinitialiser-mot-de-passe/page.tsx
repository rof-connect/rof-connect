import { getDictionnaire } from "@/lib/i18n/server";
import { LanguageToggle } from "@/components/i18n/LanguageToggle";
import { FormNouveauMotDePasse } from "@/components/auth/FormNouveauMotDePasse";

export default async function ReinitialiserMotDePassePage() {
  const { locale, t } = await getDictionnaire();
  const c = t.nouveauMotDePasse;

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-5 py-10">
      <div className="mb-2">
        <LanguageToggle locale={locale} />
      </div>
      <p className="font-condensed text-sm uppercase tracking-[0.3em] text-rof-poudre">Royal On Field</p>
      <h1 className="mt-1 font-condensed text-3xl font-bold uppercase text-rof-texte">{c.titre}</h1>
      <p className="mt-3 text-center text-sm text-rof-gris">{c.intro}</p>

      <FormNouveauMotDePasse t={c} />
    </main>
  );
}
