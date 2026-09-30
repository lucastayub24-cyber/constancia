import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Constancia",
    short_name: "Constancia",
    description: "Registrá trabajos, fotos, firma, cobros, QR verificable y próximos services.",
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    background_color: "#f6f5ef",
    theme_color: "#17221b",
    orientation: "portrait-primary",
    prefer_related_applications: false,
    categories: ["business","productivity","utilities"],
    icons: [
      { src: "/brand/constancia-app-icon.svg", sizes: "192x192", type: "image/svg+xml", purpose: "any" },
      { src: "/brand/constancia-app-icon.svg", sizes: "512x512", type: "image/svg+xml", purpose: "any maskable" },
      { src: "/brand/constancia-app-icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }
    ],
    shortcuts: [
      { name: "Nueva constancia", short_name: "Nueva", url: "/dashboard/nueva", icons: [{src:"/brand/constancia-icon.svg",sizes:"any",type:"image/svg+xml"}] },
      { name: "Clientes", short_name: "Clientes", url: "/dashboard/clientes", icons: [{src:"/brand/constancia-icon.svg",sizes:"any",type:"image/svg+xml"}] }
    ]
  };
}
