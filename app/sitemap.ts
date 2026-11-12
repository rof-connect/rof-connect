import type { MetadataRoute } from "next";

const SITE = "https://royalonfield.ca";

/** Pages publiques seulement : aucune fiche de joueuse ni aucun alignement. */
export default function sitemap(): MetadataRoute.Sitemap {
  const pages = [
    "/",
    "/site-v2?sport=baseball",
    "/site-v2/organisation",
    "/site-v2/centre-entrainement",
    "/site-v2/calendrier",
    "/site-v2/varsity",
    "/site-v2/rof-connect",
    "/inscription",
    "/parcours",
  ];
  return pages.map((p) => ({ url: SITE + p }));
}
