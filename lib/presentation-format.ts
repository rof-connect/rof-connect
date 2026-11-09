// Outils purs (sans accès aux données) pour la page de présentation : lecture des champs saisis par la joueuse.

export type Mesure = { label: string; valeur: string };
export type Evenement = { date: string; nom: string; lieu: string };
export type Profil = {
  taille?: string;
  poids?: string;
  ecole?: string;
  ville?: string;
  moyenne?: string;
  domaine?: string;
  anglais?: string;
  mesures?: Mesure[];
  realisations?: string[];
  video?: string; // identifiant YouTube
  evenements?: Evenement[];
  reference?: { nom: string; role: string; contact: string };
};

const nettoyer = (v: unknown, max: number) =>
  String(v ?? "")
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, "")
    .trim()
    .slice(0, max);

const lignes = (v: unknown, max: number) =>
  String(v ?? "")
    .split("\n")
    .map((l) => nettoyer(l, 160))
    .filter(Boolean)
    .slice(0, max);

/** Identifiant d'une vidéo YouTube à partir d'une adresse (watch, youtu.be, shorts, embed) ou de l'identifiant seul. */
export function idYoutube(brut: unknown): string {
  const v = nettoyer(brut, 200);
  if (!v) return "";
  if (/^[A-Za-z0-9_-]{11}$/.test(v)) return v;
  try {
    const u = new URL(/^https?:\/\//i.test(v) ? v : "https://" + v);
    const hote = u.hostname.toLowerCase().replace(/^(www|m)\./, "");
    let id = "";
    if (hote === "youtu.be") id = u.pathname.slice(1).split("/")[0];
    else if (hote === "youtube.com" || hote === "youtube-nocookie.com") {
      id = u.searchParams.get("v") || (u.pathname.match(/^\/(?:shorts|embed|live)\/([^/?]+)/)?.[1] ?? "");
    }
    return /^[A-Za-z0-9_-]{11}$/.test(id) ? id : "";
  } catch {
    return "";
  }
}

/** Lit le formulaire de la joueuse : une mesure par ligne « Libellé : valeur », un événement par ligne « AAAA-MM-JJ | Nom | Lieu ». */
export function profilDuFormulaire(formData: FormData): Profil {
  const mesures: Mesure[] = lignes(formData.get("mesures"), 8)
    .map((l) => {
      const i = l.indexOf(":");
      return i > 0 ? { label: l.slice(0, i).trim(), valeur: l.slice(i + 1).trim() } : { label: l, valeur: "" };
    })
    .filter((m) => m.label && m.valeur);
  const evenements: Evenement[] = lignes(formData.get("evenements"), 12)
    .map((l) => {
      const [date = "", nom = "", lieu = ""] = l.split("|").map((x) => x.trim());
      return { date, nom, lieu };
    })
    .filter((e) => /^\d{4}-\d{2}-\d{2}$/.test(e.date) && e.nom);
  const refNom = nettoyer(formData.get("ref_nom"), 80);
  return {
    taille: nettoyer(formData.get("taille"), 20),
    poids: nettoyer(formData.get("poids"), 20),
    ecole: nettoyer(formData.get("ecole"), 80),
    ville: nettoyer(formData.get("ville"), 60),
    moyenne: nettoyer(formData.get("moyenne"), 20),
    domaine: nettoyer(formData.get("domaine"), 80),
    anglais: nettoyer(formData.get("anglais"), 30),
    mesures,
    realisations: lignes(formData.get("realisations"), 8),
    video: idYoutube(formData.get("video")),
    evenements,
    reference: refNom
      ? { nom: refNom, role: nettoyer(formData.get("ref_role"), 60), contact: nettoyer(formData.get("ref_contact"), 100) }
      : undefined,
  };
}

/** Texte des champs multi-lignes pour pré-remplir le formulaire. */
export const mesuresEnTexte = (m?: Mesure[]) => (m ?? []).map((x) => `${x.label} : ${x.valeur}`).join("\n");
export const evenementsEnTexte = (e?: Evenement[]) => (e ?? []).map((x) => `${x.date} | ${x.nom} | ${x.lieu}`).join("\n");
