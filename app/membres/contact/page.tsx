type Personne = { nom: string; titre: string; tel?: string; info?: string };

const EQUIPE: Personne[] = [
  { nom: "Francois Martel", titre: "Directeur financier", tel: "514-241-6540" },
  { nom: "Eric Dostaler", titre: "Directeur administration", tel: "514-887-0721" },
  { nom: "Nicholas Di Peco", titre: "Directeur performance", tel: "514-234-4453" },
  { nom: "Bryan Riley", titre: "Directeur adjoint performance" },
  { nom: "Carlos Farigliano", titre: "Entraîneur des lanceuses" },
  { nom: "Olivier Bertrand", titre: "Entraîneur des receveurs" },
  { nom: "Bruny Surin", titre: "Consultant sprint" },
  { nom: "Patrick Kelly", titre: "Préparation mentale" },
  { nom: "Alexandra Granger", titre: "Préparation physique", info: "Information à venir" },
  { nom: "Oswaldo Peley", titre: "Directeur prospect" },
];

const PROGRAMME_SCOLAIRE = ["NPU 12e année (en ligne)", "Collège L'Assomption"];

export default function ContactPage() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-5 py-10">
      <div>
        <p className="font-condensed text-sm uppercase tracking-[0.3em] text-rof-poudre">Espace membres</p>
        <h1 className="mt-1 font-condensed text-3xl font-bold uppercase text-rof-texte">Contact</h1>
      </div>

      <section className="flex flex-col gap-3 rounded-xl border border-rof-ligne bg-rof-blanc p-4">
        <h2 className="font-condensed text-xl font-bold uppercase tracking-wide text-rof-or">
          Spécialiste recrutement / scolaire
        </h2>
        <p className="text-sm text-rof-texte">
          Nous recommandons à toutes les joueuses qui veulent aller plus loin dans le processus d&apos;être accompagnées
          par <strong>Athlete Recruiting Centre</strong>.
        </p>
        <p className="text-sm text-rof-texte">Cet investissement vous suivra au cours des processus importants.</p>
        <div className="flex flex-col gap-1 text-sm">
          <a href="mailto:aurelie@athlete-centre.ca" className="w-fit text-rof-poudre underline">
            aurelie@athlete-centre.ca
          </a>
          <a href="https://www.athlete-centre.ca" target="_blank" rel="noreferrer" className="w-fit text-rof-poudre underline">
            www.athlete-centre.ca
          </a>
        </div>
        <div className="mt-1 rounded-lg bg-rof-craie p-3">
          <p className="font-condensed text-lg font-bold uppercase text-rof-texte">Aurélie Leblanc</p>
          <p className="text-sm text-rof-gris">Information à venir</p>
        </div>
      </section>

      <section className="flex flex-col gap-3 rounded-xl border border-rof-ligne bg-rof-blanc p-4">
        <h2 className="font-condensed text-xl font-bold uppercase tracking-wide text-rof-or">Programme scolaire</h2>
        <div className="flex flex-col gap-3">
          {PROGRAMME_SCOLAIRE.map((nom) => (
            <div key={nom} className="rounded-lg bg-rof-craie p-3">
              <p className="font-condensed text-lg font-bold uppercase text-rof-texte">{nom}</p>
              <p className="text-sm text-rof-gris">Information à venir</p>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3 rounded-xl border border-rof-ligne bg-rof-blanc p-4">
        <h2 className="font-condensed text-xl font-bold uppercase tracking-wide text-rof-or">Royal On Field</h2>
        <div className="flex flex-col gap-3">
          {EQUIPE.map((p) => (
            <div key={p.nom} className="rounded-lg bg-rof-craie p-3">
              <p className="font-condensed text-lg font-bold uppercase text-rof-texte">{p.nom}</p>
              <p className="text-sm text-rof-gris">{p.titre}</p>
              {p.tel && (
                <a href={`tel:+1${p.tel.replace(/\D/g, "")}`} className="text-sm text-rof-poudre underline">
                  {p.tel}
                </a>
              )}
              {p.info && <p className="text-sm text-rof-gris">{p.info}</p>}
            </div>
          ))}
        </div>
        <a href="mailto:royal@lentrepotdubaseball.com" className="w-fit text-sm text-rof-poudre underline">
          royal@lentrepotdubaseball.com
        </a>
      </section>
    </main>
  );
}
