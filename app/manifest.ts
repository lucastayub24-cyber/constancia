import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Constancia",
    short_name: "Constancia",
    description: "Registrá trabajos, fotos, firma, cobros, QR verificable y próximos services.",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#f6f5ef",
    theme_color: "#17221b",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/brand/constancia-app-icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/brand/constancia-app-icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
