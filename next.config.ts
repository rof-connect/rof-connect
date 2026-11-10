import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // pdfkit lit ses polices (.afm) dans node_modules : il ne doit pas être empaqueté.
  serverExternalPackages: ["pdfkit"],
  // Adresse principale : royalonfield.ca (le .com et les www y redirigent).
  async redirects() {
    return [
      { source: "/:path*", has: [{ type: "host", value: "royalonfield.com" }], destination: "https://royalonfield.ca/:path*", permanent: true },
      { source: "/:path*", has: [{ type: "host", value: "www.royalonfield.com" }], destination: "https://royalonfield.ca/:path*", permanent: true },
      { source: "/:path*", has: [{ type: "host", value: "www.royalonfield.ca" }], destination: "https://royalonfield.ca/:path*", permanent: true },
      // Le nouveau site public remplace l'ancienne page /programme (redirection temporaire : l'ancienne page reste dans le code, pour revenir en arrière il suffit de retirer cette ligne).
      { source: "/programme", destination: "/site-v2", permanent: false },
    ];
  },
};

export default nextConfig;
