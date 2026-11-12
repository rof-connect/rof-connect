import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // pdfkit lit ses polices (.afm) dans node_modules : il ne doit pas être empaqueté.
  serverExternalPackages: ["pdfkit"],
  // Adresse principale : royalonfield.ca (le .com et les www y redirigent).
  // Accueil de royalonfield.ca : le nouveau site public (l'adresse reste royalonfield.ca/). La connexion à ROF Connect reste sur /connexion ;
  // rof-connect.vercel.app/ garde la page de connexion. Pour revenir en arrière : retirer ce bloc.
  async rewrites() {
    return {
      beforeFiles: [
        { source: "/", has: [{ type: "host", value: "royalonfield.ca" }], destination: "/site-v2" },
        // Adresses finales du site public (les pages vivent dans app/site-v2).
        { source: "/baseball", destination: "/site-v2?sport=baseball" },
        { source: "/equipes/:id", destination: "/site-v2/equipes/:id" },
        { source: "/varsity", destination: "/site-v2/varsity" },
        { source: "/centre-entrainement", destination: "/site-v2/centre-entrainement" },
        { source: "/organisation", destination: "/site-v2/organisation" },
        { source: "/calendrier", destination: "/site-v2/calendrier" },
        { source: "/rof-connect", destination: "/site-v2/rof-connect" },
      ],
      afterFiles: [],
      fallback: [],
    };
  },
  async redirects() {
    return [
      { source: "/:path*", has: [{ type: "host", value: "royalonfield.com" }], destination: "https://royalonfield.ca/:path*", permanent: true },
      { source: "/:path*", has: [{ type: "host", value: "www.royalonfield.com" }], destination: "https://royalonfield.ca/:path*", permanent: true },
      { source: "/:path*", has: [{ type: "host", value: "www.royalonfield.ca" }], destination: "https://royalonfield.ca/:path*", permanent: true },
      // Le nouveau site public remplace l'ancienne page /programme (redirection temporaire : l'ancienne page reste dans le code, pour revenir en arrière il suffit de retirer cette ligne).
      { source: "/programme", has: [{ type: "host", value: "royalonfield.ca" }], destination: "/", permanent: false },
      { source: "/programme", destination: "/site-v2", permanent: false },
      // Anciennes adresses /site-v2/… → adresses finales (308). L'accueil /site-v2 est redirigé dans proxy.ts (pour retirer ?sport=).
      { source: "/site-v2/equipes/:id", destination: "/equipes/:id", permanent: true },
      { source: "/site-v2/varsity", destination: "/varsity", permanent: true },
      { source: "/site-v2/centre-entrainement", destination: "/centre-entrainement", permanent: true },
      { source: "/site-v2/organisation", destination: "/organisation", permanent: true },
      { source: "/site-v2/calendrier", destination: "/calendrier", permanent: true },
      { source: "/site-v2/rof-connect", destination: "/rof-connect", permanent: true },
    ];
  },
};

export default nextConfig;
