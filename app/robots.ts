import type { MetadataRoute } from "next";

const SITE = "https://royalonfield.ca";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/site-v2/joueuses/", "/membres/", "/connexion", "/api/", "/joueuse/"] }],
    sitemap: `${SITE}/sitemap.xml`,
  };
}
