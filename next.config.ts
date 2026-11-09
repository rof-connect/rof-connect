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
    ];
  },
};

export default nextConfig;
