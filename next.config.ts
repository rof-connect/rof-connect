import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // pdfkit lit ses polices (.afm) dans node_modules : il ne doit pas être empaqueté.
  serverExternalPackages: ["pdfkit"],
};

export default nextConfig;
