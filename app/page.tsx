import Link from "next/link";
import ConnexionPage from "./connexion/page";
import { getDictionnaire } from "@/lib/i18n/server";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ erreur?: string; suite?: string }>;
}) {
  const { t } = await getDictionnaire();

  return (
    <>
      <ConnexionPage searchParams={searchParams} />
      <p className="pb-4 text-center">
        <Link href="/parcours" className="font-condensed text-sm uppercase tracking-[0.2em] text-rof-or underline">
          {t.connexion.parcours}
        </Link>
      </p>
      <p className="pb-8 text-center font-condensed text-sm uppercase tracking-[0.3em] text-rof-gris">
        {t.connexion.aVenir}
      </p>
    </>
  );
}
