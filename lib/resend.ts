import "server-only";
import { Resend } from "resend";

// Domaine d'expédition temporaire (Resend "onboarding@resend.dev") tant que le
// domaine personnalisé du site n'est pas configuré (voir cahier des charges,
// étape 11). À remplacer par une adresse @<domaine ROF> une fois disponible.
export const EXPEDITEUR = "ROF Connect <onboarding@resend.dev>";

let client: Resend | null = null;

export function getResend() {
  if (!process.env.RESEND_API_KEY) return null;
  if (!client) client = new Resend(process.env.RESEND_API_KEY);
  return client;
}

export async function envoyerCourriel(destinataires: string[], sujet: string, html: string) {
  const resend = getResend();
  if (!resend || destinataires.length === 0) return;
  try {
    await resend.emails.send({
      from: EXPEDITEUR,
      to: destinataires,
      subject: sujet,
      html,
    });
  } catch {
    // Un échec d'envoi de courriel ne doit jamais faire échouer l'action principale.
  }
}
