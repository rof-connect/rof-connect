"use client";

import { useMemo, useState } from "react";
import { soumettreParcours, soumettreParcoursMembre } from "@/app/parcours/actions";
import { calculer, plage, margeTexte, ouverture, fmtDate, DIVISIONS, NIVEAUX } from "@/lib/parcours/calcul";

const CSS = `
.qp{--navy:#12294F;--gold:#D9B44A;--goldd:#D9B44A;--fg:#FFFFFF;--mut:#A8A8A8;--line:#2A2A2A;--bg:#111111;--card:#0A0A0A;--soft:#1E1A0C;--bad:#E0524A;--badbg:#2A1210;--ok:#4FB477;--okbg:#0F2218;
  font:16px/1.5 system-ui,-apple-system,"Segoe UI",Arial,sans-serif;color:var(--fg);padding:0 0 40px}
.qp *{box-sizing:border-box}
.qp-top{border-bottom:1px solid var(--line);color:#EAF0F8;padding:26px 16px}
.qp-in{max-width:760px;margin:0 auto}
.qp-kick{font-size:12px;letter-spacing:.18em;text-transform:uppercase;color:var(--gold);font-weight:600}
.qp h1{font:700 clamp(28px,7vw,42px)/1.05 "Arial Narrow",Arial,sans-serif;text-transform:uppercase;margin:8px 0 10px}
.qp h1 span{color:var(--gold)}
.qp-wrap{max-width:760px;margin:24px auto 0;padding:0 16px}
.qp h2{font:700 21px "Arial Narrow",Arial,sans-serif;text-transform:uppercase;margin:0 0 4px}
.qp-sec{background:var(--card);border:1px solid var(--line);border-top:3px solid var(--gold);border-radius:6px;padding:20px;margin-bottom:16px}
.qp-hint{margin:0 0 16px;color:var(--mut);font-size:14px}
.qp-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px 16px}.qp-grid>*{min-width:0}.qp-full{grid-column:1/-1}
@media(max-width:560px){.qp-grid{grid-template-columns:1fr}}
.qp label,.qp .qp-lab{display:block;font-weight:600;font-size:14px;margin-bottom:4px}
.qp .qp-sub{font-weight:400;color:var(--mut);font-size:13px;display:block}
.qp input[type=text],.qp input[type=date],.qp input[type=email],.qp input[type=tel],.qp select,.qp textarea{width:100%;font:inherit;color:var(--fg);background:var(--bg);border:1px solid var(--line);border-radius:5px;padding:10px 12px;min-height:44px}
.qp textarea{min-height:76px}
.qp input:focus,.qp select:focus,.qp textarea:focus,.qp button:focus-visible{outline:2px solid #5B8FEA;outline-offset:1px}
.qp-opts{display:grid;gap:8px}
.qp .qp-opt{display:flex;gap:10px;align-items:flex-start;padding:10px 12px;border:1px solid var(--line);border-radius:5px;background:var(--bg);cursor:pointer;font-weight:400;margin:0}
.qp .qp-opt input{margin-top:4px;accent-color:var(--gold);width:18px;height:18px;flex:none}
.qp .qp-opt.on{border-color:var(--gold);background:var(--soft)}
.qp-clock{background:var(--navy);color:#EAF0F8;border-radius:6px;padding:18px 20px;margin-bottom:16px}
.qp-big{font:700 30px/1.1 "Arial Narrow",Arial,sans-serif;color:var(--gold);text-transform:uppercase;margin:2px 0 6px}
.qp-alert{background:var(--badbg);border-left:4px solid var(--bad);padding:10px 14px;border-radius:4px;margin-bottom:12px;font-size:14.5px}
.qp-pc{background:var(--card);border:1px solid var(--line);border-radius:6px;padding:16px 18px;margin-bottom:12px;display:grid;grid-template-columns:44px 1fr;gap:4px 14px}
.qp-pc>*{min-width:0}.qp-pc.best{border-color:var(--gold);box-shadow:0 0 0 1px var(--gold)}
.qp-L{font:700 40px/1 "Arial Narrow",Arial,sans-serif;color:var(--goldd)}
.qp-pc h3{font:700 18px "Arial Narrow",Arial,sans-serif;text-transform:uppercase;margin:0}
.qp-tag{display:inline-block;font-size:11px;letter-spacing:.08em;text-transform:uppercase;font-weight:600;padding:2px 8px;border-radius:99px;margin-left:8px;vertical-align:2px;background:var(--gold);color:#000}
.qp-tag.ok{background:var(--okbg);color:var(--ok)}.qp-tag.risk{background:var(--badbg);color:var(--bad)}
.qp-pc dl{grid-column:2;margin:8px 0 0;display:grid;grid-template-columns:max-content 1fr;gap:3px 14px;font-size:14.5px}
.qp-pc dt{color:var(--mut)}.qp-pc dd{margin:0}
.qp-why{grid-column:2;margin:8px 0 0;font-size:14px;padding:8px 10px;border-left:3px solid var(--gold);background:var(--soft)}
.qp-why.w{border-color:var(--bad);background:var(--badbg)}
.qp-btn{font:700 16px system-ui,Arial,sans-serif;min-height:46px;padding:10px 22px;border-radius:5px;cursor:pointer;border:1px solid var(--gold);background:var(--gold);color:#000}
.qp-btn[disabled]{opacity:.55;cursor:not-allowed}
.qp-msg{margin-top:12px;padding:12px 14px;border-radius:5px;font-size:15px}
.qp-msg.ok{background:var(--okbg);color:var(--ok)}.qp-msg.err{background:var(--badbg);color:var(--bad)}
.qp-note{font-size:13px;color:var(--mut)}
.qp-hp{position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden}
`;

type Formulaire = {
  prenom: string; nom: string; dob: string; position: string; equipe: string; fin: string; niveau: string; projet: string; duree: string;
  divisions: string[]; anglais: string; domaine: string; objectifs: string; parent: string; courrielParent: string; telephone: string;
  consentement: boolean; siteweb: string;
};

const VIDE: Formulaire = {
  prenom: '', nom: '', dob: '', position: '', equipe: '', fin: '', niveau: '', projet: 'idk', duree: 'idk',
  divisions: [], anglais: '', domaine: '', objectifs: '', parent: '', courrielParent: '', telephone: '',
  consentement: false, siteweb: '',
};

function Choix({ name, valeur, onChange, options }: { name: string; valeur: string; onChange: (v: string) => void; options: string[][] }) {
  return (
    <div className="qp-opts" role="radiogroup">
      {options.map(([v, titre, sous]) => (
        <label key={v} className={'qp-opt' + (valeur === v ? ' on' : '')}>
          <input type="radio" name={name} checked={valeur === v} onChange={() => onChange(v)} />
          <span><b>{titre}</b>{sous && <span className="qp-sub">{sous}</span>}</span>
        </label>
      ))}
    </div>
  );
}

export function QuestionnaireParcours({ membre = false, initial = {} }: { membre?: boolean; initial?: Partial<Formulaire> }) {
  const [f, setF] = useState<Formulaire>({ ...VIDE, ...initial });
  const [etat, setEtat] = useState<{ statut: 'repos' | 'envoi' | 'ok' | 'erreur'; message: string }>({ statut: 'repos', message: '' });
  const maj = (k: keyof Formulaire) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setF((s) => ({ ...s, [k]: e.target.value }));
  const now = useMemo(() => new Date(), []);
  const r = useMemo(() => calculer({ dob: f.dob, fin: f.fin, niveau: f.niveau, projet: f.projet, duree: f.duree }, now), [f.dob, f.fin, f.niveau, f.projet, f.duree, now]);

  const basculerDiv = (d: string) => setF((s) => ({ ...s, divisions: s.divisions.includes(d) ? s.divisions.filter((x) => x !== d) : [...s.divisions, d] }));
  const pret = r && f.prenom.trim() && f.nom.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.courrielParent.trim()) && f.consentement;

  async function envoyer(e: React.FormEvent) {
    e.preventDefault();
    if (!pret || etat.statut === 'envoi') return;
    setEtat({ statut: 'envoi', message: '' });
    try {
      const data = await (membre ? soumettreParcoursMembre(f) : soumettreParcours(f));
      if (data.ok) setEtat({ statut: 'ok', message: data.message || "Merci! Le bilan vient d'être envoyé à " + f.courrielParent.trim() + '. Pensez à vérifier vos courriels indésirables.' });
      else setEtat({ statut: 'erreur', message: data.erreur || 'Une erreur est survenue. Réessayez dans un instant.' });
    } catch {
      setEtat({ statut: 'erreur', message: 'Connexion impossible. Vérifiez votre réseau et réessayez.' });
    }
  }

  return (
    <div className="qp">
      <style>{CSS}</style>
      <header className="qp-top"><div className="qp-in">
        <div className="qp-kick">Royal Softball On Field · Repentigny</div>
        <h1>Questionnaire<br /><span>de parcours</span></h1>
        <p style={{ margin: 0, maxWidth: '56ch' }}>Quelques questions, cinq minutes. Vos réponses servent à calculer les dates et le nombre de saisons de chaque parcours. Vous recevrez le bilan par courriel.</p>
      </div></header>

      <form className="qp-wrap" onSubmit={envoyer} noValidate>
        <section className="qp-sec">
          <h2>1 · La joueuse</h2>
          <p className="qp-hint">Seules la date de naissance et l'année de fin du secondaire sont nécessaires au calcul.</p>
          <div className="qp-grid">
            <div><label htmlFor="qp-prenom">Prénom de la joueuse</label><input id="qp-prenom" type="text" value={f.prenom} onChange={maj('prenom')} autoComplete="off" /></div>
            <div><label htmlFor="qp-nom">Nom</label><input id="qp-nom" type="text" value={f.nom} onChange={maj('nom')} autoComplete="off" /></div>
            <div><label htmlFor="qp-dob">Date de naissance</label><input id="qp-dob" type="date" min="2003-01-01" max="2016-12-31" value={f.dob} onChange={maj('dob')} /></div>
            <div><label htmlFor="qp-pos">Position principale</label>
              <select id="qp-pos" value={f.position} onChange={maj('position')}><option value="">—</option>{['Lanceuse', 'Receveuse', 'Avant-champ', 'Voltigeuse', 'Polyvalente'].map((p) => <option key={p}>{p}</option>)}</select></div>
            <div className="qp-full"><label htmlFor="qp-eq">Équipe / niveau actuel <span className="qp-sub">Ex. : On Field, Provincial, Midget AAA…</span></label><input id="qp-eq" type="text" value={f.equipe} onChange={maj('equipe')} autoComplete="off" /></div>
          </div>
        </section>

        <section className="qp-sec">
          <h2>2 · Les études</h2>
          <p className="qp-hint">Le parcours scolaire détermine l'année d'arrivée au collège américain.</p>
          <div className="qp-grid">
            <div><label htmlFor="qp-fin">Année où elle termine le secondaire V <span className="qp-sub">Fin des classes, en juin</span></label>
              <select id="qp-fin" value={f.fin} onChange={maj('fin')}><option value="">—</option>{[2026, 2027, 2028, 2029, 2030, 2031].map((a) => <option key={a}>{a}</option>)}</select></div>
            <div><label htmlFor="qp-niv">Niveau actuel</label>
              <select id="qp-niv" value={f.niveau} onChange={maj('niveau')}><option value="">—</option>{NIVEAUX.map((n) => <option key={n}>{n}</option>)}</select></div>
            <div className="qp-full"><span className="qp-lab">Quel projet scolaire lui parle le plus?</span>
              <Choix name="projet" valeur={f.projet} onChange={(v) => setF((s) => ({ ...s, projet: v }))} options={[
                ['dip', 'Un diplôme québécois (DEC)', 'Études en personne, filet de sécurité si le plan américain change.'],
                ['direct', '12e année en ligne', "Latitude pour l'entraînement, les voyages (tournois, camps) et le développement, puis le collège américain."],
                ['idk', 'Pas décidé entre le DEC et la 12e année en ligne', 'Tous les parcours sont présentés ci-dessous.']]} /></div>
            <div className="qp-full"><span className="qp-lab">Combien de temps pour se développer avant l'arrivée?</span>
              <Choix name="duree" valeur={f.duree} onChange={(v) => setF((s) => ({ ...s, duree: v }))} options={[
                ['1', 'Un an suffit', 'Niveau et dossier déjà bien avancés.'],
                ['2', 'Deux ans, pour bâtir un dossier solide', 'Développement physique et technique, vidéos, visites.'],
                ['idk', 'Pas encore décidé : 1 an ou 2 ans', 'Tous les parcours sont présentés ci-dessous.']]} /></div>
          </div>
        </section>

        <section className="qp-sec">
          <h2>3 · Le projet sportif</h2>
          <p className="qp-hint">Ces réponses n'influencent pas le calcul : elles préparent la rencontre.</p>
          <div className="qp-grid">
            <div className="qp-full"><span className="qp-lab">Divisions envisagées <span className="qp-sub">Plusieurs choix possibles</span></span>
              <div className="qp-opts">{DIVISIONS.map((d) => (
                <label key={d} className={'qp-opt' + (f.divisions.includes(d) ? ' on' : '')}><input type="checkbox" checked={f.divisions.includes(d)} onChange={() => basculerDiv(d)} /><span>{d.replace('NCAA D', 'NCAA Division ')}</span></label>))}</div></div>
            <div><label htmlFor="qp-ang">Niveau d'anglais</label>
              <select id="qp-ang" value={f.anglais} onChange={maj('anglais')}><option value="">—</option>{['Débutant', 'Intermédiaire', 'Avancé', 'Bilingue'].map((a) => <option key={a}>{a}</option>)}</select></div>
            <div><label htmlFor="qp-dom">Domaine d'études visé</label><input id="qp-dom" type="text" value={f.domaine} onChange={maj('domaine')} placeholder="Ex. : kinésiologie, sciences, gestion" /></div>
            <div className="qp-full"><label htmlFor="qp-obj">Objectifs et questions pour la rencontre</label><textarea id="qp-obj" value={f.objectifs} onChange={maj('objectifs')} /></div>
          </div>
        </section>

        {r && (
          <div aria-live="polite">
            <div className="qp-clock"><div className="qp-kick">Sa date repère</div><div className="qp-big">Automne {r.repere}</div>
              <p style={{ margin: 0, fontSize: 14.5 }}>{f.prenom.trim() || 'La joueuse'} atteint 19 ans le {fmtDate(r.anniversaire19)}. L'horloge de cinq ans démarre au plus tard à la rentrée de septembre {r.repere}, même sans études collégiales.</p></div>
            {r.alertes.map((a: string, n: number) => <div key={n} className="qp-alert">{a}</div>)}
            <h2 style={{ marginBottom: 10 }}>Les parcours possibles</h2>
            {r.parcours.map((o) => {
              let why = ''; let w = false;
              if (o.ceg && o.worst < o.best) { why = 'Selon la lecture du NCAA, le cégep peut démarrer l\'horloge dès l\'entrée (automne ' + r.fin + ') : ' + o.worst + ' saison' + (o.worst > 1 ? 's' : '') + ' au lieu de ' + o.best + '. À confirmer par écrit avant l\'inscription.'; w = true; }
              else if (!o.ceg && o.marge < 0) { why = 'L\'arrivée tombe après la date repère : ' + (5 - o.worst) + ' saison(s) perdue(s).'; w = true; }
              else if (!o.ceg && o.marge > 0) why = 'Cinq saisons garanties, avec une année de marge si le plan change.';
              else if (!o.ceg) why = 'Cinq saisons, mais sans marge : tout allongement coûte une saison.';
              return (
                <div key={o.k} className="qp-pc">
                  <div className="qp-L">{o.k}</div>
                  <div><h3>{o.n}</h3><div className="qp-note">{o.len}</div></div>
                  <dl>
                    <dt>Arrivée au NCAA</dt><dd>Automne {o.entree}</dd>
                    <dt>Saisons</dt><dd><b>{plage(o.worst, o.best)} sur 5</b></dd>
                    <dt>Marge</dt><dd>{margeTexte(o)}</dd>
                    <dt>Signature</dt><dd>Ouvre en {o.signature}</dd>
                    <dt>Contacts D2</dt><dd>{ouverture(o.d2, now)}</dd>
                    <dt>Contacts D1</dt><dd>{ouverture(o.d1, now)}</dd>
                    {o.sram && (<><dt>Demande SRAM</dt><dd>{o.sram} <i className="qp-note">(à confirmer)</i></dd></>)}
                  </dl>
                  {why && <p className={'qp-why' + (w ? ' w' : '')}>{why}</p>}
                  {o.plus && <p className="qp-why"><b>Avantage :</b> {o.plus}</p>}
                  {o.moins && <p className="qp-why w"><b>À considérer :</b> {o.moins}</p>}
                </div>
              );
            })}
            <p className="qp-note">D3, NAIA et NJCAA : contacts permis en tout temps. Grande fenêtre de contact d'été : du 12 juin au 31 juillet. Ces indications servent à la discussion et ne remplacent pas le plan individuel.</p>
          </div>
        )}
        {!r && <p className="qp-note">Entrez la date de naissance et l'année de fin du secondaire pour voir les parcours.</p>}

        <section className="qp-sec" style={{ marginTop: 16 }}>
          <h2>4 · Recevoir le bilan par courriel</h2>
          <p className="qp-hint">Le bilan de la joueuse (PDF) est envoyé au parent ou tuteur.</p>
          <div className="qp-grid">
            <div><label htmlFor="qp-par">Nom du parent / tuteur</label><input id="qp-par" type="text" value={f.parent} onChange={maj('parent')} autoComplete="name" /></div>
            <div><label htmlFor="qp-cour">Courriel du parent / tuteur</label><input id="qp-cour" type="email" value={f.courrielParent} onChange={maj('courrielParent')} autoComplete="email" /></div>
            <div className="qp-full"><label htmlFor="qp-tel">Téléphone <span className="qp-sub">Facultatif</span></label><input id="qp-tel" type="tel" value={f.telephone} onChange={maj('telephone')} autoComplete="tel" /></div>
            <div className="qp-full qp-hp" aria-hidden="true"><label>Ne pas remplir<input type="text" tabIndex={-1} autoComplete="off" value={f.siteweb} onChange={maj('siteweb')} /></label></div>
            <div className="qp-full">
              <label className={'qp-opt' + (f.consentement ? ' on' : '')}>
                <input type="checkbox" checked={f.consentement} onChange={(e) => setF((s) => ({ ...s, consentement: e.target.checked }))} />
                <span>Je suis le parent ou le tuteur de la joueuse, ou j'ai son autorisation. J'accepte que Royal On Field conserve ces renseignements pour préparer la rencontre et m'envoyer le bilan par courriel. Je peux demander leur accès ou leur retrait en tout temps.</span>
              </label></div>
          </div>
          <div style={{ marginTop: 14 }}>
            <button className="qp-btn" type="submit" disabled={!pret || etat.statut === 'envoi'}>{etat.statut === 'envoi' ? 'Envoi en cours…' : 'Recevoir le bilan par courriel'}</button>
            {!pret && <p className="qp-note" style={{ marginTop: 8 }}>Pour envoyer : date de naissance, année de fin du secondaire, nom de la joueuse, courriel du parent et consentement.</p>}
          </div>
          {etat.statut === 'ok' && <div className="qp-msg ok" role="status">{etat.message}</div>}
          {etat.statut === 'erreur' && <div className="qp-msg err" role="alert">{etat.message}</div>}
        </section>
        <p className="qp-note">Les calculs sont informatifs et se confirment par écrit auprès du NCAA Eligibility Center. L'admissibilité est décidée uniquement par le NCAA.</p>
      </form>
    </div>
  );
}
