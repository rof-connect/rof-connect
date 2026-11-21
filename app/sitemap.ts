import type { MetadataRoute } from "next";

const SITE = "https://royalonfield.ca";

/** Pages publiques seulement : aucune fiche de joueuse ni aucun alignement. */
export default function sitemap(): MetadataRoute.Sitemap {
  const pages = [
    "/",
    "/baseball",
    "/organisation",
    "/centre-entrainement",
    "/calendrier",
    "/varsity",
    "/rof-connect",
    "/lfjmq",
    "/lfjmq/equipes",
    "/lfjmq/meneuses",
    "/lfjmq/finale",
    "/lfjmq/divisions",
    "/lfjmq/inscription",
    "/lfjmq/en",
    "/lfjmq/en/teams",
    "/lfjmq/en/leaders",
    "/lfjmq/en/final",
    "/lfjmq/en/divisions",
    "/lfjmq/en/register",
    "/inscription",
    "/parcours",
  ];
  return pages.map((p) => ({ url: SITE + p }));
}
