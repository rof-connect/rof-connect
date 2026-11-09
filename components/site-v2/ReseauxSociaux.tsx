import { IcFacebook, IcInstagram } from "@/components/programme/Icones";
import { FIELDLEVEL, RESEAUX, compteInstagram, lienFieldLevel, compteTiktok, pageFacebook, type Sport } from "@/lib/site-v2/donnees";

const IcTiktok = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden focusable="false">
    <path d="M14 3v11.2a3.7 3.7 0 1 1-3.7-3.7" />
    <path d="M14 3c.4 2.5 2.1 4.2 4.7 4.4" />
  </svg>
);

const IcFieldLevel = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden focusable="false">
    <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3Z" />
    <path d="M9 15.5V9h5M9 12h4" />
  </svg>
);

/** « Suis-nous » : logos des réseaux sociaux et liens (aucune intégration externe pour l'instant). */
export function ReseauxSociaux({ sport }: { sport: Sport }) {
  const insta = compteInstagram(RESEAUX[sport].instagram);
  const fb = pageFacebook(RESEAUX[sport].facebook);
  const tt = compteTiktok(RESEAUX[sport].tiktok);
  const fl = lienFieldLevel(FIELDLEVEL[sport]);

  const liens = [
    insta && { nom: "Instagram", url: `https://www.instagram.com/${insta}/`, compte: `@${insta}`, icone: <IcInstagram className="h-7 w-7" /> },
    fb && { nom: "Facebook", url: fb, compte: fb.replace("https://www.facebook.com/", ""), icone: <IcFacebook className="h-7 w-7" /> },
    fl && { nom: "FieldLevel", url: fl, compte: "Profil de recrutement", icone: <IcFieldLevel /> },
    tt && { nom: "TikTok", url: `https://www.tiktok.com/@${tt}`, compte: `@${tt}`, icone: <IcTiktok /> },
  ].filter(Boolean) as { nom: string; url: string; compte: string; icone: React.ReactNode }[];
  if (!liens.length) return null;

  return (
    <section className="block dark reseaux-section" id="reseaux">
      <div className="wrap">
        <div className="head">
          <h2>
            Suis-nous <em>en ligne</em>
          </h2>
          <span className="pill hl">#EarnTheCrown</span>
        </div>
        <ul className="reseaux-liens">
          {liens.map((l) => (
            <li key={l.nom}>
              <a href={l.url} target="_blank" rel="noopener noreferrer" aria-label={`${l.nom} : ${l.compte} (nouvel onglet)`}>
                <span className="ico">{l.icone}</span>
                <span className="txt">
                  <b>{l.nom}</b>
                  <small>{l.compte}</small>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
