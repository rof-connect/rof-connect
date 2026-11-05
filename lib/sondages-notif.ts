import "server-only";
import { chargerSondages } from "@/lib/sondages";
import { courrielSondage, type ActionVote } from "@/lib/sondages-courriel";
import { envoyerADirection } from "@/lib/notifier-direction";

/** Envoie à la Direction le courriel « nouvelle réponse » avec les résultats à jour. */
export async function notifierReponseSondage(pollId: string, nomVotant: string, action: ActionVote) {
  try {
    // Vue « direction » : résultats complets avec les noms.
    const sondage = (await chargerSondages("", true)).find((s) => s.id === pollId);
    if (!sondage) return;
    const { subject, html } = courrielSondage(sondage, nomVotant, action);
    await envoyerADirection(subject, html);
  } catch (e) {
    console.error("sondage: notification", e);
  }
}
