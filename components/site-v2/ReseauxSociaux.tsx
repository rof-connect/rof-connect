import Script from "next/script";
import { FACEBOOK, INSTAGRAM, TIKTOK, compteInstagram, compteTiktok, pageFacebook } from "@/lib/site-v2/donnees";

const enDev = process.env.NODE_ENV !== "production";

function Rappel({ reseau, variable }: { reseau: string; variable: string }) {
  return (
    <div className="empty">
      <h3>{reseau}</h3>
      <p>Aperçu : ajoute le compte pour afficher l&apos;intégration ici ({variable}).</p>
    </div>
  );
}

/** « Suis-nous » en bas du site : Instagram, Facebook et TikTok intégrés (comptes publics). */
export function ReseauxSociaux() {
  const insta = compteInstagram(INSTAGRAM);
  const fb = pageFacebook(FACEBOOK);
  const tt = compteTiktok(TIKTOK);
  if (!insta && !fb && !tt && !enDev) return null;

  return (
    <section className="block dark" id="reseaux">
      <div className="wrap">
        <div className="head">
          <h2>
            Suis-nous
            <br />
            <em>en ligne</em>
          </h2>
          <span className="pill hl">#EarnTheCrown</span>
        </div>

        <div className="reseaux">
          <div className="reseau">
            <h3>Instagram</h3>
            {insta ? (
              <>
                <div className="insta-embed">
                  <iframe src={`https://www.instagram.com/${insta}/embed`} title={`Publications Instagram de @${insta}`} loading="lazy" scrolling="no" referrerPolicy="strict-origin-when-cross-origin" />
                </div>
                <a className="reseau-lien" href={`https://www.instagram.com/${insta}/`} target="_blank" rel="noopener noreferrer">
                  @{insta} sur Instagram →
                </a>
              </>
            ) : (
              enDev && <Rappel reseau="Instagram" variable="NEXT_PUBLIC_INSTAGRAM_URL" />
            )}
          </div>

          <div className="reseau">
            <h3>Facebook</h3>
            {fb ? (
              <>
                <div className="insta-embed">
                  <iframe
                    src={`https://www.facebook.com/plugins/page.php?href=${encodeURIComponent(fb)}&tabs=timeline&width=500&height=640&small_header=true&adapt_container_width=true&hide_cover=false&show_facepile=false`}
                    title="Publications Facebook de Royal On Field"
                    loading="lazy"
                    scrolling="no"
                    referrerPolicy="strict-origin-when-cross-origin"
                  />
                </div>
                <a className="reseau-lien" href={fb} target="_blank" rel="noopener noreferrer">
                  Notre page Facebook →
                </a>
              </>
            ) : (
              enDev && <Rappel reseau="Facebook" variable="NEXT_PUBLIC_FACEBOOK_URL" />
            )}
          </div>

          <div className="reseau">
            <h3>TikTok</h3>
            {tt ? (
              <>
                <div className="tiktok-boite">
                  <blockquote className="tiktok-embed" cite={`https://www.tiktok.com/@${tt}`} data-unique-id={tt} data-embed-type="creator" style={{ maxWidth: 780, minWidth: 288 }}>
                    <section>
                      <a target="_blank" rel="noopener noreferrer" href={`https://www.tiktok.com/@${tt}`}>
                        @{tt}
                      </a>
                    </section>
                  </blockquote>
                </div>
                <Script src="https://www.tiktok.com/embed.js" strategy="lazyOnload" />
                <a className="reseau-lien" href={`https://www.tiktok.com/@${tt}`} target="_blank" rel="noopener noreferrer">
                  @{tt} sur TikTok →
                </a>
              </>
            ) : (
              enDev && <Rappel reseau="TikTok" variable="NEXT_PUBLIC_TIKTOK_URL" />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
