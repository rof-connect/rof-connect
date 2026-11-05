import "server-only";
import { getResend, EXPEDITEUR } from "@/lib/resend";
import { chargerSondages } from "@/lib/sondages";
import { courrielSondage, type ActionVote } from "@/lib/sondages-courriel";

// Destinataires des alertes de sondage (la Direction). Remplaçable par la variable COURRIEL_SONDAGES.
const DESTINATAIRES = (process.env.COURRIEL_SONDAGES || "royal@lentrepotdubaseball.com,peco1@icloud.com")
  .split(",")
  .map((e) => e.trim())
  .filter(Boolean);

/** Envoie à la Direction le courriel « nouvelle réponse » avec les résultats à jour. Ne lève jamais d'erreur. */
export async function notifierReponseSondage(pollId: string, nomVotant: string, action: ActionVote) {
  try {
    const resend = getResend();
    if (!resend) return;
    // Vue « direction » : résultats complets avec les noms.
    const sondage = (await chargerSondages("", true)).find((s) => s.id === pollId);
    if (!sondage) return;
    const { subject, html } = courrielSondage(sondage, nomVotant, action);
    await resend.emails.send({ from: EXPEDITEUR, to: DESTINATAIRES, subject, html });
  } catch (e) {
    console.error("sondage: notification", e);
  }
}
