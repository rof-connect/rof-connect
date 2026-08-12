import Link from "next/link";

export default function ConfirmationInscriptionPage() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-5 py-10 text-center">
      <h1 className="font-condensed text-3xl font-bold uppercase text-rof-texte">Vérifie ton courriel</h1>
      <p className="mt-3 text-rof-gris">
        Ton compte a été créé. Clique sur le lien de confirmation qu&apos;on vient de t&apos;envoyer par courriel pour
        pouvoir te connecter.
      </p>
      <Link href="/connexion" className="mt-6 text-rof-poudre">
        Retour à la connexion
      </Link>
    </main>
  );
}
