"use server";

import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getResend, EXPEDITEUR } from "@/lib/resend";
import { calculer, resumeTexte, DIVISIONS, NIVEAUX } from "@/lib/parcours/calcul";
import { genererBilanPdf } from "@/lib/parcours/bilan-pdf";

const COURRIEL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const NOTIFICATION = process.env.COURRIEL_NOTIFICATION || "royal@lentrepotdubaseball.com";

const txt = (v: unknown, max = 200) =>
  String(v ?? "")
    .replace(/[\u0000-\u001f]/g, " ")
    .trim()
    .slice(0, max);
const esc = (s: unknown) =>
  String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

// Limite simple par instance : complète le champ piège contre les robots.
const essais = new Map<string, number[]>();
function limite(ip: string) {
  const maintenant = Date.now();
  const l = (essais.get(ip) ?? []).filter((t) => maintenant - t < 3600e3);
  l.push(maintenant);
  essais.set(ip, l);
  return l.length > 8;
}

export type ReponseParcours = { ok: boolean; message?: string; erreur?: string };

// Page publique : limite par adresse IP et champ piège contre les robots.
export async function soumettreParcours(b: Record<string, unknown>): Promise<ReponseParcours> {
  const h = await headers();
  const ip = (h.get("x-forwarded-for") ?? "").split(",")[0].trim() || "inconnu";
  if (limite(ip)) return { ok: false, erreur: "Trop de tentatives. Réessayez plus tard." };
  if (b.siteweb) return { ok: true }; // piège à robots (champ caché)
  return traiter(b, null);
}

// Espace membres : la réponse est rattachée à la joueuse connectée.
export async function soumettreParcoursMembre(b: Record<string, unknown>): Promise<ReponseParcours> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, erreur: "Connecte-toi pour envoyer le questionnaire." };
  return traiter(b, user.id);
}

async function traiter(b: Record<string, unknown>, profileId: string | null): Promise<ReponseParcours> {

  const niveau = String(b.niveau ?? "");
  const i = {
    prenom: txt(b.prenom, 60),
    nom: txt(b.nom, 60),
    dob: txt(b.dob, 10),
    fin: Number(b.fin),
    niveau: NIVEAUX.includes(niveau) ? niveau : "",
    projet: txt(b.projet, 6),
    duree: txt(b.duree, 3),
    position: txt(b.position, 40),
    equipe: txt(b.equipe, 80),
    divisions: (Array.isArray(b.divisions) ? b.divisions : []).filter((d: unknown) => DIVISIONS.includes(String(d))) as string[],
    anglais: txt(b.anglais, 30),
    domaine: txt(b.domaine, 80),
    objectifs: txt(b.objectifs, 1000),
    parent: txt(b.parent, 80),
    courrielParent: txt(b.courrielParent, 120).toLowerCase(),
    telephone: txt(b.telephone, 30),
  };
  if (!i.prenom || !i.nom) return { ok: false, erreur: "Le prénom et le nom de la joueuse sont requis." };
  if (!COURRIEL.test(i.courrielParent)) return { ok: false, erreur: "Un courriel valide du parent ou tuteur est requis." };
  if (b.consentement !== true) return { ok: false, erreur: "Le consentement du parent ou tuteur est requis." };

  const now = new Date();
  const r = calculer(i, now);
  if (!r) return { ok: false, erreur: "La date de naissance ou l'année de fin du secondaire est invalide." };

  const admin = createAdminClient();
  const { data: ligne, error } = await admin
    .from("parcours_demandes")
    .insert({
      profile_id: profileId,
      reponses: i,
      resultat: {
        repere: r.repere,
        candidats: r.candidats.map((o) => o.k),
        parcours: r.parcours.map((o) => ({ k: o.k, entree: o.entree, saisons: [o.worst, o.best], marge: o.marge })),
        alertes: r.alertes,
      },
      consentement_le: now.toISOString(),
    })
    .select("id")
    .single();
  if (error || !ligne) {
    console.error("parcours: enregistrement", error);
    return { ok: false, erreur: "Une erreur est survenue. Vos réponses n'ont pas été enregistrées." };
  }

  try {
    const resend = getResend();
    if (!resend) throw new Error("RESEND_API_KEY manquant");
    const pdf = await genererBilanPdf(i, r, now);
    const resume = resumeTexte(i, r);
    const nomPdf =
      "Bilan-Parcours-" +
      (`${i.prenom}-${i.nom}`.normalize("NFD").replace(/[^\w-]+/g, "").replace(/-+/g, "-").replace(/^-|-$/g, "") || "joueuse") +
      ".pdf";
    const parcours = r.candidats.map((o) => `${o.k} · ${o.n}`).join(", ");
    const prenom = esc(i.prenom);

    const rep = await resend.emails.send({
      from: EXPEDITEUR,
      to: [i.courrielParent],
      replyTo: NOTIFICATION,
      subject: `Le bilan de parcours de ${i.prenom} — Royal Softball On Field`,
      html:
        `<div style="font-family:Arial,sans-serif;color:#111;max-width:560px;line-height:1.5">` +
        `<div style="background:#000;color:#fff;padding:18px 22px"><div style="color:#D9B44A;font-size:12px;letter-spacing:2px">ROYAL SOFTBALL ON FIELD</div>` +
        `<div style="font-size:20px;font-weight:bold;margin-top:4px">Bilan de parcours de ${prenom}</div></div>` +
        `<div style="padding:18px 22px;border:1px solid #ddd;border-top:0"><p>Bonjour,</p>` +
        `<p>Merci d'avoir rempli le questionnaire de parcours pour ${prenom}. Son bilan est en pièce jointe : sa date repère (<strong>automne ${r.repere}</strong>), la comparaison des parcours et les prochaines étapes.</p>` +
        `<p><strong>Parcours ${r.multi ? "à comparer" : "suggéré"} :</strong> ${esc(parcours)}</p>` +
        `<p style="font-size:13px;color:#666">Ce bilan est établi automatiquement à partir de vos réponses. Il ne remplace ni une décision d'admissibilité du NCAA, ni le plan individuel complet. Nous communiquerons avec vous pour planifier une rencontre.</p>` +
        `<p style="margin-bottom:0">Royal Softball On Field · Repentigny, Lanaudière</p></div></div>`,
      attachments: [{ filename: nomPdf, content: pdf }],
    });
    if (rep.error) throw new Error(rep.error.message);

    await resend.emails
      .send({
        from: EXPEDITEUR,
        to: [NOTIFICATION],
        replyTo: i.courrielParent,
        subject: `Nouveau questionnaire de parcours : ${i.prenom} ${i.nom}`,
        html: `<pre style="font-family:ui-monospace,Menlo,monospace;font-size:13px;white-space:pre-wrap">${esc(resume)}</pre>`,
        attachments: [{ filename: nomPdf, content: pdf }],
      })
      .catch((e) => console.error("parcours: notification", e));

    await admin.from("parcours_demandes").update({ courriel_envoye_le: new Date().toISOString() }).eq("id", ligne.id);
    return { ok: true };
  } catch (e) {
    console.error("parcours: bilan/courriel", e);
    await admin
      .from("parcours_demandes")
      .update({ erreur: String((e as Error).message).slice(0, 300) })
      .eq("id", ligne.id);
    // Les réponses sont enregistrées : la Direction peut renvoyer le bilan à la main.
    return {
      ok: true,
      message: "Vos réponses sont enregistrées. Le courriel n'a pas pu être envoyé; nous vous écrirons sous peu.",
    };
  }
}
