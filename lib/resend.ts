import "server-only";
import { Resend } from "resend";

export const EXPEDITEUR = "ROF Connect <notifications@rofconnect.lentrepotdubaseball.com>";

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
