import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ROF Connect — Royal On Field",
    short_name: "ROF Connect",
    description: "Portail des équipes de Royal On Field — baseball et softball, Québec.",
    start_url: "/membres",
    display: "standalone",
    background_color: "#000000",
    theme_color: "#000000",
    icons: [
      { src: "/icons/192", sizes: "192x192", type: "image/png" },
      { src: "/icons/512", sizes: "512x512", type: "image/png" },
    ],
  };
}
