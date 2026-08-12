import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="font-condensed text-sm uppercase tracking-[0.3em] text-rof-poudre">
        Royal On Field
      </p>
      <h1 className="font-condensed text-4xl font-semibold uppercase tracking-wide text-rof-texte">
        ROF Connect
      </h1>
      <p className="text-rof-gris">Site en construction — l&apos;espace membres est déjà accessible.</p>
      <div className="mt-4 flex gap-3">
        <Link href="/connexion" className="rounded-xl bg-rof-or px-5 py-2.5 font-condensed font-bold uppercase tracking-wide text-white">
          Connexion
        </Link>
        <Link href="/inscription" className="rounded-xl border border-rof-poudre px-5 py-2.5 font-condensed font-bold uppercase tracking-wide text-rof-poudre">
          Inscription
        </Link>
      </div>
    </main>
  );
}
