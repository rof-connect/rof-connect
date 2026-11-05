import "server-only";
import { getResend, EXPEDITEUR } from "@/lib/resend";

// Destinataires des alertes à la Direction. Remplaçable par la variable COURRIEL_DIRECTION.
const DESTINATAIRES = (process.env.COURRIEL_DIRECTION || process.env.COURRIEL_SONDAGES || "royal@lentrepotdubaseball.com,peco1@icloud.com")
  .split(",")
  .map((e) => e.trim())
  .filter(Boolean);

export const echapper = (s: unknown) =>
  String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

/** Envoie un courriel à la Direction. Ne lève jamais d'erreur : une alerte ratée ne doit pas bloquer l'action. */
export async function envoyerADirection(sujet: string, html: string) {
  try {
    const resend = getResend();
    if (!resend) return;
    await resend.emails.send({ from: EXPEDITEUR, to: DESTINATAIRES, subject: sujet, html });
  } catch (e) {
    console.error("notification direction", e);
  }
}
