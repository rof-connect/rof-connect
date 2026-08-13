const ENTETE = `
<div style="font-family:Arial,sans-serif;background:#05070C;padding:24px">
  <div style="max-width:480px;margin:0 auto;background:#0E1626;border-radius:12px;padding:24px;color:#E7EDF7">
    <div style="color:#7FC4EC;font-size:12px;letter-spacing:2px;text-transform:uppercase;margin-bottom:8px">Royal On Field</div>
`;
const PIED = `
    <p style="margin-top:24px;font-size:12px;color:#93A1BC">ROF Connect — tu reçois ce courriel parce que tu es membre d'une équipe Royal On Field.</p>
  </div>
</div>
`;

export function courrielNouvelEvenement(equipe: string, titre: string, date: string, lieu: string | null) {
  return `${ENTETE}
    <h1 style="font-size:20px;margin:0 0 12px">Nouvel événement — ${equipe}</h1>
    <p style="font-size:16px;font-weight:bold;margin:0 0 4px">${titre}</p>
    <p style="margin:0 0 4px;color:#E7EDF7">${date}</p>
    ${lieu ? `<p style="margin:0 0 12px;color:#93A1BC">📍 ${lieu}</p>` : ""}
    <p style="color:#93A1BC">Connecte-toi à ROF Connect pour confirmer ta présence.</p>
  ${PIED}`;
}

export function courrielNouveauMessage(auteur: string, apercu: string) {
  return `${ENTETE}
    <h1 style="font-size:20px;margin:0 0 12px">Nouveau message privé</h1>
    <p style="margin:0 0 4px"><strong>${auteur}</strong> t'a écrit :</p>
    <p style="margin:0 0 12px;color:#E7EDF7">${apercu}</p>
    <p style="color:#93A1BC">Connecte-toi à ROF Connect pour répondre.</p>
  ${PIED}`;
}

export function courrielRappelPresence(equipe: string, titre: string, date: string, heure: string | null) {
  return `${ENTETE}
    <h1 style="font-size:20px;margin:0 0 12px">Rappel — confirme ta présence</h1>
    <p style="margin:0 0 4px">${equipe} a un événement dans 48 heures :</p>
    <p style="font-size:16px;font-weight:bold;margin:0 0 4px">${titre}</p>
    <p style="margin:0 0 12px;color:#E7EDF7">${date}${heure ? " · " + heure : ""}</p>
    <p style="color:#93A1BC">Tu n'as pas encore répondu — connecte-toi à ROF Connect pour confirmer.</p>
  ${PIED}`;
}
