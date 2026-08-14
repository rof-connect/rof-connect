import Link from "next/link";
import { connecter } from "./actions";
import { getDictionnaire } from "@/lib/i18n/server";
import { LanguageToggle } from "@/components/i18n/LanguageToggle";

export default async function ConnexionPage({
  searchParams,
}: {
  searchParams: Promise<{ erreur?: string; suite?: string }>;
}) {
  const { erreur, suite } = await searchParams;
  const { locale, t } = await getDictionnaire();
  const c = t.connexion;

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-5 py-10">
      <div className="mb-2">
        <LanguageToggle locale={locale} />
      </div>
      <p className="font-condensed text-sm uppercase tracking-[0.3em] text-rof-poudre">Royal On Field</p>
      <h1 className="mt-1 font-condensed text-3xl font-bold uppercase text-rof-texte">{c.titre}</h1>

      {erreur && (
        <div className="mt-4 w-full rounded-lg bg-rof-rouge/10 px-3 py-2 text-sm text-rof-rouge">{erreur}</div>
      )}

      <form action={connecter} className="mt-6 flex w-full flex-col gap-4">
        <input type="hidden" name="suite" value={suite ?? "/membres"} />
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-rof-gris">{c.courriel}</p>
          <input
            name="email"
            type="email"
            required
            className="w-full rounded-lg border border-rof-ligne bg-rof-craie px-3 py-2 text-rof-texte"
          />
        </div>
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-rof-gris">{c.motDePasse}</p>
          <input
            name="password"
            type="password"
            required
            className="w-full rounded-lg border border-rof-ligne bg-rof-craie px-3 py-2 text-rof-texte"
          />
        </div>
        <button
          type="submit"
          className="mt-2 w-full rounded-xl bg-rof-or py-3 font-condensed text-lg font-bold uppercase tracking-wider text-white"
        >
          {c.entrer}
        </button>
      </form>

      <Link href="/mot-de-passe-oublie" className="mt-4 text-center text-sm text-rof-poudre">
        {c.motDePasseOublie}
      </Link>

      <p className="mt-6 text-center text-sm text-rof-gris">
        {c.pasDeCompte} <Link href="/inscription" className="text-rof-poudre">{c.sinscrire}</Link>
      </p>
    </main>
  );
}
